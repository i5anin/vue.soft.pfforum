const { Pool } = require('pg')
const { getNetworkDetails } = require('../db_type')
const config = require('../config')

const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest

// Создание пула соединений с базой данных
const pool = new Pool(dbConfig)

// Экспорт функции для получения дерева инструментов

async function getDamaged(req, res) {
  try {
    const page = parseInt(req.query.page || 1, 10)
    const limit = parseInt(req.query.limit || 15, 10)
    const offset = (page - 1) * limit

    // Запрос для подсчета общего количества уникальных id
    const countQuery = `
      SELECT COUNT(DISTINCT id)
      FROM dbo.tool_history_damaged;
    `

    // Запрос для получения агрегированных данных истории повреждений
    const dataQuery = `
      SELECT
        tool_history_damaged.id,
        tool_history_damaged.id_tool,
        tool_nom.name AS tool_name,
        tool_history_damaged.id_user,
        operators.fio,
        tool_history_damaged.cnc_code,
        cnc.cnc_name,
        tool_history_damaged.comment
      FROM dbo.tool_history_damaged
      INNER JOIN dbo.tool_nom ON tool_history_damaged.id_tool = tool_nom.id
      INNER JOIN dbo.operators ON tool_history_damaged.id_user = operators.id
      LEFT JOIN dbo.cnc ON tool_history_damaged.cnc_code = cnc.cnc_code
      ORDER BY tool_history_damaged.id
      LIMIT ${limit}
      OFFSET ${offset};
    `

    const countResult = await pool.query(countQuery)
    const dataResult = await pool.query(dataQuery)

    res.json({
      currentPage: page,
      itemsPerPage: limit,
      totalCount: parseInt(countResult.rows[0].count, 10),
      toolsHistory: dataResult.rows,
    })
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Ошибка при выполнении запроса')
  }
}

module.exports = {
  getDamaged,
}
