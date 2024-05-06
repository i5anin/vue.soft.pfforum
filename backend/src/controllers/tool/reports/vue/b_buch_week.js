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
    )
    const nextThursday = new Date(thisThursday)
    nextThursday.setDate(nextThursday.getDate() + 7)

    const startDate = thisThursday.toISOString().split('T')[0]
    const endDate = nextThursday.toISOString().split('T')[0]

    console.log(startDate, endDate)

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
                                         JOIN TreePath tp ON tt.parent_id = tp.id
                     ),
                     last_week_tool_history AS (
                     SELECT thn.id_tool,
                           thn.quantity,
                           tnom.parent_id,
                           tnom.name
                    FROM dbo.tool_history_nom thn
                    JOIN dbo.tool_nom tnom ON thn.id_tool = tnom.id
                    WHERE thn.timestamp BETWEEN '${startDate}'::date AND '${endDate}'::date
                     )
                SELECT lwt.parent_id,
                       tp.path,
                       JSON_AGG(JSON_BUILD_OBJECT('name', lwt.name,
                                                  'quantity', lwt.quantity
                               )
                      ) AS tools
                FROM last_week_tool_history lwt
                JOIN TreePath tp ON lwt.parent_id = tp.id
                GROUP BY lwt.parent_id, tp.path
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
