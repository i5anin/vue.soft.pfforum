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
    // Определите начало и конец недели, начиная с текущего или последнего прошедшего четверга
    const today = new Date()
    const thisThursday = new Date(today)
    thisThursday.setDate(
      thisThursday.getDate() - ((thisThursday.getDay() + 3) % 7)
    ) // Находим прошлый четверг, если сегодня не четверг
    const nextThursday = new Date(thisThursday)
    nextThursday.setDate(nextThursday.getDate() + 7) // Следующий четверг

    const startDate = thisThursday.toISOString().split('T')[0]
    const endDate = nextThursday.toISOString().split('T')[0]

    const query = `WITH RECURSIVE
                     TreePath AS (SELECT id,
                                         name,
                                         parent_id,
                                         name AS path
                                  FROM dbo.tool_tree
                                  WHERE parent_id = 1

                                  UNION ALL

                                  SELECT tt.id,
                                         tt.name,
                                         tt.parent_id,
                                         CONCAT(tp.path, ' / ', tt.name)
                                  FROM dbo.tool_tree tt
                                         JOIN TreePath tp ON tt.parent_id = tp.id),
                     damaged AS (SELECT tool_nom.id                     AS id_tool,
                                        tool_nom.parent_id,
                                        tool_nom.name,
                                        tool_nom.sklad,
                                        tool_nom.norma,
                                        tool_nom.norma - tool_nom.sklad AS zakaz
                                 FROM dbo.tool_nom
                                        LEFT JOIN dbo.tool_history_damaged ON tool_nom.id = tool_history_damaged.id_tool
                                   AND tool_history_damaged.timestamp >= '${startDate}'::date
                                   AND tool_history_damaged.timestamp < '${endDate}'::date
                                 WHERE tool_nom.norma IS NOT NULL
                                   AND (tool_nom.norma - tool_nom.sklad) > 0
                                 GROUP BY tool_nom.id,
                                          tool_nom.parent_id,
                                          tool_nom.name,
                                          tool_nom.sklad,
                                          tool_nom.norma)
                   SELECT d.parent_id,
                          tp.path,
                          JSON_AGG(
                            JSON_BUILD_OBJECT(
                              'name', d.name,
                              'sklad', d.sklad,
                              'norma', d.norma,
                              'zakaz', d.zakaz
                            )
                          ) AS tools
                   FROM damaged d
                          JOIN TreePath tp ON d.parent_id = tp.id
                   GROUP BY d.parent_id, tp.path
                   ORDER BY tp.path;
    `
    const { rows } = await pool.query(query)
    res.json(rows)
  } catch (error) {
    console.error('Ошибка при получении данных для таблицы:', error)
    res.status(500).send('Ошибка при получении данных для таблицы')
  }
}

module.exports = {
  getTableReportData,
}

module.exports = {
  getTableReportData,
}
