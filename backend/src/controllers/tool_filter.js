const { Pool } = require('pg')
const { getNetworkDetails } = require('../db_type')
const config = require('../config')

// Получение настроек для подключения к базе данных
const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest

// Создание соединения с базой данных
const pool = new Pool(dbConfig)

async function getTools(req, res) {
  try {
    // Получение параметров запроса
    const { search } = req.query
    const page = parseInt(req.query.page || 1, 10)
    const limit = parseInt(req.query.limit || 15, 10)
    const offset = (page - 1) * limit

    // Подготовка параметров для запросов
    const searchCondition = search ? `WHERE tool_nom.name ILIKE $1` : ''
    const limitOffsetCondition = search
      ? `LIMIT $2::bigint OFFSET $3::bigint`
      : `LIMIT $1::bigint OFFSET $2::bigint`
    const queryParams = search
      ? [`%${search}%`, limit, offset]
      : [limit, offset]

    // Запрос на получение общего количества инструментов
    const countQuery = `
      SELECT COUNT(*)::INTEGER
      FROM dbo.tool_nom ${searchCondition}
    `

    // Запрос на получение инструментов
    const toolQuery = `
      SELECT tool_nom.id,
             tool_nom.name,
             tool_nom.group_id,
             tool_nom.mat_id,
             tool_nom.type_id,
             tool_group.name as group_name,
             tool_mat.name   as mat_name,
             tool_type.name  as type_name,
             tool_nom.property
      FROM dbo.tool_nom as tool_nom
             LEFT JOIN dbo.tool_group ON tool_nom.group_id = tool_group.id
             LEFT JOIN dbo.tool_mat ON tool_nom.mat_id = tool_mat.id
             LEFT JOIN dbo.tool_type ON tool_nom.type_id = tool_type.id
      ${searchCondition}
      ORDER BY tool_nom.id DESC
      ${limitOffsetCondition}
    `

    // Функция для получения сопоставления параметров
    async function getParamsMapping() {
      const query = 'SELECT id, params FROM dbo.tool_params'
      const result = await pool.query(query)
      return result.rows.reduce((acc, row) => {
        acc[row.id] = row.params
        return acc
      }, {})
    }

    // Выполнение запросов
    const [countResult, tools, paramsMapping] = await Promise.all([
      pool.query(countQuery, search ? [`%${search}%`] : []),
      pool.query(toolQuery, queryParams),
      getParamsMapping(),
    ])

    const totalCount = countResult.rows[0].count

    // Форматирование данных инструментов
    const formattedTools = tools.rows.map((tool) => {
      let formattedProperty = {}

      // Проверка на null или undefined перед парсингом JSON
      if (tool.property) {
        const propertyObj = JSON.parse(tool.property)

        formattedProperty = Object.entries(propertyObj).reduce(
          (acc, [key, value]) => {
            // Убедитесь, что paramsMapping[key] существует
            if (paramsMapping[key]) acc[paramsMapping[key]] = value
            return acc
          },
          {}
        )
      }

      return {
        id: tool.id,
        name: tool.name,
        mat: { name: tool.mat_name, id: tool.mat_id },
        type: { name: tool.type_name, id: tool.type_id },
        group: { name: tool.group_name, id: tool.group_id },
        property: formattedProperty,
      }
    })

    res.json({
      currentPage: page,
      itemsPerPage: limit,
      totalCount,
      tools: formattedTools,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

async function getToolParams() {
  try {
    // Выполняем запрос к базе данных
    const query = 'SELECT id, params, info FROM dbo.tool_params'
    const result = await pool.query(query)

    // Возвращаем результат запроса
    return result.rows // Это массив объектов с полями id, params, info
  } catch (error) {
    // Логируем ошибку для отладки
    console.error('Error fetching tool parameters:', error)

    // Перебрасываем ошибку для дальнейшей обработки или логирования
    throw error
  }
}

module.exports = { getToolParams, getTools }
