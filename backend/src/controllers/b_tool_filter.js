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
    const { search, includeNull, showNull = 'false', parent_id } = req.query
    const page = parseInt(req.query.page || 1, 10)
    const limit = parseInt(req.query.limit || 15, 10)
    const offset = (page - 1) * limit

    // Определение типа JOIN в зависимости от параметра includeNull
    const joinType = includeNull === 'true' ? 'LEFT' : 'INNER'

    // Формирование условия поиска и фильтрации по NULL
    const searchCondition = search
      ? `WHERE tool_nom.name ILIKE '%${search.replace(/'/g, "''")}%'`
      : ''
    const nullFilter =
      showNull === 'false'
        ? 'AND tool_nom.mat_id IS NOT NULL AND tool_nom.type_id IS NOT NULL AND tool_nom.group_id IS NOT NULL'
        : ''
    const parentIdCondition = parent_id
      ? `AND tool_nom.parent_id = ${parent_id}`
      : ''

    // Запрос на подсчет общего количества записей
    const countQuery = `
      SELECT COUNT(*)
      FROM dbo.tool_nom as tool_nom
             ${joinType} JOIN dbo.tool_group ON tool_nom.group_id = tool_group.id
             ${joinType} JOIN dbo.tool_mat ON tool_nom.mat_id = tool_mat.id
             ${joinType} JOIN dbo.tool_type ON tool_nom.type_id = tool_type.id
      ${searchCondition} ${nullFilter} ${parentIdCondition}
    `

    // Запрос на получение инструментов с учетом новых условий
    const toolQuery = `
      SELECT tool_nom.id,
             tool_nom.name,
             tool_nom.group_id,
             tool_nom.mat_id,
             tool_nom.type_id,
             tool_group.name as group_name,
             tool_mat.name as mat_name,
             tool_type.name as type_name,
             tool_nom.property
      FROM dbo.tool_nom as tool_nom
             ${joinType} JOIN dbo.tool_group ON tool_nom.group_id = tool_group.id
             ${joinType} JOIN dbo.tool_mat ON tool_nom.mat_id = tool_mat.id
             ${joinType} JOIN dbo.tool_type ON tool_nom.type_id = tool_type.id
      ${searchCondition} ${nullFilter} ${parentIdCondition}
      ORDER BY tool_nom.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Выполнение запросов
    const [countResult, toolsResult, paramsMapping] = await Promise.all([
      pool.query(countQuery),
      pool.query(toolQuery),
      getParamsMapping(),
    ])

    const totalCount = countResult.rows[0].count

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
        mat: { name: tool.mat_name, id: tool.mat_id },
        type: { name: tool.type_name, id: tool.type_id },
        group: { name: tool.group_name, id: tool.group_id },
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
      paramsList,
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

async function getToolParams(req, res) {
  try {
    const query = 'SELECT id, info FROM dbo.tool_params'
    const result = await pool.query(query)
    res.json(result.rows) // Отправляем результат запроса обратно клиенту
  } catch (error) {
    console.error('Error fetching tool parameters:', error)
    res.status(500).send('Internal Server Error') // Отправляем сообщение об ошибке
  }
}

module.exports = { getToolParams, getTools }
