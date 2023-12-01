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

async function getToolParams() {
  try {
    const { rows } = await pool.query(
      'SELECT id, params, info FROM dbo.tool_params'
    )
    return rows // Возвращает массив параметров
  } catch (error) {
    throw error
  }
}

module.exports = { getToolParams }
