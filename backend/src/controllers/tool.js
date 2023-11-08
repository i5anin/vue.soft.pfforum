// Импорт зависимостей
const { Pool } = require('pg')
const dbConfig = require('../config').dbConfig

// Создание пула подключений к БД
const pool = new Pool(dbConfig)

// Определение контроллеров
async function getTools(req, res) {
  try {
    // Получение параметров запроса
    const { search } = req.query
    const page = parseInt(req.query.page || 1, 10)
    const limit = parseInt(req.query.limit || 15, 10)
    const offset = (page - 1) * limit

    // Подготовка параметров для запросов
    const searchCondition = search ? `WHERE nom.name LIKE $1` : ''
    const limitOffsetCondition = search
      ? `LIMIT $2::bigint OFFSET $3::bigint`
      : `LIMIT $1::bigint OFFSET $2::bigint`
    const queryParams = search
      ? [`%${search}%`, limit, offset]
      : [limit, offset]

    // Запрос на получение общего количества инструментов
    const countQuery = `
      SELECT COUNT(*)::INTEGER
      FROM dbo.tool_nom ${searchCondition}
    `

    // Запрос на получение инструментов
    const toolQuery = `
      SELECT tool_nom.id,
             tool_nom.name,
             tool_nom.group_id,
             tool_nom.mat_id,
             tool_nom.type_id,
             tool_nom.rad,
             tool_nom.kolvo_sklad,
             tool_nom.norma,
             tool_nom.zakaz,
             tool_group_id.name as group_name,
             tool_mat_id.name   as mat_name,
             tool_type_id.name  as type_name
      FROM dbo.tool_nom as tool_nom
             JOIN
           dbo.tool_group_id as tool_group_id
           ON
             tool_nom.group_id = tool_group_id.id
             LEFT JOIN
           dbo.tool_mat_id as tool_mat_id
           ON
             tool_nom.mat_id = tool_mat_id.id
             LEFT JOIN
           dbo.tool_type_id as tool_type_id
           ON
               tool_nom.type_id = tool_type_id.id
               ${searchCondition}
      ORDER BY tool_nom.id DESC
        ${limitOffsetCondition}
    `

    // Выполнение запросов
    const [countResult, tools] = await Promise.all([
      pool.query(countQuery, search ? [`%${search}%`] : []),
      pool.query(toolQuery, queryParams),
    ])

    const totalCount = countResult.rows[0].count

    // Форматирование данных инструментов
    const formattedTools = tools.rows.map((tool) => {
      return {
        id: tool.id,
        name: tool.name,
        kolvo_sklad: tool.kolvo_sklad,
        norma: tool.norma,
        rad: tool.rad,
        zakaz: tool.zakaz,
        mat: {
          name: tool.mat_name,
          id: tool.mat_id,
        },
        type: {
          name: tool.type_name,
          id: tool.type_id,
        },
        group: {
          name: tool.group_name,
          id: tool.group_id,
        },
      }
    })

    res.json({
      currentPage: page,
      itemsPerPage: limit,
      totalCount,
      tools: formattedTools,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

async function deleteTool(req, res) {
  const { id } = req.params
  try {
    await pool.query(`DELETE
                      FROM dbo.tool_nom
                      WHERE id = $1`, [id])
    res.json({ result: true })
  } catch (error) {
    console.error(error)
    res.status(500).send(error.message)
  }
}

async function addTool(req, res) {
  const { name, group_id, mat_id, type_id, kolvo_sklad, norma, zakaz, rad } =
    req.body
  try {
    const result = await pool.query(
      'INSERT INTO dbo.tool_nom (name, group_id, mat_id, type_id, rad, kolvo_sklad, norma, zakaz ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, group_id, mat_id, type_id, rad, kolvo_sklad, norma, zakaz],
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

async function editTool(req, res) {
  // Извлекаем id инструмента из параметров URL
  const { id } = req.params
  // Извлекаем данные из тела запроса
  const { name, group_id, mat_id, type_id, kolvo_sklad, norma, zakaz, rad } =
    req.body

  try {
    const result = await pool.query(
      'UPDATE dbo.tool_nom SET name=$1, group_id=$2, mat_id=$3, type_id=$4, kolvo_sklad=$5, norma=$6, zakaz=$7, rad=$8 WHERE id=$9 RETURNING *',
      [name, group_id, mat_id, type_id, kolvo_sklad, norma, zakaz, rad, id],
    )
    res.json(result.rows[0]) // Обновлено, чтобы возвращать первую строку результата
  } catch (err) {
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).send(err.message)
  }
}

async function getLibrary(req, res) {
  try {
    // Запросы к базе данных для получения данных о группах, материалах и типах
    const groupQuery = `
        SELECT id, name AS group_name
        FROM dbo.tool_group_id
    `
    const matQuery = `
      SELECT id, name AS mat_name
      FROM dbo.tool_mat_id
    `
    const typeQuery = `
      SELECT id, name AS type_name
      FROM dbo.tool_type_id
    `

    // Параллельное выполнение запросов к базе данных
    const [groups, materials, types] = await Promise.all([
      pool.query(groupQuery),
      pool.query(matQuery),
      pool.query(typeQuery),
    ])

    // Форматирование результатов запросов в удобный для работы формат
    const formattedGroups = groups.rows.map((item) => {
      return {
        id: item.id,
        name: item.group_name,
      }
    })

    const formattedMaterials = materials.rows.map((item) => {
      return {
        id: item.id,
        name: item.mat_name,
      }
    })

    const formattedTypes = types.rows.map((item) => {
      return {
        id: item.id,
        name: item.type_name,
      }
    })

    // Отправка отформатированных данных обратно клиенту в формате JSON
    res.json({
      groups: formattedGroups,
      materials: formattedMaterials,
      types: formattedTypes,
    })
  } catch (err) {
    // Логирование ошибки и отправка ее обратно клиенту с кодом состояния 500
    console.error(err)
    res.status(500).send(err.message)
  }
}

async function addMaterial(req, res) {
  const { name } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO dbo.tool_mat_id (name) VALUES ($1) RETURNING *', [name])
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error:', err.message)
    res.status(500).send(err.message)
  }
}

async function addType(req, res) {
  const { name } = req.body
  try {
    const result = await pool.query('INSERT INTO dbo.tool_type_id (name) VALUES ($1) RETURNING *', [name])
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error:', err.message)
    res.status(500).send(err.message)
  }
}

async function addGroup(req, res) {
  const { name } = req.body
  try {
    const result = await pool.query('INSERT INTO dbo.tool_group_id (name) VALUES ($1) RETURNING *', [name])
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error:', err.message)
    res.status(500).send(err.message)
  }
}

async function searchTools(req, res) {
  const { query, page = 1, limit = 10 } = req.query
  const offset = (page - 1) * limit

  if (!query) {
    return res.status(400).send('Bad Request: Missing query parameter')
  }

  try {
    const countQuery = `
      SELECT COUNT(*)::INTEGER
      FROM dbo.tool_nom
      WHERE nom.name ILIKE $1
    `

    const countResult = await pool.query(countQuery, [`%${query}%`])
    const totalCount = countResult.rows[0].count

    const searchQuery = `
      SELECT nom.id, nom.name
      FROM dbo.tool_nom
      WHERE nom.name ILIKE $1
      ORDER BY nom.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const result = await pool.query(searchQuery, [`%${query}%`])

    res.json({
      currentPage: page,
      itemsPerPage: limit,
      totalCount,
      tools: result.rows,
    })
  } catch (err) {
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).send(err.message)
  }
}

// Экспорт контроллеров
module.exports = {
  getTools,
  deleteTool,
  addTool,
  editTool,
  addMaterial,
  addType,
  addGroup,
  getLibrary,
  searchTools,
}
