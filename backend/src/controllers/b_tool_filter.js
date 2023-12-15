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

module.exports = { getTools }
