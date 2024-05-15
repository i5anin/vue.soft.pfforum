const { Pool } = require('pg')
const getDbConfig = require('../../../../databaseConfig')

// Настройка подключения к базе данных

const dbConfig = getDbConfig()
const pool = new Pool(dbConfig)

async function getTableReportData(req, res) {
  try {
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
                     totals AS (SELECT group_id,
                                       SUM(sklad) AS group_total_sklad
                                FROM dbo.tool_nom
                                WHERE group_id IS NOT NULL AND group_id <> 0
                                GROUP BY group_id),
                     damaged AS (SELECT tn.id                                     AS id_tool,
                                        tn.parent_id,
                                        tn.group_id,
                                        tn.group_standard,
                                        tn.name,
                                        tn.sklad,
                                        tn.norma,
                                        CASE
                                          WHEN tn.group_id IS NOT NULL AND tn.group_id <> 0
                                            THEN GREATEST(tn.norma - t.group_total_sklad, 0)
                                          ELSE GREATEST(tn.norma - tn.sklad, 0)
                                          END                                            AS zakaz,
                                        COALESCE(SUM(thd.quantity), 0)           AS damaged_last_7_days,
                                        t.group_total_sklad                      AS group_sum
                                 FROM dbo.tool_nom tn
                                        LEFT JOIN dbo.tool_history_damaged thd ON tn.id = thd.id_tool
                                   AND thd.timestamp >= CURRENT_DATE - INTERVAL '7 days'
                                        LEFT JOIN totals t ON tn.group_id = t.group_id
                                 GROUP BY tn.id, tn.parent_id, tn.name, tn.sklad, tn.norma, tn.group_id, tn.group_standard, t.group_total_sklad
                                 HAVING CASE
                                          WHEN tn.group_id IS NOT NULL AND tn.group_id <> 0
                                            THEN GREATEST(tn.norma - t.group_total_sklad, 0)
                                          ELSE GREATEST(tn.norma - tn.sklad, 0)
                                          END > 0)
                   SELECT d.parent_id,
                          tp.path,
                          JSON_AGG(
                            JSON_BUILD_OBJECT(
                              'id_tool', d.id_tool,
                              'name', d.name,
                              'sklad', COALESCE(d.group_sum, d.sklad),
                              'norma', d.norma,
                              'zakaz', d.zakaz,
                              'damaged_last_7_days', d.damaged_last_7_days,
                              'group_id', d.group_id,
                              'group_standard', d.group_standard,
                              'group_sum', d.group_sum
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
