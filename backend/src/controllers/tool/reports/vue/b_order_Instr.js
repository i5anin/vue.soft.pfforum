const { Pool } = require('pg')
const ExcelJS = require('exceljs')
const { getNetworkDetails } = require('../../../../db_type')
const config = require('../../../../config')
const nodemailer = require('nodemailer')
const { emailConfig } = require('../../../../config')

// Настройка подключения к базе данных
const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest
const pool = new Pool(dbConfig)

async function getTableReportData(req, res) {
  try {
    const query = `
      WITH damaged AS (
        SELECT
          tool_nom.id AS id_tool,
          tool_nom.parent_id,
          tool_nom.name,
          tool_nom.norma - tool_nom.sklad AS zakaz,
          COALESCE(SUM(tool_history_damaged.quantity), 0) AS damaged_last_7_days
        FROM
          dbo.tool_nom
        LEFT JOIN
          dbo.tool_history_damaged ON tool_nom.id = tool_history_damaged.id_tool
          AND tool_history_damaged.timestamp >= CURRENT_DATE - INTERVAL '7 days'
        WHERE
          tool_nom.norma IS NOT NULL
          AND (tool_nom.norma - tool_nom.sklad) > 0
        GROUP BY
          tool_nom.id,
          tool_nom.parent_id,
          tool_nom.name,
          tool_nom.sklad,
          tool_nom.norma
      )
      SELECT
        parent_id,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'name', name,
            'zakaz', zakaz,
            'damaged_last_7_days', damaged_last_7_days
          )
        ) AS tools
      FROM damaged
      GROUP BY parent_id
      ORDER BY parent_id;
    `
    const { rows } = await pool.query(query)
    res.json(rows) // Отправляем данные в формате JSON
  } catch (error) {
    console.error('Ошибка при получении данных для таблицы:', error)
    res.status(500).send('Ошибка при получении данных для таблицы')
  }
}

module.exports = {
  getTableReportData,
}
