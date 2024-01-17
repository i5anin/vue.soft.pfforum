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

async function findDetail(req, res) {
  try {
    const query = `
      SELECT
        CAST(dbo.specs_nom_operations.id AS INTEGER) AS specs_op_id,
        dbo.specs_nom.ID,
        dbo.specs_nom.NAME,
        dbo.specs_nom.description,
        operations_ordersnom.no,
        dbo.get_full_cnc_type(dbo.get_op_type_code ( specs_nom_operations.ID )) as cnc_type
      FROM
        dbo.specs_nom
        INNER JOIN dbo.specs_nom_operations ON specs_nom_operations.specs_nom_id = specs_nom.id
        INNER JOIN dbo.operations_ordersnom ON operations_ordersnom.op_id = specs_nom_operations.ordersnom_op_id
      WHERE
        CAST(dbo.specs_nom.ID AS TEXT) LIKE $1
        AND specs_nom.status_p = 'П'
        AND NOT specs_nom.status_otgruzka
        AND ( POSITION('ЗАПРЕТ' IN UPPER(specs_nom.comments)) = 0 OR specs_nom.comments IS NULL )
        AND (T OR dmc OR hision OR f OR f4 OR fg OR tf)
      ORDER BY
        dbo.specs_nom.NAME,
        dbo.specs_nom.description,
        operations_ordersnom.no::INT
    `
    const result = await pool.query(query, [req.query.id + '%'])
    res.json(result.rows)
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error)
    res.status(500).send('Внутренняя ошибка сервера')
  }
}

async function getAllOperators(req, res) {
  try {
    // SQL запрос для получения всех ID и фамилий из таблицы operators
    const query = `
      SELECT id, fio
      FROM dbo.operators
      WHERE not nach AND not nalad AND active
      ORDER BY fio
    `

    // Выполнение запроса
    const result = await pool.query(query)

    // Проверка наличия результатов и их отправка
    if (result.rows && result.rows.length > 0) {
      res.json(result.rows)
    } else {
      res.status(404).send('Операторы не найдены')
    }
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error)
    res.status(500).send('Внутренняя ошибка сервера')
  }
}

async function saveToolHistory(req, res) {
  try {
    // Извлекаем данные из тела запроса
    const { specs_op_id, id_user, id_tool, quantity, date } = req.body

    // SQL запрос для получения текущего количества инструмента на складе
    const selectQuery = `
      SELECT sklad
      FROM dbo.tool_nom
      WHERE id = $1
    `

    // Выполняем запрос на получение данных
    const toolData = await pool.query(selectQuery, [id_tool])

    // Проверяем, достаточно ли инструмента на складе
    if (toolData.rows[0].sklad < quantity) {
      return res.status(400).send('Недостаточно инструмента на складе')
    }

    // SQL запрос для вставки данных в таблицу tool_history_nom
    const insertQuery = `
      INSERT INTO dbo.tool_history_nom (specs_op_id, id_user, id_tool, quantity, date)
      VALUES ($1, $2, $3, $4, $5)
    `

    // SQL запрос для обновления данных в таблице tool_nom
    const updateQuery = `
      UPDATE dbo.tool_nom
      SET sklad = sklad - $1
      WHERE id = $2
    `

    // Выполняем запрос на обновление данных
    await pool.query(updateQuery, [quantity, id_tool])

    // Получаем обновленное значение sklad
    const updatedSklad = await pool.query(selectQuery, [id_tool])

    // Отправляем эти данные обратно в ответе
    res.status(200).json({
      success: 'OK',
      specs_op_id,
      id_user,
      id_tool,
      quantity,
      date,
      updatedSklad: updatedSklad.rows[0].sklad,
    })
  } catch (error) {
    console.error('Ошибка при сохранении истории инструмента:', error)
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: {
        name: error.name, // Тип ошибки, например, "TypeError"
        message: error.message, // Сообщение об ошибке
        stack: error.stack, // Стек вызовов, который привел к ошибке
      },
      requestData: {
        specs_op_id, // Переданные данные для лучшего понимания контекста
        id_user,
        id_tool,
        quantity,
        date,
      },
    })
  }
}

module.exports = {
  findDetail,
  getAllOperators,
  saveToolHistory,
}
