const { Pool } = require('pg')
const { getNetworkDetails } = require('../../../db_type')
const config = require('../../../config')

// Получение настроек для подключения к базе данных
const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest

// Создание соединения с базой данных
const pool = new Pool(dbConfig)

async function addToolParam(req, res) {
  const { info } = req.body

  try {
    const query = 'INSERT INTO dbo.tool_params (info) VALUES ($1) RETURNING *'
    const result = await pool.query(query, [info])

    if (result.rows.length > 0) {
      res.status(201).json(result.rows[0])
    } else {
      res.status(400).send('Parameter could not be added')
    }
  } catch (error) {
    console.error('Error adding new tool parameter:', error)
    res.status(500).send('Internal Server Error')
  }
}

async function getToolParams(req, res) {
  try {
    // Query modified to include ORDER BY clause for sorting by id in ascending order
    const query = 'SELECT id, info FROM dbo.tool_params ORDER BY id ASC'
    const result = await pool.query(query)
    res.json(result.rows) // Send the query result back to the client
  } catch (error) {
    console.error('Error fetching tool parameters:', error)
    res.status(500).send('Internal Server Error') // Send error message
  }
}

async function deleteToolParam(req, res) {
  const id = req.params.id // Получение ID из параметров запроса
  try {
    const query = 'DELETE FROM dbo.tool_params WHERE id = $1'
    const result = await pool.query(query, [id])

    if (result.rowCount === 0) {
      // Нет такого ID в базе данных
      res.status(404).send('Parameter not found')
    } else {
      res.status(200).send('Parameter deleted successfully')
    }
  } catch (error) {
    console.error('Error deleting tool parameter:', error)
    res.status(500).send('Internal Server Error')
  }
}

async function updateToolParam(req, res) {
  const id = req.params.id // Получение ID из параметров запроса
  const { info } = req.body // Получение нового названия из тела запроса

  try {
    const query = 'UPDATE dbo.tool_params SET info = $1 WHERE id = $2'
    const result = await pool.query(query, [info, id])

    if (result.rowCount === 0) {
      // Нет такого ID в базе данных
      res.status(404).send('Parameter not found')
    } else {
      res.status(200).send('Parameter updated successfully')
    }
  } catch (error) {
    console.error('Error updating tool parameter:', error)
    res.status(500).send('Internal Server Error')
  }
}

async function getFilterParamsByParentId(req, res) {
  const { parent_id } = req.params // Получаем parent_id из параметров запроса

  if (!parent_id) {
    return res.status(400).json({ error: 'Parent ID is required' })
  }

  try {
    // Получаем маппинг параметров
    const paramsMapping = await getParamsMapping()

    // SQL запрос для извлечения всех свойств инструментов в определенной категории
    const query = `
      SELECT tool_nom.property
      FROM dbo.tool_nom
      WHERE tool_nom.parent_id = $1`

    const { rows } = await pool.query(query, [parent_id])

    // Агрегируем уникальные значения для каждого параметра
    const paramsAggregation = {}

    rows.forEach((row) => {
      Object.entries(row.property || {}).forEach(([key, value]) => {
        if (!paramsAggregation[key]) {
          paramsAggregation[key] = new Set()
        }
        paramsAggregation[key].add(value)
      })
    })

    // Преобразование агрегированных данных в требуемый формат
    const paramsList = Object.entries(paramsAggregation)
      .map(([key, valuesSet]) => ({
        key: key,
        label: paramsMapping[key] ? paramsMapping[key].info : key, // Используем маппинг для заполнения label
        values: Array.from(valuesSet),
      }))
      .filter((param) => param.values.length > 1) // Исключаем параметры с одним значением

    // Отправка результата
    res.json(paramsList)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
}

module.exports = {
  getToolParams,
  updateToolParam,
  deleteToolParam,
  addToolParam,
  getFilterParamsByParentId,
}
