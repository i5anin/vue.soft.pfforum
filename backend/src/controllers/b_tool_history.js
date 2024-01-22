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

async function findDetailProduction(req, res) {
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

async function getFioOperators(req, res) {
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

async function getToolHistory(req, res) {
  try {
    const page = parseInt(req.query.page || 1, 10)
    const limit = parseInt(req.query.limit || 15, 10)
    const offset = (page - 1) * limit

    // Запрос для подсчета общего количества уникальных id_part
    const countQuery = `
      SELECT COUNT(DISTINCT sn.ID)
      FROM dbo.tool_history_nom thn
             INNER JOIN dbo.specs_nom_operations sno ON thn.specs_op_id = sno.id
             INNER JOIN dbo.specs_nom sn ON sno.specs_nom_id = sn.id
      WHERE sn.status_p = 'П'
        AND NOT sn.status_otgruzka
        AND (POSITION('ЗАПРЕТ' IN UPPER(sn.comments)) = 0 OR sn.comments IS NULL);
    `

    // Запрос для получения агрегированных данных истории инструментов
    const dataQuery = `
      SELECT
        sn.ID AS id_part,
        sn.NAME,
        sn.description,
        CAST(SUM(thn.quantity) AS INTEGER) AS quantity,
        CAST(COUNT(*) AS INTEGER) AS recordscount,
        COUNT(DISTINCT sno.id) AS operation_count,
        MIN(thn.date) AS date
      FROM dbo.tool_history_nom thn
             INNER JOIN dbo.specs_nom_operations sno ON thn.specs_op_id = sno.id
             INNER JOIN dbo.specs_nom sn ON sno.specs_nom_id = sn.id
      WHERE sn.status_p = 'П'
        AND NOT sn.status_otgruzka
        AND (POSITION('ЗАПРЕТ' IN UPPER(sn.comments)) = 0 OR sn.comments IS NULL)
      GROUP BY sn.ID, sn.NAME, sn.description
      ORDER BY MIN(thn.date) DESC, sn.NAME, sn.description
      LIMIT ${limit}
      OFFSET ${offset};
    `

    const countResult = await pool.query(countQuery)
    const dataResult = await pool.query(dataQuery)

    res.json({
      currentPage: page,
      itemsPerPage: limit,
      totalCount: parseInt(countResult.rows[0].count, 10),
      toolsHistory: dataResult.rows.map((row) => ({
        ...row,
        quantity: parseInt(row.quantity, 10), // Преобразование к числу
        recordscount: parseInt(row.recordscount, 10), // Преобразование к числу
        date: row.date, // Дата начала использования
      })),
    })
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Ошибка при выполнении запроса')
  }
}

async function getToolHistoryId(req, res) {
  try {
    const specs_op_id = req.params.id // Изменено на req.params.id
    const query = `
      SELECT sn.NAME,
             sn.description,
             oon.no                                              AS no_oper,
             dbo.get_full_cnc_type(dbo.get_op_type_code(sno.ID)) AS type_oper,
             CAST(sno.id AS INTEGER)                             AS specs_op_id,
             sn.ID,
             thn.quantity,
             thn.id_user,
             thn.id_tool,
             thn.date,
             o.fio                                               AS user_fio, -- Поле user_fio из таблицы operators
             tn.name                                             AS name_tool, -- Поле name_tool из таблицы tool_nom
             tn.property                                         -- Поле property из таблицы tool_nom
      FROM dbo.tool_history_nom thn
             INNER JOIN dbo.specs_nom_operations sno ON thn.specs_op_id = sno.id
             INNER JOIN dbo.specs_nom sn ON sno.specs_nom_id = sn.id
             INNER JOIN dbo.operations_ordersnom oon ON oon.op_id = sno.ordersnom_op_id
             INNER JOIN dbo.operators o ON thn.id_user = o.id
             INNER JOIN dbo.tool_nom tn ON thn.id_tool = tn.id
      WHERE thn.specs_op_id = $1
        AND NOT sn.status_otgruzka
        AND (POSITION('ЗАПРЕТ' IN UPPER(sn.comments)) = 0 OR sn.comments IS NULL)
      ORDER BY sn.NAME, sn.description, oon.no::INT;
    `
    const result = await pool.query(query, [specs_op_id])

    if (result.rows.length > 0) {
      const groupedData = result.rows.reduce((acc, item) => {
        if (!acc[item.id_tool]) {
          acc[item.id_tool] = { data: [], totalQuantity: 0 }
        }
        acc[item.id_tool].data.push({ ...item, type: 'position' })
        acc[item.id_tool].totalQuantity += item.quantity
        return acc
      }, {})

      const finalData = []
      Object.values(groupedData).forEach((group) => {
        finalData.push(...group.data)
        finalData.push({
          name: group.data[0].name,
          description: group.data[0].description,
          no_oper: group.data[0].no_oper,
          type_oper: group.data[0].type_oper,
          specs_op_id: group.data[0].specs_op_id,
          id: group.data[0].id,
          quantity: group.totalQuantity,
          id_user: null,
          id_tool: group.data[0].id_tool,
          date: '',
          user_fio: '',
          name_tool: group.data[0].name_tool,
          type: 'sum',
        })
      })

      res.status(200).json(finalData)
    } else {
      res.status(404).send('История для данного ID операции не найдена.')
    }
  } catch (err) {
    console.error('Ошибка при запросе истории инструмента:', err)
    res.status(500).send('Ошибка сервера')
  }
}

async function getToolHistoryByPartId(req, res) {
  try {
    const idPart = req.query.id_part
    const operationsQuery = `
      SELECT
        sno.id AS specs_op_id,
        sn.ID AS id_part,
        sn.NAME,
        sn.description,
        oon.no AS no_oper,
        dbo.get_full_cnc_type(dbo.get_op_type_code(sno.ID)) AS type_oper,
        thn.quantity,
        o.fio AS user_fio,
        thn.id_user,
        thn.date,
        tn.name AS name_tool,
        thn.id_tool
      FROM dbo.tool_history_nom thn
        INNER JOIN dbo.specs_nom_operations sno ON thn.specs_op_id = sno.id
        INNER JOIN dbo.specs_nom sn ON sno.specs_nom_id = sn.id
        INNER JOIN dbo.operations_ordersnom oon ON oon.op_id = sno.ordersnom_op_id
        INNER JOIN dbo.operators o ON thn.id_user = o.id
        INNER JOIN dbo.tool_nom tn ON thn.id_tool = tn.id
      WHERE sn.ID = $1
      ORDER BY thn.date DESC;
    `
    const operationsResult = await pool.query(operationsQuery, [idPart])

    if (operationsResult.rows.length === 0) {
      return res.status(404).send('Операции для данной партии не найдены')
    }

    const groupedData = operationsResult.rows.reduce((acc, item) => {
      if (!acc[item.no_oper]) {
        acc[item.no_oper] = { data: [], totalQuantity: 0 }
      }
      acc[item.no_oper].data.push(item)
      acc[item.no_oper].totalQuantity += item.quantity
      return acc
    }, {})

    const finalData = {
      all: [],
    }

    const sortedKeys = Object.keys(groupedData).sort()
    sortedKeys.forEach((key) => {
      const toolData = {}
      groupedData[key].data.forEach((item) => {
        if (toolData[item.id_tool]) {
          toolData[item.id_tool].quantity += item.quantity
        } else {
          toolData[item.id_tool] = { ...item }
        }
      })
      finalData[key] = Object.values(toolData)

      if (key !== 'all') {
        finalData.all.push(...finalData[key])
      }
    })

    // Для finalData.all убираем дубликаты и суммируем количество
    const allTools = {}
    finalData.all.forEach((item) => {
      if (allTools[item.id_tool]) {
        allTools[item.id_tool].quantity += item.quantity
      } else {
        allTools[item.id_tool] = { ...item }
      }
    })
    finalData.all = Object.values(allTools)

    res.json(finalData)
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Ошибка при выполнении запроса')
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
      requestData: { specs_op_id, id_user, id_tool, quantity, date },
    })
  }
}

