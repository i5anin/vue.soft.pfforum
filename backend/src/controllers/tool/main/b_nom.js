// Импорт зависимостей
const { Pool } = require('pg')
const { getNetworkDetails } = require('../../../db_type')
const config = require('../../../config')

const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest
// Создание пула подключений к БД
const pool = new Pool(dbConfig)

async function getParamsMapping() {
  const query = 'SELECT id, info FROM dbo.tool_params'
  const result = await pool.query(query)
  return result.rows.reduce((acc, row) => {
    acc[row.id] = { info: row.info }
    return acc
  }, {})
}

function removeNullProperties(obj) {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === null) {
      delete obj[key]
    }
  })
  return obj
}

function replaceCommaWithDotInNumbers(obj) {
  const regex = /(\d),(\d)/g
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Заменяем только запятые, которые находятся между числами
      obj[key] = obj[key].replace(regex, '$1.$2')
    }
  }
}

async function getTools(req, res) {
  try {
    // Объединение параметров из тела POST-запроса и параметров строки запроса GET-запроса
    const params = { ...req.query, ...req.body }

    const { search, parent_id, onlyInStock, page = 1, limit = 50 } = params

    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)
    const offset = (pageNumber - 1) * limitNumber

    let conditions = []

    // Обработка стандартных параметров для фильтрации
    if (search)
      conditions.push(`tool_nom.name ILIKE '%${search.replace(/'/g, "''")}%'`)

    if (parent_id) conditions.push(`tool_nom.parent_id = ${parent_id}`)

    if (onlyInStock === 'true') conditions.push(`tool_nom.sklad > 0`)

    // Обработка динамических параметров для фильтрации
    let dynamicParams = Object.entries(params)
      .filter(([key, value]) => key.startsWith('param_') && value)
      .map(([key, value]) => {
        const paramId = key.split('_')[1] // Извлечение ID параметра
        return `tool_nom.property ->> '${paramId}' = '${value.replace(
          /'/g,
          "''"
        )}'`
      })

    conditions = [...conditions, ...dynamicParams]

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

    // SQL запросы для получения инструментов и их количества
    const countQuery = `
      SELECT COUNT(*)
      FROM dbo.tool_nom as tool_nom
      ${whereClause}
    `

    const toolQuery = `
      SELECT tool_nom.id,
             tool_nom.name,
             tool_nom.property,
             tool_nom.sklad,
             tool_nom.norma,
             tool_nom.limit
      FROM dbo.tool_nom as tool_nom
      ${whereClause}
      ORDER BY
        CASE WHEN tool_nom.sklad > 0 THEN 1 ELSE 2 END,
        tool_nom.name
      LIMIT ${limitNumber} OFFSET ${offset}
    `

    // Выполнение запросов и получение данных параметров одновременно
    const [countResult, toolsResult, paramsMapping] = await Promise.all([
      pool.query(countQuery),
      pool.query(toolQuery),
      getParamsMapping(),
    ])

    const totalCount = parseInt(countResult.rows[0].count, 10)

    // Обработка инструментов и параметров для ответа
    const uniqueParams = new Set()
    const propertyValues = {}

    const formattedTools = toolsResult.rows.map((tool) => {
      let formattedProperty = {}

      if (tool.property) {
        const propertyObj = tool.property

        formattedProperty = Object.entries(propertyObj).reduce(
          (acc, [key, value]) => {
            if (value !== '' && value !== null && paramsMapping[key]) {
              acc[key] = {
                info: paramsMapping[key].info,
                value: value,
              }
              uniqueParams.add(key)

              if (!propertyValues[key]) {
                propertyValues[key] = new Set()
              }
              propertyValues[key].add(value)
            }
            return acc
          },
          {}
        )
      }

      return {
        id: tool.id,
        name: tool.name,
        property: formattedProperty,
        sklad: tool.sklad,
        norma: tool.norma,
        limit: tool.limit,
      }
    })

    Object.keys(propertyValues).forEach((key) => {
      propertyValues[key] = Array.from(propertyValues[key])
    })

    const paramsList = Array.from(uniqueParams)
      .map((key) => {
        const values = propertyValues[key]
        if (values && values.length > 1) {
          return {
            key: key,
            label: paramsMapping[key]?.info || key,
            values: values,
          }
        }
        return null
      })
      .filter((item) => item != null)

    // Отправка ответа
    res.json({
      currentPage: pageNumber,
      itemsPerPage: limitNumber,
      totalCount,
      tools: formattedTools,
      // paramsList, TODO:DEL
    })
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

async function deleteTool(req, res) {
  const { id } = req.params
  try {
    // Проверяем наличие инструмента в истории выдачи
    const toolInIssueHistory = await pool.query(
      `SELECT 1
       FROM dbo.tool_history_nom
       WHERE id_tool = $1`,
      [id]
    )

    // Проверяем наличие инструмента в списке уничтоженных
    const toolInDamagedHistory = await pool.query(
      `SELECT 1
       FROM dbo.tool_history_damaged
       WHERE id_tool = $1`,
      [id]
    )

    if (toolInIssueHistory.rowCount > 0 || toolInDamagedHistory.rowCount > 0) {
      // Если инструмент есть в истории выдачи или среди уничтоженных, возвращаем ошибку
      return res.status(400).json({
        error:
          'Удаление запрещено: инструмент используется в истории выдачи или уничтожен.',
      })
    }

    // Если проверки пройдены, удаляем инструмент
    const toolExists = await pool.query(
      `SELECT id
       FROM dbo.tool_nom
       WHERE id = $1`,
      [id]
    )

    if (toolExists.rowCount > 0) {
      await pool.query(
        `DELETE
         FROM dbo.tool_nom
         WHERE id = $1`,
        [id]
      )
      res.json({ success: 'OK' })
    } else {
      res.status(404).json({ error: 'Инструмент с таким ID не найден.' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).send(error.message)
  }
}

async function addTool(req, res) {
  const { name, parent_id, property, sklad, norma } = req.body
  // Преобразование запятых в точки в числах в property
  replaceCommaWithDotInNumbers(property)

  try {
    if (parent_id <= 1)
      return res
        .status(400)
        .json({ error: 'parent_id must be greater than 1.' })

    // После проверки parent_id
    if (property && property.id) {
      const propertyIdCheckResult = await pool.query(
        'SELECT id FROM dbo.tool_params WHERE id = $1',
        [property.id]
      )

      if (propertyIdCheckResult.rowCount === 0) {
        return res.status(400).json({
          error: 'Specified property.id does not exist in tool_params.',
        })
      }
    }

    // Проверка существования parent_id в таблице dbo.tool_tree
    const parentCheckResult = await pool.query(
      'SELECT id FROM dbo.tool_tree WHERE id = $1',
      [parent_id]
    )

    if (parentCheckResult.rowCount === 0) {
      return res
        .status(400)
        .json({ error: 'Specified parent_id does not exist.' })
    }

    const propertyWithoutNull = removeNullProperties(property)
    const propertyString = JSON.stringify(propertyWithoutNull)

    // Добавляем поля sklad и norma в запрос
    const toolInsertResult = await pool.query(
      'INSERT INTO dbo.tool_nom (name, parent_id, property, sklad, norma) ' +
        'VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, parent_id, propertyString, sklad, norma]
    )

    const toolId = toolInsertResult.rows[0].id

    // Получение полной информации о добавленном инструменте
    const newToolResult = await pool.query(
      'SELECT * FROM dbo.tool_nom WHERE id = $1',
      [toolId]
    )

    if (newToolResult.rowCount > 0) {
      res.status(200).json({ success: 'OK', data: newToolResult.rows[0] })
    } else {
      res.status(404).json({ error: 'Tool added, but not found.' })
    }
  } catch (err) {
    console.error('Error:', err.message)
    res.status(500).json({ error: 'Error adding tool: ' + err.message })
  }
}

async function editTool(req, res) {
  const { id } = req.params
  const { name, parent_id, property, sklad, norma, limit } = req.body
  // Преобразование запятых в точки в числах в property
  replaceCommaWithDotInNumbers(property)

  try {
    if (parent_id <= 1)
      return res
        .status(400)
        .json({ error: 'parent_id must be greater than 1.' })

    // После проверки parent_id
    if (property && property.id) {
      const propertyIdCheckResult = await pool.query(
        'SELECT id FROM dbo.tool_params WHERE id = $1',
        [property.id]
      )

      if (propertyIdCheckResult.rowCount === 0) {
        return res.status(400).json({
          error: 'Specified property.id does not exist in tool_params.',
        })
      }
    }

    const parentCheckResult = await pool.query(
      'SELECT id FROM dbo.tool_tree WHERE id = $1',
      [parent_id]
    )

    if (parentCheckResult.rowCount === 0)
      return res
        .status(400)
        .json({ error: 'Specified parent_id does not exist.' })

    const propertyWithoutNull = removeNullProperties(property)
    const propertyString = JSON.stringify(propertyWithoutNull)

    const result = await pool.query(
      'UPDATE dbo.tool_nom SET name=$1, parent_id=$2, property=$3, sklad=$4, norma=$5, "limit"=$7 WHERE id=$6 RETURNING *',
      [name, parent_id, propertyString, sklad, norma, id, limit]
    )

    if (result.rowCount > 0) {
      res.status(200).json({ success: 'OK', data: result.rows[0] })
    } else {
      res.status(404).json({ error: 'Tool with the specified ID not found.' })
    }
  } catch (err) {
    console.error('Error:', err.message)
    res.status(500).json({ error: 'Error updating tool: ' + err.message })
  }
}

async function getToolById(req, res) {
  const { id } = req.params // Получение ID инструмента из параметров маршрута

  try {
    // Измененный запрос для получения данных инструмента и названия папки
    const query = `
      SELECT dbo.tool_nom.*, dbo.tool_tree.name as folder_name
      FROM dbo.tool_nom
      LEFT JOIN dbo.tool_tree ON dbo.tool_nom.parent_id = dbo.tool_tree.id
      WHERE dbo.tool_nom.id = $1`

    const result = await pool.query(query, [id])

    if (result.rows.length > 0) {
      const toolData = result.rows[0]

      // Создание JSON-ответа с данными инструмента и названием папки
      const jsonResponse = {
        id: toolData.id,
        parent_id: toolData.parent_id,
        name: toolData.name,
        folder_name: toolData.folder_name,
        property: toolData.property,
        sklad: toolData.sklad,
        limit: toolData.limit,
        norma: toolData.norma,
      }

      res.json(jsonResponse)
    } else {
      res.status(404).send('Инструмент не найден')
    }
  } catch (error) {
    console.error('Ошибка при получении инструмента:', error)
    res.status(500).send('Внутренняя ошибка сервера')
  }
}

// Экспорт контроллеров
module.exports = {
  getToolById,
  getTools,
  addTool,
  editTool,
  deleteTool,
}
