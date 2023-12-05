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

async function getToolNomSpec(req, res) {
  try {
    const specQuery = `
      SELECT
        id,
        rad,
        shag,
        gab
      FROM dbo.tool_nom_spec
    `

    const result = await pool.query(specQuery)

    if (result.rows.length > 0) {
      res.json(result.rows)
    } else {
      res.status(404).send('Спецификации не найдены.')
    }
  } catch (err) {
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).send(err.message)
  }
}

async function getUniqueToolSpecs(req, res) {
  try {
    // Отдельные запросы для каждого поля с исключением пустых строк
    const nameQuery = "SELECT DISTINCT name FROM dbo.tool_nom WHERE name <> ''"
    const widthQuery =
      "SELECT DISTINCT width FROM dbo.tool_nom WHERE width <> ''"
    const gabaritQuery =
      "SELECT DISTINCT gabarit FROM dbo.tool_nom WHERE gabarit <> ''"
    const shagQuery = "SELECT DISTINCT shag FROM dbo.tool_nom WHERE shag <> ''"
    const diamQuery = "SELECT DISTINCT diam FROM dbo.tool_nom WHERE diam <> ''"

    // Выполнение запросов параллельно
    const [names, widths, gabarits, shags, diams] = await Promise.all([
      pool.query(nameQuery),
      pool.query(widthQuery),
      pool.query(gabaritQuery),
      pool.query(shagQuery),
      pool.query(diamQuery),
    ])

    // Объединение результатов
    const result = {
      names: names.rows.map((row) => row.name),
      widths: widths.rows.map((row) => row.width),
      gabarits: gabarits.rows.map((row) => row.gabarit),
      shags: shags.rows.map((row) => row.shag),
      diams: diams.rows.map((row) => row.diam),
    }

    res.json(result)
  } catch (err) {
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).send(err.message)
  }
}

// async function getParamsMapping() {
//   const query = 'SELECT id, params FROM tool_params'
//   const result = await pool.query(query)
//   return result.rows.reduce((acc, row) => {
//     acc[row.id] = row.params
//     return acc
//   }, {})
// }

