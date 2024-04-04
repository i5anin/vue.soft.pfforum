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
    const query = `WITH RECURSIVE
                     TreePath AS (SELECT id,
                                         name,
                                         parent_id,
                                         name AS path -- Начальный путь это просто имя текущей записи
                                  FROM dbo.tool_tree
                                  WHERE parent_id = 1 -- Стартуем с корня иерархии

                                  UNION ALL

                                  SELECT tt.id,
                                         tt.name,
                                         tt.parent_id,
                                         CONCAT(tp.path, ' / ', tt.name) -- Строим путь, добавляя имя текущей записи
                                  FROM dbo.tool_tree tt
                                         JOIN TreePath tp ON tt.parent_id = tp.id -- Присоединяем дочерние элементы к родительским
                     ),
                     damaged AS (SELECT tool_nom.id                                     AS id_tool,
                                        tool_nom.parent_id,
                                        tool_nom.name,
                                        tool_nom.sklad, -- Добавляем это поле
                                        tool_nom.norma, -- Добавляем это поле
                                        tool_nom.norma - tool_nom.sklad                 AS zakaz,
                                        COALESCE(SUM(tool_history_damaged.quantity), 0) AS damaged_last_7_days
                                 FROM dbo.tool_nom
                                        LEFT JOIN
                                      dbo.tool_history_damaged ON tool_nom.id = tool_history_damaged.id_tool
                                        AND tool_history_damaged.timestamp >= CURRENT_DATE - INTERVAL '7 days'
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
                              'zakaz', d.zakaz,
                              'damaged_last_7_days', d.damaged_last_7_days
                            )
                          ) AS tools
                   FROM damaged d
                          JOIN TreePath tp ON d.parent_id = tp.id
                   GROUP BY d.parent_id, tp.path
                   ORDER BY tp.path;
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
