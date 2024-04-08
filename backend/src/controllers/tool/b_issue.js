const { Pool } = require('pg')
const { getNetworkDetails } = require('../../db_type')
const config = require('../../config')

// Получение настроек для подключения к базе данных
const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest

// Создание соединения с базой данных
const pool = new Pool(dbConfig)

async function findDetailProduction(req, res) {
  try {
    const query = `
      SELECT CAST(dbo.specs_nom_operations.id AS INTEGER)                         AS specs_op_id,
             dbo.specs_nom.ID,
             dbo.specs_nom.NAME,
             dbo.specs_nom.description,
             operations_ordersnom.no,
             dbo.get_full_cnc_type(dbo.get_op_type_code(specs_nom_operations.ID)) as cnc_type
      FROM dbo.specs_nom
             INNER JOIN dbo.specs_nom_operations ON specs_nom_operations.specs_nom_id = specs_nom.id
             INNER JOIN dbo.operations_ordersnom ON operations_ordersnom.op_id = specs_nom_operations.ordersnom_op_id
      WHERE CAST(dbo.specs_nom.ID AS TEXT) LIKE $1
        AND specs_nom.status_p = 'П'
        AND NOT specs_nom.status_otgruzka
        AND (POSITION('ЗАПРЕТ' IN UPPER(specs_nom.comments)) = 0 OR specs_nom.comments IS NULL)
        AND (T OR dmc OR hision OR f OR f4 OR fg OR tf)
      ORDER BY dbo.specs_nom.NAME,
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

async function getFioOperators(req, res) {
  try {
    const query = `
      SELECT 'operator' AS type, id, fio
      FROM dbo.operators
      WHERE not nach
        AND not nalad
        AND active
      UNION ALL
      SELECT 'custom_list' AS type, -id AS id, name AS fio
      FROM dbo.tool_user_custom_list
      ORDER BY fio
    `

    // Выполнение запроса
    const result = await pool.query(query)

    // Проверка наличия результатов и их отправка
    if (result.rows && result.rows.length > 0) {
      res.json(result.rows)
    } else {
      res.status(404).send('Операторы и кастомные списки не найдены')
    }
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error)
    res.status(500).send('Внутренняя ошибка сервера')
  }
}

// Функция для выполнения операции выдачи инструмента
async function issueTool(req, res) {
  try {
    // Извлекаем необходимые данные из тела запроса
    const { specs_op_id, id_user, id_tool, type_issue, quantity } = req.body

    // Проверка наличия всех обязательных параметров
    if (
      !specs_op_id ||
      !id_user ||
      !id_tool ||
      quantity == null ||
      type_issue == null
    ) {
      return res.status(400).send('Отсутствует один из обязательных параметров')
    }

    // Проверяем текущее количество инструмента на складе
    const selectQuery = `SELECT sklad
                         FROM dbo.tool_nom
                         WHERE id = $1`
    const toolData = await pool.query(selectQuery, [id_tool])
    if (toolData.rows[0].sklad < quantity) {
      return res.status(400).send('Недостаточно инструмента на складе')
    }

    // Вставляем запись в историю инструмента и обновляем количество на складе
    const insertQuery = `
      INSERT INTO dbo.tool_history_nom (specs_op_id, id_user, id_tool, type_issue, quantity, timestamp)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id, timestamp;
    `
    const insertResult = await pool.query(insertQuery, [
      specs_op_id,
      id_user,
      id_tool,
      type_issue,
      quantity,
    ])
    const insertedId = insertResult.rows[0].id
    const insertedTimestamp = insertResult.rows[0].timestamp // Текущая дата и время сервера

    // Обновляем количество инструмента на складе
    const updateQuery = `UPDATE dbo.tool_nom
                         SET sklad = sklad - $1
                         WHERE id = $2`
    await pool.query(updateQuery, [quantity, id_tool])

    // Отправляем ответ с данными о выполненной операции
    res.status(200).json({
      success: 'OK',
      insertedRecordId: insertedId,
      specs_op_id,
      id_user,
      id_tool,
      type_issue,
      quantity,
      timestamp: insertedTimestamp, // Возвращаем серверное время операции
    })
  } catch (error) {
    console.error('Ошибка при сохранении истории инструмента:', error)
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      requestData: { specs_op_id, id_user, id_tool, type_issue, quantity },
    })
  }
}

async function issueTools(req, res) {
  const { operationId, userId, tools, typeIssue, issueToken } = req.body // Добавлен issueToken в деструктуризацию

  try {
    // Начало транзакции
    await pool.query('BEGIN')

    // Проверка токена и получение issuer_id
    const tokenQuery = 'SELECT id FROM dbo.vue_users WHERE token = $1'
    const tokenResult = await pool.query(tokenQuery, [issueToken])

    if (tokenResult.rows.length === 0) {
      throw new Error('Invalid token: Access denied.')
    }

    const issuerId = tokenResult.rows[0].id

    for (const { toolId, quantity } of tools) {
      // Проверка наличия инструмента на складе
      const selectQuery = 'SELECT sklad FROM dbo.tool_nom WHERE id = $1'
      const stockResult = await pool.query(selectQuery, [toolId])

      if (
        stockResult.rows.length === 0 ||
        stockResult.rows[0].sklad < quantity
      ) {
        throw new Error(`Insufficient stock for tool ID=${toolId}`)
      }

      // Вставка записи в историю инструмента
      const insertQuery = `
        INSERT INTO dbo.tool_history_nom (specs_op_id, id_user, id_tool, type_issue, quantity, timestamp, issuer_id)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
      `
      await pool.query(insertQuery, [
        operationId,
        userId,
        toolId,
        typeIssue,
        quantity,
        issuerId,
      ])

      // Обновление количества инструмента на складе
      const updateQuery =
        'UPDATE dbo.tool_nom SET sklad = sklad - $1 WHERE id = $2'
      await pool.query(updateQuery, [quantity, toolId])
    }

    // Завершение транзакции
    await pool.query('COMMIT')
    res.json({ success: 'OK', message: 'Инструменты успешно выданы' })
  } catch (error) {
    // Откат в случае ошибки
    await pool.query('ROLLBACK')
    console.error('Ошибка при выдаче инструмента:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Please contact the administrator.',
    })
  }
}

async function getCncData(req, res) {
  try {
    const query = `
      SELECT id, cnc_name, cnc_code
      FROM dbo.cnc
      WHERE active = 't'
      ORDER BY cnc_name
    `

    const result = await pool.query(query)

    if (result.rows.length > 0) {
      res.json(result.rows)
    } else {
      res.status(404).send('Станки не найдены')
    }
  } catch (error) {
    console.error('Ошибка при получении данных о станках:', error)
    res.status(500).send('Внутренняя ошибка сервера')
  }
}

async function cancelOperation(req, res) {
  try {
    const { id } = req.params

    if (!id) {
      return res
        .status(400)
        .send('Отсутствует обязательный параметр: id операции')
    }

    // Start a database transaction
    await pool.query('BEGIN')

    // Проверяем существование записи и её статус перед отменой
    const checkQuery = `SELECT id, id_tool, quantity, cancelled FROM dbo.tool_history_nom WHERE id = $1`
    const checkResult = await pool.query(checkQuery, [id])
    if (checkResult.rows.length === 0) {
      await pool.query('ROLLBACK')
      return res.status(404).send('Операция не найдена')
    }

    const { id_tool, quantity, cancelled } = checkResult.rows[0]

    if (cancelled) {
      await pool.query('ROLLBACK')
      return res.status(400).send('Операция уже была отменена')
    }

    // Обновляем запись, присваиваем cancelled = true для отметки об отмене
    const updateHistoryQuery = `UPDATE dbo.tool_history_nom SET cancelled = true WHERE id = $1`
    await pool.query(updateHistoryQuery, [id])

    // Возвращаем количество инструмента на склад
    const updateToolQuery = `UPDATE dbo.tool_nom SET sklad = sklad + $1 WHERE id = $2`
    await pool.query(updateToolQuery, [quantity, id_tool])

    // Commit the transaction
    await pool.query('COMMIT')

    // Get the name of the tool for more detailed feedback
    const toolNameQuery = `SELECT name FROM dbo.tool_nom WHERE id = $1`
    const toolNameResult = await pool.query(toolNameQuery, [id_tool])
    const toolName = toolNameResult.rows[0].name

    // Отправляем ответ, что операция отменена
    res.status(200).json({
      success: true,
      message: 'Операция отменена',
      operationId: id,
      details: {
        returnedQuantity: quantity,
        toTool: toolName,
        toolId: id_tool,
      },
    })
  } catch (error) {
    console.error('Ошибка при отмене операции:', error)
    await pool.query('ROLLBACK')
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      errorDetails: error.message,
    })
  }
}

module.exports = {
  cancelOperation,
  findDetailProduction,
  issueTool,
  issueTools,
  getFioOperators,
  getCncData,
}
