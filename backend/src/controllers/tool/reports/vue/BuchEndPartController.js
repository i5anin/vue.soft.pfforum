const { Pool } = require('pg')
const getDbConfig = require('../../../../config/databaseConfig')

// Настройка подключения к базе данных

const dbConfig = getDbConfig()
const pool = new Pool(dbConfig)

async function getTableReportData(req, res) {
  try {
    const query = `
SELECT dbo.specs_nom.id,
       dbo.specs_nom.name,
       dbo.specs_nom.description,
       dbo.specs_nom.prod_end_time,
       dbo.tool_part_archive.date_report_sent_buch,
       dbo.tool_part_archive.report_sent_buch,
       dbo.tool_part_archive.count_nom
FROM dbo.tool_part_archive
RIGHT JOIN dbo.specs_nom ON dbo.tool_part_archive.specs_nom_id = dbo.specs_nom.id
WHERE  dbo.specs_nom.prod_end_time >= '2024-06-19 00:00:00'
ORDER BY dbo.tool_part_archive.date_report_sent_buch DESC;
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
