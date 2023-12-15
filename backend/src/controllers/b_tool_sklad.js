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
      // widths: widths.rows.map((row) => row.width),
      // gabarits: gabarits.rows.map((row) => row.gabarit),
      // shags: shags.rows.map((row) => row.shag),
      // diams: diams.rows.map((row) => row.diam),
    }

    res.json(result)
  } catch (err) {
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).send(err.message)
  }
}

// Определение контроллеров

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
  const { name, property } = req.body

  try {
    // Преобразование объекта property в строку JSON для хранения в базе данных
    const propertyString = JSON.stringify(property)

    // Вставка данных инструмента
    const toolInsertResult = await pool.query(
      'INSERT INTO dbo.tool_nom (name, property) VALUES ($1, $2) RETURNING id',
      [name, propertyString]
    )

    const toolId = toolInsertResult.rows[0].id

    // Дополнительная логика обработки параметров, если необходимо
    // ...

    res.json({ toolId })
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

async function editTool(req, res) {
  const { id } = req.params
  const { name, group_id, mat_id, type_id, kolvo_sklad, norma, zakaz } =
    req.body

  try {
    const result = await pool.query(
      'UPDATE dbo.tool_nom SET name=$1, group_id=$2, mat_id=$3, type_id=$4, kolvo_sklad=$5, norma=$6, zakaz=$7, radius=$8, shag=$9, gabarit=$10, width=$11, diam=$12, geometry=$13 WHERE id=$14 RETURNING *',
      [name, group_id, mat_id, type_id, kolvo_sklad, norma, zakaz, id] // Add geometry here
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
  addToWarehouse,
  getToolsWithInventoryInfo,
}
