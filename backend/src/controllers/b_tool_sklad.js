const { Pool } = require('pg')
const { getNetworkDetails } = require('../db_type')
const config = require('../config')

// Получение конфигурации для соединения с базой данных
const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest

// Создание пула подключений к БД
const pool = new Pool(dbConfig)

// Функция для получения истории инструментов
async function getToolHistory(req, res) {
  try {
    const sqlQuery = `
      SELECT
        thn.id_oper AS specs_op_id,
        sn.ID AS id_oper,
        sn.NAME,
        sn.description,
        oon.no AS no_oper,
        dbo.get_full_cnc_type(dbo.get_op_type_code(sno.ID)) AS type_oper,
        thn.quantity,
        o.fio AS user_fio,
        thn.id_user,
        thn.date_p,
        thn.date_u,
        thn.id_nom,
        tn.name AS name_tool,
        tn.property
      FROM
        dbo.tool_history_nom thn
      INNER JOIN
        dbo.specs_nom_operations sno ON thn.id_oper = sno.id
      INNER JOIN
        dbo.specs_nom sn ON sno.specs_nom_id = sn.id
      INNER JOIN
        dbo.operations_ordersnom oon ON oon.op_id = sno.ordersnom_op_id
      INNER JOIN
        dbo.operators o ON thn.id_user = o.id
      INNER JOIN
        dbo.tool_nom tn ON thn.id_nom = tn.id
      WHERE
        sn.status_p = 'П'
        AND NOT sn.status_otgruzka
        AND (POSITION('ЗАПРЕТ' IN UPPER(sn.comments)) = 0 OR sn.comments IS NULL)
        AND (T OR dmc OR hision OR f OR f4 OR fg OR tf)
      ORDER BY
        sn.NAME,
        sn.description,
        oon.no::INT;
    `

    // Выполнение запроса к базе данных
    const result = await pool.query(sqlQuery)

    // Отправка результата
    res.json(result.rows)
  } catch (err) {
    // Обработка возможных ошибок
    console.error('Error executing query', err.stack)
    res.status(500).send('Ошибка при выполнении запроса')
  }
}

module.exports = {
  getToolHistory,
}