// Определение контроллеров
async function getTools(req, res) {
  try {
    // Получение параметров запроса
    const { search } = req.query
    const page = parseInt(req.query.page || 1, 10)
    const limit = parseInt(req.query.limit || 15, 10)
    const offset = (page - 1) * limit

    // Подготовка параметров для запросов
    const searchCondition = search ? `WHERE tool_nom.name ILIKE $1` : ''
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
             COALESCE (tool_group.name, '[нет данных]') as group_name,
             COALESCE (tool_mat.name, '[нет данных]')   as mat_name,
             COALESCE (tool_type.name, '[нет данных]')  as type_name,
             tool_nom.property
      FROM dbo.tool_nom as tool_nom
             LEFT JOIN dbo.tool_group ON tool_nom.group_id = tool_group.id
             LEFT JOIN dbo.tool_mat ON tool_nom.mat_id = tool_mat.id
             LEFT JOIN dbo.tool_type ON tool_nom.type_id = tool_type.id
      ${searchCondition}
      ORDER BY tool_nom.id DESC
      ${limitOffsetCondition}
    `

    // Функция для получения сопоставления параметров
    async function getParamsMapping() {
      const query = 'SELECT id, params FROM dbo.tool_params'
      const result = await pool.query(query)
      return result.rows.reduce((acc, row) => {
        acc[row.id] = row.params
        return acc
      }, {})
    }

    // Выполнение запросов
    const [countResult, tools, paramsMapping] = await Promise.all([
      pool.query(countQuery, search ? [`%${search}%`] : []),
      pool.query(toolQuery, queryParams),
      getParamsMapping(),
    ])

    const totalCount = countResult.rows[0].count

    // Форматирование данных инструментов
    const formattedTools = tools.rows.map((tool) => {
      let formattedProperty = {}

      // Проверка на null или undefined перед парсингом JSON
      if (tool.property) {
        const propertyObj = JSON.parse(tool.property)

        formattedProperty = Object.entries(propertyObj).reduce(
          (acc, [key, value]) => {
            if (paramsMapping[key]) acc[paramsMapping[key]] = value // Убедитесь, что paramsMapping[key] существует
            return acc
          },
          {}
        )
      }

      return {
        id: tool.id,
        name: tool.name,
        property: formattedProperty,
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
    await pool.query(
      `DELETE
       FROM dbo.tool_nom
       WHERE id = $1`,
      [id]
    )
    res.json({ result: true })
  } catch (error) {
    console.error(error)
    res.status(500).send(error.message)
  }
}

async function addTool(req, res) {
  const {
    name,
    group_id,
    mat_id,
    type_id,
    radius,
    shag,
    gabarit,
    width,
    diam,
  } = req.body

  try {
    const toolInsertResult = await pool.query(
      'INSERT INTO dbo.tool_nom (name, group_id, mat_id, type_id, radius, shag, gabarit, width, diam) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      [name, group_id, mat_id, type_id, radius, shag, gabarit, width, diam]
    )

    const toolId = toolInsertResult.rows[0].id

    res.json({
      toolId,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

async function editTool(req, res) {
  const { id } = req.params
  const {
    name,
    group_id,
    mat_id,
    type_id,
    kolvo_sklad,
    norma,
    zakaz,
    radius,
    shag,
    gabarit,
    width,
    diam,
    geometry,
  } = req.body

  try {
    const result = await pool.query(
      'UPDATE dbo.tool_nom SET name=$1, group_id=$2, mat_id=$3, type_id=$4, kolvo_sklad=$5, norma=$6, zakaz=$7, radius=$8, shag=$9, gabarit=$10, width=$11, diam=$12, geometry=$13 WHERE id=$14 RETURNING *',
      [
        name,
        group_id,
        mat_id,
        type_id,
        kolvo_sklad,
        norma,
        zakaz,
        radius,
        shag,
        gabarit,
        width,
        diam,
        geometry,
        id,
      ] // Add geometry here
    )

    if (result.rowCount > 0) {
      res.json({
        message: 'Инструмент успешно обновлен.',
        tool: result.rows[0],
      })
    } else {
      res.status(404).send('Инструмент с указанным ID не найден.')
    }
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
        FROM dbo.tool_group
    `
    const matQuery = `
      SELECT id, name AS mat_name
      FROM dbo.tool_mat
    `
    const typeQuery = `
      SELECT id, name AS type_name
      FROM dbo.tool_type
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
      'INSERT INTO dbo.tool_mat (name) VALUES ($1) RETURNING *',
      [name]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error:', err.message)
    res.status(500).send(err.message)
  }
}

async function addType(req, res) {
  const { name } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO dbo.tool_type (name) VALUES ($1) RETURNING *',
      [name]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error:', err.message)
    res.status(500).send(err.message)
  }
}

async function addGroup(req, res) {
  const { name } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO dbo.tool_group (name) VALUES ($1) RETURNING *',
      [name]
    )
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
      WHERE tool_nom.name ILIKE $1
    `

    const countResult = await pool.query(countQuery, [`%${query}%`])
    const totalCount = countResult.rows[0].count

    const searchQuery = `
      SELECT nom.id, tool_nom.name
      FROM dbo.tool_nom
      WHERE tool_nom.name ILIKE $1
      ORDER BY tool_nom.id DESC
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

async function deleteType(req, res) {
  const { id } = req.params

  try {
    await pool.query('DELETE FROM dbo.tool_type WHERE id = $1', [id])
    res.json({ message: 'Тип успешно удален' })
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

async function deleteMaterial(req, res) {
  const { id } = req.params

  try {
    await pool.query('DELETE FROM dbo.tool_mat WHERE id = $1', [id])
    res.json({ message: 'Материал успешно удален' })
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

async function deleteGroup(req, res) {
  const { id } = req.params

  try {
    await pool.query('DELETE FROM dbo.tool_group WHERE id = $1', [id])
    res.json({ message: 'Группа успешно удалена' })
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

//sklad
async function getToolsWithInventoryInfo(req, res) {
  try {
    // Получение параметров запроса
    const { search } = req.query
    const page = parseInt(req.query.page || 1, 10)
    const limit = parseInt(req.query.limit || 15, 10)
    const offset = (page - 1) * limit

    // Подготовка параметров для запросов
    const searchCondition = search ? `WHERE tool_nom.name ILIKE $1` : ''
    const limitOffsetCondition = search
      ? `LIMIT $2::bigint OFFSET $3::bigint`
      : `LIMIT $1::bigint OFFSET $2::bigint`
    const queryParams = search
      ? [`%${search}%`, limit, offset]
      : [limit, offset]

    // Запрос на получение инструментов
    const toolQuery = `
      SELECT tool_nom.id,
             tool_nom.name,
             tool_nom.group_id,
             tool_nom.mat_id,
             tool_nom.type_id,
             COALESCE (tool_group.name, '[нет данных]') as group_name,
             COALESCE (tool_mat.name, '[нет данных]') as mat_name,
             COALESCE (tool_type.name, '[нет данных]') as type_name,
             tool_nom.kolvo_sklad,
             tool_nom.norma,
             tool_nom.zakaz
      FROM dbo.tool_nom as tool_nom
             LEFT JOIN dbo.tool_group as tool_group ON tool_nom.group_id = tool_group.id
             LEFT JOIN dbo.tool_mat as tool_mat ON tool_nom.mat_id = tool_mat.id
             LEFT JOIN dbo.tool_type as tool_type ON tool_nom.type_id = tool_type.id
             ${searchCondition}
      ORDER BY tool_nom.id DESC
      ${limitOffsetCondition}
    `

    // Запрос на получение общего количества инструментов
    const countQuery = `
      SELECT COUNT(*)::INTEGER
      FROM dbo.tool_nom ${searchCondition}
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
        zakaz: tool.zakaz,
        mat: { name: tool.mat_name, id: tool.mat_id },
        type: { name: tool.type_name, id: tool.type_id },
        group: { name: tool.group_name, id: tool.group_id },
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

async function addToWarehouse(req, res) {
  const { id } = req.params // ID инструмента
  const { zakaz, norma, kolvo_sklad } = req.body // Полученные значения

  try {
    const result = await pool.query(
      'UPDATE dbo.tool_nom SET zakaz=$1, norma=$2, kolvo_sklad=$3 WHERE id=$4 RETURNING *',
      [zakaz, norma, kolvo_sklad, id] // Порядок параметров в соответствии с SQL-запросом
    )

    console.log(result)
    if (result.rowCount > 0) {
      res.json({
        message: 'Инструмент успешно добавлен на склад.',
        tool: result.rows[0],
      })
    } else {
      res.status(404).send('Инструмент с указанным ID не найден.')
    }
  } catch (err) {
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).send(err.message)
  }
}

// Экспорт контроллеров
module.exports = {
  deleteType,
  deleteMaterial,
  deleteGroup,
  getTools,
  deleteTool,
  addTool,
  editTool,
  addMaterial,
  addType,
  addGroup,
  addToWarehouse,
  getLibrary,
  getToolNomSpec,
  getUniqueToolSpecs,
  getToolsWithInventoryInfo,
}
