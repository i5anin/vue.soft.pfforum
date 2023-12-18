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

async function customQuery(req, res) {
  try {
    const query = `
      SELECT
        dbo.specs_nom.ID,
        dbo.specs_nom.NAME,
        dbo.specs_nom.description,
        operations_ordersnom.no,
        dbo.get_full_cnc_type(dbo.get_op_type_code(specs_nom_operations.ID))
      FROM
        dbo.specs_nom
        INNER JOIN dbo.specs_nom_operations ON specs_nom_operations.specs_nom_id = specs_nom.id
        INNER JOIN dbo.operations_ordersnom ON operations_ordersnom.op_id = specs_nom_operations.ordersnom_op_id
      WHERE
        specs_nom.status_p = 'П'
        AND NOT specs_nom.status_otgruzka
        AND (POSITION('ЗАПРЕТ' IN UPPER(specs_nom.comments)) = 0 OR specs_nom.comments IS NULL)
        AND (T OR dmc OR hision OR f OR f4 OR fg OR tf)
      ORDER BY
        dbo.specs_nom.NAME,
        dbo.specs_nom.description,
        operations_ordersnom.no::INT
    `
    const result = await pool.query(query)
    res.json(result.rows)
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error)
    res.status(500).send('Внутренняя ошибка сервера')
  }
}

module.exports = { customQuery }
