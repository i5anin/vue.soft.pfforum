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

module.exports = {
  getToolParams,
  updateToolParam,
  deleteToolParam,
  addToolParam,
}
