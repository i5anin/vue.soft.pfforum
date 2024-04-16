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
  try {
    const page = parseInt(req.query.page || 1, 10)
    const limit = parseInt(req.query.limit || 15, 10)
    const offset = (page - 1) * limit
    const search = req.query.search
    const date = req.query.date // Получаем дату из запроса

    let searchConditions = `
      WHERE NOT specs_nom.status_otgruzka
      AND (POSITION('ЗАПРЕТ' IN UPPER(specs_nom.comments)) = 0 OR specs_nom.comments IS NULL)
    `

    if (search) {
      searchConditions += ` AND (
        specs_nom.ID::text LIKE '%${search}%' OR
        UPPER(specs_nom.NAME) LIKE UPPER('%${search}%') OR
        UPPER(specs_nom.description) LIKE UPPER('%${search}%')
      )`
    }

    if (date) {
      searchConditions += ` AND CAST(tool_history_nom.timestamp AS DATE) = CAST('${date}' AS DATE)`
    }

    const countQuery = `
      SELECT COUNT(DISTINCT specs_nom.ID)
      FROM dbo.tool_history_nom
      INNER JOIN dbo.specs_nom_operations ON tool_history_nom.specs_op_id = specs_nom_operations.ID
      INNER JOIN dbo.specs_nom ON specs_nom_operations.specs_nom_id = specs_nom.ID
      ${searchConditions};
    `

    const dataQuery = `
      SELECT *
      FROM (
        SELECT specs_nom.ID AS id_part,
               specs_nom.NAME,
               specs_nom.description,
               CAST(SUM(tool_history_nom.quantity) AS INTEGER) AS quantity_tool,
               CAST(COUNT(*) AS INTEGER) AS recordscount,
               COUNT(DISTINCT specs_nom_operations.ID) AS operation_count,
               MIN(tool_history_nom.TIMESTAMP) AS first_issue_date,
               dbo.kolvo_ready_op(specs_nom_operations.ID) AS quantity_prod,
               specs_nom.kolvo AS quantity_prod_all,
               specs_nom_operations.status_ready
        FROM dbo.tool_history_nom
        INNER JOIN dbo.specs_nom_operations ON tool_history_nom.specs_op_id = specs_nom_operations.ID
        INNER JOIN dbo.specs_nom ON specs_nom_operations.specs_nom_id = specs_nom.ID
        ${searchConditions}
        GROUP BY specs_nom.ID, specs_nom.NAME, specs_nom.description, specs_nom_operations.status_ready, specs_nom_operations.ID
        ORDER BY MIN(tool_history_nom.TIMESTAMP) DESC
      ) AS sorted_data
      LIMIT ${limit} OFFSET ${offset};
    `

    const countResult = await pool.query(countQuery)
    const dataResult = await pool.query(dataQuery)

    console.log(dataQuery)

    res.json({
      currentPage: page,
      itemsPerPage: limit,
      totalCount: parseInt(countResult.rows[0].count, 10),
      toolsHistory: dataResult.rows.map((row) => ({
        id_part: row.id_part,
        name: row.name,
        description: row.description,
        quantity_tool: parseInt(row.quantity_tool, 10),
        quantity_prod: parseInt(row.quantity_prod, 10),
        recordscount: parseInt(row.recordscount, 10),
        first_issue_date: row.first_issue_date,
        quantity_prod_all: row.quantity_prod_all,
        status_ready: row.status_ready,
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
             thn.timestamp                                       AS date,
             o.fio                                               AS user_fio,  -- Поле user_fio из таблицы operators
             tn.name                                             AS name_tool, -- Поле name_tool из таблицы tool_nom
             tn.property                                                       -- Поле property из таблицы tool_nom
      FROM dbo.tool_history_nom thn
             LEFT JOIN dbo.specs_nom_operations sno ON thn.specs_op_id = sno.id
             LEFT JOIN dbo.specs_nom sn ON sno.specs_nom_id = sn.id
             LEFT JOIN dbo.operations_ordersnom oon ON oon.op_id = sno.ordersnom_op_id
             LEFT JOIN dbo.operators o ON thn.id_user = o.id
             LEFT JOIN dbo.tool_nom tn ON thn.id_tool = tn.id
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
    const selectedDate = req.query.selectedDate // Получаем выбранную дату из параметров запроса

    let operationsQuery = `
      SELECT thn.id,
             sno.id                                              AS specs_op_id,
             sn.ID                                               AS id_part,
             sn.NAME,
             sn.description,
             oon.no                                              AS no_oper,
             dbo.get_full_cnc_type(dbo.get_op_type_code(sno.ID)) AS type_oper,
             thn.quantity,
             CASE
               WHEN thn.id_user < 0 THEN (SELECT name FROM dbo.tool_user_custom_list WHERE -id = thn.id_user)
               ELSE o.fio
               END                                               AS user_fio,
             thn.id_user,
             thn.timestamp,
             tn.name                                             AS name_tool,
             thn.id_tool,
             thn.type_issue,
             thn.comment,
             thn.cancelled,
             thn.issuer_id,
             vu.login                                            AS issuer_fio,
             vu2.login                                           AS canceller_login  -- Added canceller's login
      FROM dbo.tool_history_nom thn
             LEFT JOIN dbo.specs_nom_operations sno ON thn.specs_op_id = sno.id
             LEFT JOIN dbo.specs_nom sn ON sno.specs_nom_id = sn.id
             LEFT JOIN dbo.operations_ordersnom oon ON oon.op_id = sno.ordersnom_op_id
             LEFT JOIN dbo.operators o ON thn.id_user = o.id
             LEFT JOIN dbo.tool_nom tn ON thn.id_tool = tn.id
             LEFT JOIN dbo.vue_users vu ON thn.issuer_id = vu.id
             LEFT JOIN dbo.vue_users vu2 ON thn.cancelled_id = vu2.id  -- Join to get canceller's login
      WHERE sn.ID = $1
    `

    const queryParams = [idPart]

    if (selectedDate) {
      operationsQuery += ` AND thn.timestamp >= $2::date AND thn.timestamp < $2::date + interval '1 day'`
      queryParams.push(selectedDate)
    }

    operationsQuery += ' ORDER BY thn.timestamp DESC;'

    const operationsResult = await pool.query(operationsQuery, queryParams)

    if (operationsResult.rows.length === 0)
      return res.status(404).send('Операции для данной партии не найдены')

    const allTools = {}
    const operationsData = {}
    let info = null

    operationsResult.rows.forEach((row) => {
      const typeIssueMap = { 0: 'Себе', 1: 'На ночь', 2: 'Наладка' }
      row.type_issue = typeIssueMap[row.type_issue] || 'Неизвестно'

      if (allTools[row.id_tool]) {
        allTools[row.id_tool].quantity += row.quantity
        if (
          new Date(allTools[row.id_tool].timestamp) < new Date(row.timestamp)
        ) {
          allTools[row.id_tool].timestamp = row.timestamp
          allTools[row.id_tool].type_issue = row.type_issue
        }
      } else {
        allTools[row.id_tool] = {
          type_oper: row.type_oper,
          quantity: row.quantity,
          timestamp: row.timestamp,
          name_tool: row.name_tool,
          id_tool: row.id_tool,
          type_issue: row.type_issue,
        }
      }

      operationsData[row.no_oper] = operationsData[row.no_oper] || []
      operationsData[row.no_oper].push({
        id: row.id,
        specs_op_id: Number(row.specs_op_id),
        no_oper: row.no_oper,
        type_oper: row.type_oper,
        quantity: row.quantity,
        user_fio: row.user_fio,
        id_user: row.id_user,
        timestamp: row.timestamp,
        name_tool: row.name_tool,
        id_tool: row.id_tool,
        type_issue: row.type_issue,
        comment: row.comment,
        cancelled: row.cancelled,
        issuer_fio: row.issuer_fio,
        issuer_id: row.issuer_id,
        canceller_login: row.canceller_login, // Displaying canceller's login
      })

      if (!info) {
        info = {
          id_part: row.id_part,
          name: row.name,
          description: row.description,
          timestamp: row.timestamp,
        }
      }
    })

    const finalData = {
      info,
      all: Object.values(allTools),
    }

    Object.keys(operationsData)
      .sort()
      .forEach((operation) => {
        finalData[operation] = operationsData[operation]
      })

    res.json(finalData)
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Ошибка при выполнении запроса')
  }
}

async function getToolHistoryByPartOld(req, res) {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page || 1, 10)
    const limit = parseInt(req.query.limit || 15, 10)
    const offset = (page - 1) * limit

    // SQL query to count total unique IDs
    const countQuery = `SELECT COUNT(*) FROM dbo.tool_history_nom;`

    // SQL query to retrieve tool history data
    const dataQuery = `
      SELECT
        h.id,
        h.specs_op_id,
        sn.ID AS id_part,
        h.id_tool,
        n.name AS tool_name,
        h.id_user,
        CASE
          WHEN h.id_user < 0 THEN
            (SELECT name FROM dbo.tool_user_custom_list WHERE id = -h.id_user)
          ELSE
            o.fio
        END AS user_name,
        h.quantity,
        h.timestamp,
        h.comment,
        h.type_issue,
        h.sent,
        h.cancelled,
        sn.NAME AS part_name,
        sn.description AS part_description,
        h.issuer_id,
        vu.login AS issuer_login
      FROM dbo.tool_history_nom h
      LEFT JOIN dbo.tool_nom n ON h.id_tool = n.id
      LEFT JOIN dbo.operators o ON h.id_user = o.id AND h.id_user > 0
      LEFT JOIN dbo.specs_nom_operations sno ON h.specs_op_id = sno.id
      LEFT JOIN dbo.specs_nom sn ON sno.specs_nom_id = sn.id
      LEFT JOIN dbo.vue_users vu ON h.issuer_id = vu.id
      ORDER BY h.timestamp DESC
      LIMIT ${limit} OFFSET ${offset};
    `

    // Execute SQL queries
    const countResult = await pool.query(countQuery)
    const dataResult = await pool.query(dataQuery)

    // Send response
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
  getToolHistoryId,
  getToolHistory,
  getToolHistoryByPartId,
  getToolHistoryByPartOld,
}
