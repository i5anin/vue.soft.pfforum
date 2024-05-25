const { Pool } = require('pg')
const getDbConfig = require('../../../databaseConfig')

// Получение настроек для подключения к базе данных
const dbConfig = getDbConfig()

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

async function moveToolParam(req, res) {
  const { id } = req.params // Получаем ID из URL-параметра
  const { action } = req.body // Получаем действие из тела запроса

  try {
    // Получаем текущий порядок параметра
    const currentOrderQuery =
      'SELECT param_order FROM dbo.tool_params WHERE id = $1'
    const currentOrderResult = await pool.query(currentOrderQuery, [id])
    if (currentOrderResult.rows.length === 0) {
      res.status(404).send('Parameter not found')
      return
    }
    const currentOrder = currentOrderResult.rows[0].param_order

    // Определяем новый порядок в зависимости от действия
    const newOrderQuery =
      action === 'moveUp'
        ? 'SELECT id, param_order FROM dbo.tool_params WHERE param_order < $1 ORDER BY param_order DESC LIMIT 1'
        : 'SELECT id, param_order FROM dbo.tool_params WHERE param_order > $1 ORDER BY param_order ASC LIMIT 1'

    const newOrderResult = await pool.query(newOrderQuery, [currentOrder])
    if (newOrderResult.rowCount === 0) {
      res.status(400).send('No adjacent parameters to swap with')
      return
    }

    const adjacentParam = newOrderResult.rows[0]
    const adjacentOrderId = adjacentParam.id
    const adjacentOrder = adjacentParam.param_order

    // Запускаем транзакцию для обновления порядка
    await pool.query('BEGIN')
    const updateCurrentQuery =
      'UPDATE dbo.tool_params SET param_order = $1 WHERE id = $2'
    await pool.query(updateCurrentQuery, [adjacentOrder, id])
    const updateAdjacentQuery =
      'UPDATE dbo.tool_params SET param_order = $1 WHERE id = $2'
    await pool.query(updateAdjacentQuery, [currentOrder, adjacentOrderId])
    await pool.query('COMMIT')

    res.status(200).send('Parameter order updated successfully')
  } catch (error) {
    await pool.query('ROLLBACK')
    console.error('Error moving tool parameter:', error)
    res.status(500).send('Internal Server Error')
  }
}

async function getToolParams(req, res) {
  try {
    const sortBy = req.query.sort || 'param_order' // Сортировка по умолчанию: param_order
    const query = `SELECT id, info, param_order FROM dbo.tool_params ORDER BY ${sortBy} ASC`
    const result = await pool.query(query)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching tool parameters:', error)
    res.status(500).send('Internal Server Error')
  }
}

async function getToolParamsParentId(req, res) {
  const parentId = req.params.id

  try {
    const query = `
      SELECT id, info, param_order FROM dbo.tool_nom WHERE parent_id = $1 ORDER BY param_order;`

    const { rows } = await pool.query(query, [parentId])

    // Используем объект для агрегации значений по ключу и регистрации его порядка
    const paramsAggregation = {}

    rows.forEach((row) => {
      // Используем id в качестве ключа
      const key = row.id.toString()
      if (!paramsAggregation[key]) {
        paramsAggregation[key] = {
          values: new Set(), // Предполагаем, что значения будут добавлены позднее
          label: row.info,
          order: parseInt(row.param_order, 10), // Устанавливаем порядок параметра
        }
      }
    })

    // TODO: Здесь ваша логика добавления значений в paramsAggregation[key].values

    // Преобразовываем в массив объектов с ключом, меткой, порядком и значениями
    const result = Object.entries(paramsAggregation).map(
      ([key, { values, label, order }]) => ({
        key,
        label,
        param_order: order,
        values: Array.from(values),
      })
    )

    res.json(result)
  } catch (error) {
    console.error('Ошибка при получении данных параметров:', error)
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

module.exports = {
  getToolParams,
  updateToolParam,
  deleteToolParam,
  addToolParam,
  getToolParamsParentId,
  getToolNameId,
  moveToolParam,
}
