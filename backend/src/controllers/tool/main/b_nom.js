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

async function getTools(req, res) {
  try {
    const { search, parent_id, onlyInStock } = req.query
    const page = parseInt(req.query.page || 1, 10)
    const limit = parseInt(req.query.limit || 15, 10)
    const offset = (page - 1) * limit

    let conditions = []

    // Обработка стандартных параметров
    if (search) {
      conditions.push(`tool_nom.name ILIKE '%${search.replace(/'/g, "''")}%'`)
    }

    if (parent_id) {
      conditions.push(`tool_nom.folder_id = ${parent_id}`)
    }

    if (onlyInStock === 'true') {
      conditions.push(`tool_nom.sklad > 0`)
    }

    // Обработка динамических параметров
    let dynamicParams = Object.entries(req.query)
      .filter(([key, value]) => key.startsWith('param_') && value)
      .map(([key, value]) => {
        const paramId = key.split('_')[1] // Получаем идентификатор параметра
        return `tool_nom.property ->> '${paramId}' = '${value.replace(
          /'/g,
          "''"
        )}'`
      })

    conditions = [...conditions, ...dynamicParams]

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

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
      LIMIT ${limit} OFFSET ${offset}
    `

    const [countResult, toolsResult, paramsMapping] = await Promise.all([
      pool.query(countQuery),
      pool.query(toolQuery),
      getParamsMapping(),
    ])

    const totalCount = parseInt(countResult.rows[0].count, 10)

    const uniqueParams = new Set()
    const propertyValues = {} // Объект для хранения уникальных значений свойств

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
              uniqueParams.add(key) // Добавление ключа свойства в uniqueParams

              // Добавление уникальных значений для каждого свойства
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

    // Преобразование Set в массив для каждого свойства
    Object.keys(propertyValues).forEach((key) => {
      propertyValues[key] = Array.from(propertyValues[key])
    })

    const paramsList = Array.from(uniqueParams)
      .map((key) => {
        // Фильтрация параметров, имеющих более одного значения
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
      .filter((item) => item != null) // Исключение null значений после фильтрации

    res.json({
      currentPage: page,
      itemsPerPage: limit,
      totalCount,
      tools: formattedTools,
      paramsList,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

async function deleteTool(req, res) {
  const { id } = req.params
  try {
    // Проверяем, существует ли инструмент с данным ID
    const toolExists = await pool.query(
      `SELECT id
       FROM dbo.tool_nom
       WHERE id = $1`,
      [id]
    )

    // Если инструмент существует, продолжаем операцию удаления
    if (toolExists.rowCount > 0) {
      await pool.query(
        `DELETE
         FROM dbo.tool_nom
         WHERE id = $1`,
        [id]
      )
      res.json({ success: 'OK' })
    } else {
      // Если инструмент не найден, возвращаем ошибку
      res.status(404).json({ error: 'Инструмент с таким ID не найден.' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).send(error.message)
  }
}

async function addTool(req, res) {
  const { name, parent_id, property, sklad, norma } = req.body

  try {
    if (parent_id <= 1) {
      return res
        .status(400)
        .json({ error: 'parent_id must be greater than 1.' })
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
  const { name, parent_id, property, sklad, norma } = req.body

  try {
    // Проверка, что parent_id больше 1
    if (parent_id <= 1) {
      return res
        .status(400)
        .json({ error: 'parent_id must be greater than 1.' })
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

    // Обновляем поля sklad и norma в запросе
    const result = await pool.query(
      'UPDATE dbo.tool_nom SET name=$1, parent_id=$2, property=$3, sklad=$4, norma=$5 WHERE id=$6 RETURNING *',
      [name, parent_id, propertyString, sklad, norma, id]
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
      SELECT t.*, tt.name as folder_name
      FROM dbo.tool_nom t
      LEFT JOIN dbo.tool_tree tt ON t.parent_id = tt.id AND t.parent_id = 1
      WHERE t.id = $1`

    const result = await pool.query(query, [id])

    if (result.rows.length > 0) {
      const toolData = result.rows[0]

      // Создание JSON-ответа с данными инструмента и названием папки
      const jsonResponse = {
        id: toolData.id,
        type_id: toolData.type_id,
        mat_id: toolData.mat_id,
        name: toolData.name,
        group_id: toolData.group_id,
        sklad: toolData.sklad,
        norma: toolData.norma,
        parent_id: toolData.parent_id,
        folder_name: toolData.folder_name,
        property: toolData.property,
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

async function getFilterParamsByParentId(req, res) {
  let { parent_id } = req.params // Получаем parent_id из параметров запроса

  // Преобразуем parent_id в число, если это возможно
  parent_id = Number(parent_id)

  // Проверяем, является ли результат преобразования допустимым целым числом
  if (isNaN(parent_id) || !Number.isInteger(parent_id)) {
    // Возвращаем ошибку клиенту, если parent_id не является целым числом
    return res.status(400).json({ error: 'Parent ID must be an integer' })
  }

  try {
    // Получаем маппинг параметров
    const paramsMapping = await getParamsMapping()

    // SQL запрос для извлечения всех свойств инструментов в определенной категории
    const query = `
      SELECT tool_nom.property
      FROM dbo.tool_nom
      WHERE tool_nom.folder_id = $1`

    const { rows } = await pool.query(query, [parent_id])

    // Агрегируем уникальные значения для каждого параметра
    const paramsAggregation = {}

    rows.forEach((row) => {
      Object.entries(row.property || {}).forEach(([key, value]) => {
        if (!paramsAggregation[key]) {
          paramsAggregation[key] = new Set()
        }
        paramsAggregation[key].add(value)
      })
    })

    // Преобразование агрегированных данных в требуемый формат
    const paramsList = Object.entries(paramsAggregation)
      .map(([key, valuesSet]) => ({
        key: key,
        label: paramsMapping[key] ? paramsMapping[key].info : key, // Используем маппинг для заполнения label
        values: Array.from(valuesSet),
      }))
      .filter((param) => param.values.length > 1) // Исключаем параметры с одним значением

    // Отправка результата
    res.json(paramsList)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
}

// Экспорт контроллеров
module.exports = {
  getToolById,
  getTools,
  addTool,
  editTool,
  deleteTool,
  getFilterParamsByParentId,
}
