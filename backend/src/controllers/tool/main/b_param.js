const { Pool } = require('pg')
const { getNetworkDetails } = require('../../../db_type')
const config = require('../../../config')

// Получение настроек для подключения к базе данных
const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest

// Создание соединения с базой данных
const pool = new Pool(dbConfig)

async function addToolParam(req, res) {
  const { info } = req.body

  try {
    const query = 'INSERT INTO dbo.tool_params (info) VALUES ($1) RETURNING *'
    const result = await pool.query(query, [info])

    if (result.rows.length > 0) {
      res.status(201).json(result.rows[0])
    } else {
      res.status(400).send('Parameter could not be added')
    }
  } catch (error) {
    console.error('Error adding new tool parameter:', error)
    res.status(500).send('Internal Server Error')
  }
}

async function getToolParams(req, res) {
  try {
    // Query modified to include ORDER BY clause for sorting by id in ascending order
    const query = 'SELECT id, info FROM dbo.tool_params ORDER BY id ASC'
    const result = await pool.query(query)
    res.json(result.rows) // Send the query result back to the client
  } catch (error) {
    console.error('Error fetching tool parameters:', error)
    res.status(500).send('Internal Server Error') // Send error message
  }
}

async function getToolParamsParentId(req, res) {
  const parentId = req.params.id // Используем id из параметров маршрута

  try {
    const query = `
      SELECT property
      FROM dbo.tool_nom
      WHERE parent_id = $1`

    const { rows } = await pool.query(query, [parentId])

    // Используем объект для агрегации значений по каждому ключу
    const paramsAggregation = {}

    rows.forEach((row) => {
      const properties = row.property // Считаем, что property уже десериализован из JSON
      Object.entries(properties).forEach(([key, value]) => {
        // Если ключа еще нет в агрегации, создаем под него Set
        if (!paramsAggregation[key]) {
          paramsAggregation[key] = new Set()
        }
        // Добавляем значение в Set для соответствующего ключа
        paramsAggregation[key].add(value)
      })
    })

    // Преобразуем объект агрегации в массив объектов для возврата
    const aggregatedValues = Object.entries(paramsAggregation).map(
      ([key, valueSet]) => ({
        id: key,
        values: Array.from(valueSet), // Преобразуем Set в массив
      })
    )

    // Возвращаем агрегированные значения в ответе
    res.json(aggregatedValues)
  } catch (error) {
    console.error('Ошибка при получении уникальных значений параметра:', error)
    res.status(500).send('Server error')
  }
}

async function getToolNameId(req, res) {
  try {
    // Получаем parent_id из параметров маршрута
    const parentId = req.params.id
    // Запрос на выборку id и name всех инструментов, у которых parent_id соответствует переданному параметру
    const query = 'SELECT id, name FROM dbo.tool_nom WHERE parent_id = $1'
    const { rows } = await pool.query(query, [parentId])

    // Преобразуем массив объектов в массив строк названий инструментов
    const namesArray = rows.map((row) => row.name)

    // Возвращаем результат в ответе
    res.json(namesArray)
  } catch (error) {
    console.error(
      'Ошибка при получении названий инструментов по parent_id:',
      error
    )
    res.status(500).send('Server error')
  }
}

async function deleteToolParam(req, res) {
  const id = req.params.id // Получение ID из параметров запроса
  try {
    const query = 'DELETE FROM dbo.tool_params WHERE id = $1'
    const result = await pool.query(query, [id])

    if (result.rowCount === 0) {
      // Нет такого ID в базе данных
      res.status(404).send('Parameter not found')
    } else {
      res.status(200).send('Parameter deleted successfully')
    }
  } catch (error) {
    console.error('Error deleting tool parameter:', error)
    res.status(500).send('Internal Server Error')
  }
}

async function updateToolParam(req, res) {
  const id = req.params.id // Получение ID из параметров запроса
  const { info } = req.body // Получение нового названия из тела запроса

  try {
    const query = 'UPDATE dbo.tool_params SET info = $1 WHERE id = $2'
    const result = await pool.query(query, [info, id])

    if (result.rowCount === 0) {
      // Нет такого ID в базе данных
      res.status(404).send('Parameter not found')
    } else {
      res.status(200).send('Parameter updated successfully')
    }
  } catch (error) {
    console.error('Error updating tool parameter:', error)
    res.status(500).send('Internal Server Error')
  }
}

async function getFilterParamsParentId(req, res) {
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
      WHERE tool_nom.parent_id = $1`

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
      .filter((param) => param.values.length > 0) // Исключаем параметры с одним значением

    // Отправка результата
    res.json(paramsList)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
}

module.exports = {
  getToolParams,
  updateToolParam,
  deleteToolParam,
  addToolParam,
  getToolNameId,
  getToolParamsParentId,
  getFilterParamsParentId,
}
