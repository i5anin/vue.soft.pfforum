const { Pool } = require('pg')
const { getNetworkDetails } = require('../db_type')
const config = require('../config')

const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest

// Создание пула соединений с базой данных
const pool = new Pool(dbConfig)

// Экспорт функции для получения дерева инструментов

async function getDamaged(req, res) {
  try {
    const page = parseInt(req.query.page || 1, 10)
    const limit = parseInt(req.query.limit || 15, 10)
    const offset = (page - 1) * limit

    // Запрос для подсчета общего количества уникальных id
    const countQuery = `
      SELECT COUNT(DISTINCT id)
      FROM dbo.tool_history_damaged;
    `

    // Запрос для получения агрегированных данных истории повреждений
    const dataQuery = `
      SELECT
        tool_history_damaged.id,
        tool_history_damaged.id_tool,
        tool_nom.name AS tool_name,
        tool_history_damaged.id_user,
        operators.fio,
        tool_history_damaged.cnc_code,
        cnc.cnc_name,
        tool_history_damaged.comment
      FROM dbo.tool_history_damaged
      INNER JOIN dbo.tool_nom ON tool_history_damaged.id_tool = tool_nom.id
      INNER JOIN dbo.operators ON tool_history_damaged.id_user = operators.id
      LEFT JOIN dbo.cnc ON tool_history_damaged.cnc_code = cnc.cnc_code
      ORDER BY tool_history_damaged.id
      LIMIT ${limit}
      OFFSET ${offset};
    `

    const countResult = await pool.query(countQuery)
    const dataResult = await pool.query(dataQuery)

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

async function addToolHistoryDamaged(req, res) {
  try {
    // Извлекаем данные из тела запроса
    const { id_tool, id_user, cnc_code, comment } = req.body

    // Проверяем наличие всех необходимых параметров
    if (!id_tool || !id_user || !cnc_code || !comment) {
      return res.status(400).send('Отсутствует один из обязательных параметров')
    }

    // Проверяем существование пользователя
    const userQuery = `SELECT id FROM dbo.operators WHERE id = $1 AND active = 't'`
    const userResult = await pool.query(userQuery, [id_user])
    if (userResult.rows.length === 0) {
      return res.status(400).send('Пользователь не найден')
    }

    // Проверяем существование станка
    const cncQuery = `SELECT cnc_code FROM dbo.cnc WHERE cnc_code = $1 AND active = 't'`
    const cncResult = await pool.query(cncQuery, [cnc_code])
    if (cncResult.rows.length === 0) {
      return res.status(400).send('Станок не найден')
    }

    // Проверяем существование инструмента и достаточное количество на складе
    const toolQuery = `SELECT sklad FROM dbo.tool_nom WHERE id = $1;`
    const toolResult = await pool.query(toolQuery, [id_tool])
    if (toolResult.rows.length === 0) {
      return res.status(400).send('Инструмент не найден')
    }
    if (toolResult.rows[0].sklad < 1) {
      return res.status(400).send('Недостаточно инструмента на складе')
    }

    // Вставка данных в таблицу tool_history_damaged
    const insertQuery = `
      INSERT INTO dbo.tool_history_damaged (id_tool, id_user, cnc_code, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `
    await pool.query(insertQuery, [id_tool, id_user, cnc_code, comment])

    // Обновление количества инструмента на складе
    const updateSkladQuery = `
      UPDATE dbo.tool_nom
      SET sklad = sklad - 1
      WHERE id = $1;
    `
    await pool.query(updateSkladQuery, [id_tool])

    res
      .status(200)
      .json({
        success: 'OK',
        message: 'Запись успешно добавлена и количество на складе обновлено',
      })
  } catch (error) {
    console.error(
      'Ошибка при добавлении записи о поврежденном инструменте:',
      error
    )
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    })
  }
}

module.exports = {
  getDamaged,
  addToolHistoryDamaged,
}
