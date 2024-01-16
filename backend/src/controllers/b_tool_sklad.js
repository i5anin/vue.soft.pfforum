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
             INNER JOIN dbo.specs_nom_operations sno ON thn.specs_op_id = sno.id
             INNER JOIN dbo.specs_nom sn ON sno.specs_nom_id = sn.id
      WHERE sn.status_p = 'П'
        AND NOT sn.status_otgruzka
        AND (POSITION('ЗАПРЕТ' IN UPPER(sn.comments)) = 0 OR sn.comments IS NULL);
    `

    // Запрос для получения истории инструментов с учетом пагинации
    const dataQuery = `
      SELECT thn.specs_op_id                                     AS specs_op_id,
             sn.ID                                               AS ID,
             sn.NAME,
             sn.description,
             oon.no                                              AS no_oper,
             dbo.get_full_cnc_type(dbo.get_op_type_code(sno.ID)) AS type_oper,
             thn.quantity,
             o.fio                                               AS user_fio,
             thn.id_user,
             thn.date,
             thn.id_tool,
             tn.name                                             AS name_tool,
             tn.property
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
    // Извлекаем id, sklad, и norma из запроса
    const { id, sklad, norma } = req.body

    // SQL запрос для обновления данных
    const updateQuery = `
      UPDATE dbo.tool_nom
      SET sklad = $1,
          norma = $2
      WHERE id = $3 RETURNING *;
    `

    // Параметры для запроса
    const values = [sklad, norma, id]

    // Выполняем запрос
    const updateResult = await pool.query(updateQuery, values)

    // Проверяем, обновлена ли какая-либо строка
    if (updateResult.rowCount > 0) {
      // Возвращаем обновленные данные
      res.status(200).json({ success: 'OK', data: updateResult.rows[0] })
    } else {
      res.status(404).send('Инструмент не найден.')
    }
  } catch (err) {
    console.error('Ошибка при выполнении запроса на обновление', err.stack)
    res.status(500).send('Ошибка при выполнении запроса')
  }
}

async function getToolHistoryId(req, res) {
  try {
    const specs_op_id = req.query.specs_op_id
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

module.exports = {
  getToolHistory,
  updateToolInventory,
  getToolHistoryId,
}
