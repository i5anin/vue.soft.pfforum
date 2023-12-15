// Импорт зависимостей
const { Pool } = require('pg')
const { getNetworkDetails } = require('../db_type')
const config = require('../config')

const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest
// Создание пула подключений к БД
const pool = new Pool(dbConfig)

async function getParamsMapping() {
  const query = 'SELECT id, info FROM dbo.tool_params'
  const result = await pool.query(query)
  return result.rows.reduce((acc, row) => {
    acc[row.id] = { info: row.info }
    return acc
  }, {})
}

async function getTools(req, res) {
  try {
    // Получение параметров запроса
    const { search, parent_id } = req.query
    const page = parseInt(req.query.page || 1, 10)
    const limit = parseInt(req.query.limit || 15, 10)
    const offset = (page - 1) * limit

    // Формирование условия поиска
    const searchCondition = search
      ? `WHERE tool_nom.name ILIKE '%${search.replace(/'/g, "''")}%'`
      : ''
    const parentIdCondition = parent_id
      ? `AND tool_nom.parent_id = ${parent_id}`
      : ''

    // Запрос на подсчет общего количества записей
    const countQuery = `
      SELECT COUNT(*)
      FROM dbo.tool_nom as tool_nom
      ${searchCondition} ${parentIdCondition}
    `

    // Запрос на получение инструментов
    const toolQuery = `
      SELECT tool_nom.id,
             tool_nom.name,
             tool_nom.property
      FROM dbo.tool_nom as tool_nom
      ${searchCondition} ${parentIdCondition}
      ORDER BY tool_nom.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Выполнение запросов
    const [countResult, toolsResult, paramsMapping] = await Promise.all([
      pool.query(countQuery),
      pool.query(toolQuery),
      getParamsMapping(),
    ])

    const totalCount = parseInt(countResult.rows[0].count, 10)

    // Форматирование данных инструментов
    const formattedTools = toolsResult.rows.map((tool) => {
      let formattedProperty = {}

      if (tool.property) {
        const propertyObj = tool.property

        formattedProperty = Object.entries(propertyObj).reduce(
          (acc, [key, value]) => {
            if (value !== '' && paramsMapping[key]) {
              acc[key] = {
                info: paramsMapping[key].info,
                value: value,
              }
            }
            return acc
          },
          {}
        )
      }

      return {
        id: tool.id,
        name: tool.name,
        property: formattedProperty,
      }
    })

    // Сбор уникальных ключей параметров
    const uniqueParams = new Set()
    toolsResult.rows.forEach((tool) => {
      if (tool.property) {
        Object.keys(tool.property).forEach((key) => uniqueParams.add(key))
      }
    })

    // Получение дополнительных данных для параметров
    const paramsList = Array.from(uniqueParams).map((key) => ({
      key: key,
      label: paramsMapping[key]?.info || key,
    }))

    // Формирование и отправка ответа
    res.json({
      currentPage: page,
      itemsPerPage: limit,
      totalCount,
      tools: formattedTools,
      paramsList,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

async function deleteTool(req, res) {
  const { id } = req.params
  try {
    await pool.query(
      `DELETE
       FROM dbo.tool_nom
       WHERE id = $1`,
      [id]
    )
    res.json({ result: true })
  } catch (error) {
    console.error(error)
    res.status(500).send(error.message)
  }
}

async function addTool(req, res) {
  const { name, property } = req.body

  try {
    // Преобразование объекта property в строку JSON для хранения в базе данных
    const propertyString = JSON.stringify(property)

    // Вставка данных инструмента
    const toolInsertResult = await pool.query(
      'INSERT INTO dbo.tool_nom (name, property) VALUES ($1, $2) RETURNING id',
      [name, propertyString]
    )

    const toolId = toolInsertResult.rows[0].id

    // Дополнительная логика обработки параметров, если необходимо
    // ...

    res.json({ toolId })
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

async function editTool(req, res) {
  const { id } = req.params
  const { name, group_id, mat_id, type_id, kolvo_sklad, norma, zakaz } =
    req.body

  try {
    const result = await pool.query(
      'UPDATE dbo.tool_nom SET name=$1, group_id=$2, mat_id=$3, type_id=$4, kolvo_sklad=$5, norma=$6, zakaz=$7, radius=$8, shag=$9, gabarit=$10, width=$11, diam=$12, geometry=$13 WHERE id=$14 RETURNING *',
      [name, group_id, mat_id, type_id, kolvo_sklad, norma, zakaz, id] // Add geometry here
    )

    if (result.rowCount > 0) {
      res.json({
        message: 'Инструмент успешно обновлен.',
        tool: result.rows[0],
      })
    } else {
      res.status(404).send('Инструмент с указанным ID не найден.')
    }
  } catch (err) {
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).send(err.message)
  }
}

async function getToolById(req, res) {
  const { id } = req.params // Получение ID инструмента из параметров маршрута

  try {
    const query = 'SELECT * FROM dbo.tool_nom WHERE id = $1'
    const result = await pool.query(query, [id])

    if (result.rows.length > 0) {
      res.json(result.rows[0]) // Отправка данных инструмента
    } else {
      res.status(404).send('Инструмент не найден')
    }
  } catch (error) {
    console.error('Ошибка при получении инструмента:', error)
    res.status(500).send('Внутренняя ошибка сервера')
  }
}

// Экспорт контроллеров
module.exports = {
  getToolById,
  getTools,
  addTool,
  editTool,
  deleteTool,
}