async function getToolTest(req, res) {
  try {
    // Параметры пагинации
    const page = parseInt(req.query.page || 1, 10)
    const limit = parseInt(req.query.limit || 15, 10)
    const offset = (page - 1) * limit

    // Запрос для подсчета общего количества записей
    const countQuery = `
      SELECT COUNT(*)
      FROM dbo.tool_history_nom thn
             INNER JOIN dbo.specs_nom_operations sno ON thn.specs_op_id = sno.id
             INNER JOIN dbo.specs_nom sn ON sno.specs_nom_id = sn.id
      WHERE sn.status_p = 'П'
        AND NOT sn.status_otgruzka
        AND (POSITION('ЗАПРЕТ' IN UPPER(sn.comments)) = 0 OR sn.comments IS NULL);
    `

    // Запрос для получения истории инструментов с учетом пагинации
    const dataQuery = `
      SELECT thn.specs_op_id                                     AS specs_op_id,
             sn.ID                                               AS id_part,
             sn.NAME,
             sn.description,
             oon.no                                              AS no_oper,
             dbo.get_full_cnc_type(dbo.get_op_type_code(sno.ID)) AS type_oper,
             thn.quantity,
             tn.name                                             AS name_tool,
             thn.id_tool,
             thn.date
      FROM dbo.tool_history_nom thn
             INNER JOIN dbo.specs_nom_operations sno ON thn.specs_op_id = sno.id
             INNER JOIN dbo.specs_nom sn ON sno.specs_nom_id = sn.id
             INNER JOIN dbo.operations_ordersnom oon ON oon.op_id = sno.ordersnom_op_id
             INNER JOIN dbo.operators o ON thn.id_user = o.id
             INNER JOIN dbo.tool_nom tn ON thn.id_tool = tn.id
      WHERE sn.status_p = 'П'
        AND NOT sn.status_otgruzka
        AND (POSITION('ЗАПРЕТ' IN UPPER(sn.comments)) = 0 OR sn.comments IS NULL)
      ORDER BY thn.date DESC, sn.NAME, sn.description, oon.no::INT
      LIMIT ${limit}
      OFFSET ${offset};
    `
    // tn.property

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

module.exports = {
  saveToolHistory,
  getToolHistoryId,
  getToolHistory,
  getToolHistoryByPartId,
  getToolTest,
}
