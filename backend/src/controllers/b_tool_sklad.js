// Импорт зависимостей
const { Pool } = require('pg')
const { getNetworkDetails } = require('../db_type')
const config = require('../config')

const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest
// Создание пула подключений к БД
const pool = new Pool(dbConfig)

async function getToolHistory(req, res) {
  try {
    const { search, parent_id, includeNull } = req.query
    const page = parseInt(req.query.page || 1, 10)
    const limit = parseInt(req.query.limit || 15, 10)
    const offset = (page - 1) * limit

    let conditions = []

    if (search) {
      conditions.push(`tool_nom.name ILIKE '%${search.replace(/'/g, "''")}%'`)
    }

    if (parent_id) {
      conditions.push(`tool_nom.parent_id = ${parent_id}`)
    }

    if (!includeNull || includeNull === 'false') {
      conditions.push(
        `(tool_nom.name IS NOT NULL AND tool_nom.name != '' AND tool_nom.property IS NOT NULL)`
      )
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

    const countQuery = `
      SELECT COUNT(*)
      FROM dbo.tool_history_nom
      INNER JOIN dbo.tool_nom ON tool_history_nom.id_nom = tool_nom.id
      ${whereClause}
    `

    const historyQuery = `
      SELECT tool_history_nom.id_oper,
             tool_history_nom.id_user,
             tool_history_nom.id_nom,
             tool_nom.name,
             tool_history_nom.quantity,
             tool_history_nom.date_p,
             tool_history_nom.date_u
      FROM dbo.tool_history_nom
      INNER JOIN dbo.tool_nom ON tool_history_nom.id_nom = tool_nom.id
      ${whereClause}
      ORDER BY tool_history_nom.id_oper DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const [countResult, historyResult] = await Promise.all([
      pool.query(countQuery),
      pool.query(historyQuery),
    ])

    const totalCount = parseInt(countResult.rows[0].count, 10)

    const formattedHistory = historyResult.rows.map((history) => {
      return {
        id_oper: history.id_oper,
        id_user: history.id_user,
        id_nom: history.id_nom,
        name: history.name,
        quantity: history.quantity,
        date_p: history.date_p,
        date_u: history.date_u,
      }
    })

    res.json({
      currentPage: page,
      itemsPerPage: limit,
      totalCount,
      history: formattedHistory,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

// Экспорт контроллеров
module.exports = {
  getToolHistory,
}
