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

async function getToolHistoryByPartIdInfo(req, res) {
  try {
    const idPart = req.query.id_part
    const selectedDate = req.query.selectedDate

    // Основной запрос для получения данных операций и связанной истории
    let operationsQuery = `
      SELECT sn.ID AS id_part,
             sn.NAME,
             sn.description,
             oon.no AS no_oper,
             sno.status_ready AS operation_ready,
             sno.id AS specs_op_id,
             thn.id AS tool_history_id
      FROM dbo.specs_nom sn
      LEFT JOIN dbo.specs_nom_operations sno ON sn.id = sno.specs_nom_id
      LEFT JOIN dbo.operations_ordersnom oon ON sno.ordersnom_op_id = oon.op_id
      LEFT JOIN dbo.tool_history_nom thn ON sno.id = thn.specs_op_id AND thn.timestamp >= $2::date AND thn.timestamp < $2::date + interval '1 day'
      WHERE sn.ID = $1  AND (T OR tf OR f OR f4 OR fg OR dmc OR hision)
      ORDER BY oon.no;
    `

    const queryParams = [idPart]
    if (selectedDate) {
      queryParams.push(selectedDate)
    } else {
      queryParams.push(new Date()) // Default to current date if not provided
    }

    const operationsResult = await pool.query(operationsQuery, queryParams)

    if (operationsResult.rows.length === 0)
      return res.status(404).send('Операции для данной партии не найдены')

    let info = {
      id_part: idPart,
      name: '',
      description: '',
      operations: [],
      completed_operations: [],
    }

    const operations = new Set()
    const completed_operations = new Set()

    operationsResult.rows.forEach((row) => {
      operations.add(row.no_oper)
      if (row.operation_ready) {
        completed_operations.add(row.no_oper)
      }

      // Update part info if not set
      if (!info.name) {
        info.name = row.name
        info.description = row.description
        info.timestamp = row.timestamp
      }
    })

    info.operations = Array.from(operations).sort()
    info.completed_operations = Array.from(completed_operations).sort()

    res.json({ info })
  } catch (err) {
    console.error('Error executing query', err.stack)
    res.status(500).send('Ошибка при выполнении запроса')
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
             vu2.login                                           AS canceller_login,  -- Added canceller's login
             sno.status_ready                                    AS operation_ready  -- Added operation readiness status
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
        operation_ready: row.operation_ready, // Adding operation readiness status
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

module.exports = {
  getToolHistoryByPartId,
  getToolHistoryByPartIdInfo,
}
