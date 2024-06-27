const { Pool } = require('pg')
const getDbConfig = require('../../../config/databaseConfig')

// Получение настроек для подключения к базе данных
const dbConfig = getDbConfig()

// Создание соединения с базой данных
const pool = new Pool(dbConfig)

async function addToolParam(req, res) {
  const { label } = req.body

  try {
    const query = 'INSERT INTO dbo.tool_params (label) VALUES ($1) RETURNING *'
    const result = await pool.query(query, [label])

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

async function moveToolParam(req, res) {
  const { id } = req.params // Получаем ID из URL-параметра
  const { action } = req.body // Получаем действие из тела запроса

  try {
    // Получаем текущий порядок параметра
    const currentOrderQuery =
      'SELECT param_order FROM dbo.tool_params WHERE id = $1'
    const currentOrderResult = await pool.query(currentOrderQuery, [id])
    if (currentOrderResult.rows.length === 0) {
      res.status(404).send('Parameter not found')
      return
    }
    const currentOrder = currentOrderResult.rows[0].param_order

    // Определяем новый порядок в зависимости от действия
    const newOrderQuery =
      action === 'moveUp'
        ? 'SELECT id, param_order FROM dbo.tool_params WHERE param_order < $1 ORDER BY param_order DESC LIMIT 1'
        : 'SELECT id, param_order FROM dbo.tool_params WHERE param_order > $1 ORDER BY param_order ASC LIMIT 1'

    const newOrderResult = await pool.query(newOrderQuery, [currentOrder])
    if (newOrderResult.rowCount === 0) {
      res.status(400).send('No adjacent parameters to swap with')
      return
    }

    const adjacentParam = newOrderResult.rows[0]
    const adjacentOrderId = adjacentParam.id
    const adjacentOrder = adjacentParam.param_order

    // Запускаем транзакцию для обновления порядка
    await pool.query('BEGIN')
    const updateCurrentQuery =
      'UPDATE dbo.tool_params SET param_order = $1 WHERE id = $2'
    await pool.query(updateCurrentQuery, [adjacentOrder, id])
    const updateAdjacentQuery =
      'UPDATE dbo.tool_params SET param_order = $1 WHERE id = $2'
    await pool.query(updateAdjacentQuery, [currentOrder, adjacentOrderId])
    await pool.query('COMMIT')

    res.status(200).send('Parameter order updated successfully')
  } catch (error) {
    await pool.query('ROLLBACK')
    console.error('Error moving tool parameter:', error)
    res.status(500).send('Internal Server Error')
  }
}

async function getToolParams(req, res) {
  try {
    const sortBy = req.query.sort || 'param_order' // Сортировка по умолчанию: param_order
    const query = `SELECT id, label, param_order FROM dbo.tool_params ORDER BY ${sortBy} ASC`
    const result = await pool.query(query)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching tool parameters:', error)
    res.status(500).send('Internal Server Error')
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
  const { label } = req.body // Получение нового названия из тела запроса

  try {
    const query = 'UPDATE dbo.tool_params SET label = $1 WHERE id = $2'
    const result = await pool.query(query, [label, id])

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

module.exports = {
  getToolParams,
  updateToolParam,
  deleteToolParam,
  addToolParam,
  moveToolParam,
}
