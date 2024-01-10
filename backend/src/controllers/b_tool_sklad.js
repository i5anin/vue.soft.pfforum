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
    // Параметры пагинации
    const page = parseInt(req.query.page || 1, 10)
    const limit = parseInt(req.query.limit || 15, 10)
    const offset = (page - 1) * limit

    // Запрос для подсчета общего количества записей
    const countQuery = `
      SELECT COUNT(*)
      FROM dbo.tool_history_nom thn
      INNER JOIN dbo.specs_nom_operations sno ON thn.id_oper = sno.id
      INNER JOIN dbo.specs_nom sn ON sno.specs_nom_id = sn.id
      WHERE sn.status_p = 'П'
        AND NOT sn.status_otgruzka
        AND (POSITION('ЗАПРЕТ' IN UPPER(sn.comments)) = 0 OR sn.comments IS NULL);
    `

    // Запрос для получения истории инструментов с учетом пагинации
    const dataQuery = `
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
        thn.date,
        thn.id_tool,
        tn.name AS name_tool,
        tn.property
      FROM dbo.tool_history_nom thn
      INNER JOIN dbo.specs_nom_operations sno ON thn.id_oper = sno.id
      INNER JOIN dbo.specs_nom sn ON sno.specs_nom_id = sn.id
      INNER JOIN dbo.operations_ordersnom oon ON oon.op_id = sno.ordersnom_op_id
      INNER JOIN dbo.operators o ON thn.id_user = o.id
      INNER JOIN dbo.tool_nom tn ON thn.id_tool = tn.id
      WHERE sn.status_p = 'П'
        AND NOT sn.status_otgruzka
        AND (POSITION('ЗАПРЕТ' IN UPPER(sn.comments)) = 0 OR sn.comments IS NULL)
      ORDER BY sn.NAME, sn.description, oon.no::INT
      LIMIT ${limit} OFFSET ${offset};
    `

    // Выполнение запросов
    const countResult = await pool.query(countQuery)
    const dataResult = await pool.query(dataQuery)

    // Отправка результата
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

async function updateToolInventory(req, res) {
  try {
    // Extracting id, sklad, and norma from the request
    const { id, sklad, norma } = req.body

    // SQL UPDATE Statement
    const updateQuery = `
      UPDATE dbo.tool_nom
      SET sklad = $1, norma = $2
      WHERE id = $3;
    `

    // Parameters for the query
    const values = [sklad, norma, id]

    // Execute the query
    const updateResult = await pool.query(updateQuery, values)

    // Check if any row is updated
    if (updateResult.rowCount > 0) {
      res.send('Inventory updated successfully.')
    } else {
      res.status(404).send('Tool not found.')
    }
  } catch (err) {
    console.error('Error executing update query', err.stack)
    res.status(500).send('Ошибка при выполнении запроса')
  }
}

module.exports = {
  getToolHistory,
  updateToolInventory,
}
