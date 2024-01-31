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

async function getToolHistory(req, res) {
  // console.log('Получен запрос истории инструментов:', req.query)
  try {
    const page = parseInt(req.query.page || 1, 10)
    const limit = parseInt(req.query.limit || 15, 10)
    const offset = (page - 1) * limit
    const search = req.query.search

    // Динамическое построение условий WHERE, основанных на параметрах поиска
    let searchConditions = `
      WHERE sn.status_p = 'П'
      AND NOT sn.status_otgruzka
      AND (POSITION('ЗАПРЕТ' IN UPPER(sn.comments)) = 0 OR sn.comments IS NULL)
    `

    // Добавление условий поиска
    if (search) {
      searchConditions += ` AND (
        sn.ID::text LIKE '%${search}%' OR
        UPPER(sn.NAME) LIKE UPPER('%${search}%') OR
        UPPER(sn.description) LIKE UPPER('%${search}%')
      )`
    }

    // Запрос для подсчета общего количества уникальных id_part
    const countQuery = `
      SELECT COUNT(DISTINCT sn.ID)
      FROM dbo.tool_history_nom thn
             INNER JOIN dbo.specs_nom_operations sno ON thn.specs_op_id = sno.id
             INNER JOIN dbo.specs_nom sn ON sno.specs_nom_id = sn.id
      ${searchConditions};
    `

    // Запрос для получения агрегированных данных истории инструментов
    const dataQuery = `
      SELECT
        sn.ID AS id_part,
        sn.NAME,
        sn.description,
        CAST(SUM(thn.quantity) AS INTEGER) AS quantity_tool,
        CAST(COUNT(*) AS INTEGER) AS recordscount,
        COUNT(DISTINCT sno.id) AS operation_count,
        MIN(thn.date) AS date,
        CAST(dbo.kolvo_prod_ready(sn.ID) AS INTEGER) AS quantity_prod
      FROM dbo.tool_history_nom thn
             INNER JOIN dbo.specs_nom_operations sno ON thn.specs_op_id = sno.id
             INNER JOIN dbo.specs_nom sn ON sno.specs_nom_id = sn.id
      ${searchConditions}
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
        quantity_tool: parseInt(row.quantity_tool, 10),
        quantity_prod: parseInt(row.quantity_prod, 10),
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

    const allTools = {}
    const operationsData = {}
    let info = null

    operationsResult.rows.forEach((row) => {
      // Собираем данные для all
      if (allTools[row.id_tool]) {
        allTools[row.id_tool].quantity += row.quantity
        if (new Date(allTools[row.id_tool].date) > new Date(row.date)) {
          allTools[row.id_tool].date = row.date
        }
      } else {
        const {
          specs_op_id,
          user_fio,
          id_user,
          id_part,
          name,
          description,
          ...rest
        } = row
        allTools[row.id_tool] = { ...rest, no_oper: undefined }
      }

      // Собираем данные по операциям
      if (!operationsData[row.no_oper]) {
        operationsData[row.no_oper] = []
      }
      const { specs_op_id, id_part, name, description, ...restOper } = row
      operationsData[row.no_oper].push(restOper)

      // Собираем информацию для info
      if (!info) {
        const {
          specs_op_id,
          no_oper,
          type_oper,
          quantity,
          user_fio,
          id_user,
          date,
          name_tool,
          id_tool,
          ...restInfo
        } = row
        info = restInfo
      }
    })

    // Сортируем ключи операций
    const sortedOperations = Object.keys(operationsData).sort()

    const finalData = {
      info,
      all: Object.values(allTools),
    }

    // Добавляем отсортированные операции в finalData
    sortedOperations.forEach((operation) => {
      finalData[operation] = operationsData[operation]
    })

    res.json(finalData)
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Ошибка при выполнении запроса')
  }
}

module.exports = {
  getToolHistoryId,
  getToolHistory,
  getToolHistoryByPartId,
}