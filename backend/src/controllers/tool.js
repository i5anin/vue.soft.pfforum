// Импорт зависимостей
const { Pool } = require('pg')
const dbConfig = require('../config').dbConfig

// Создание пула подключений к БД
const pool = new Pool(dbConfig)

// Определение контроллеров
async function getTools(req, res) {
  try {
    // Получение параметров запроса
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Подготовка запроса и параметров в зависимости от наличия search
    let searchCondition = '';
    let queryParams = [limit, offset];  // перемещаем параметры limit и offset в начало массива queryParams
    if (search) {
      searchCondition = 'WHERE nom.name LIKE $1';
      queryParams.unshift(`%${search}%`);  // добавляем параметр search в начало массива queryParams
    }

    // Запрос на получение общего количества инструментов
    const countQuery = `
      SELECT COUNT(*)::INTEGER
      FROM dbo.nom
      ${searchCondition}
    `;
    const countResult = await pool.query(countQuery, search ? [queryParams[0]] : []);
    const totalCount = countResult.rows[0].count;

    // Запрос на получение инструментов
    const toolQuery = `
      SELECT
        nom.id,
        nom.name,
        nom.group_id,
        nom.mat_id,
        nom.type_id,
        nom.rad,
        nom.kolvo_sklad,
        nom.norma,
        nom.zakaz,
        grp.name as group_name,
        mat.name as mat_name,
        type.name as type_name
      FROM
        dbo.nom as nom
      JOIN
        dbo.group_id as grp
      ON
        nom.group_id = grp.id
      LEFT JOIN
        dbo.mat_id as mat
      ON
        nom.mat_id = mat.id
      LEFT JOIN
        dbo.type_id as type
      ON
        nom.type_id = type.id
      ${searchCondition}
      ORDER BY
        nom.id DESC
      LIMIT $2 OFFSET $3
    `;
    const tools = await pool.query(toolQuery, queryParams);

    // (остальная часть кода остается неизменной)

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}

async function deleteTool(req, res) {
  const { id } = req.params
  try {
    await pool.query(`DELETE FROM dbo.nom WHERE id=$1`, [id])
    res.json({ result: true })
  } catch (error) {
    console.error(error)
    res.status(500).send(error.message)
  }
}

async function addTool(req, res) {
  const { name, group_id, mat_id, type_id, kolvo_sklad, norma, zakaz, rad } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO dbo.nom (name, group_id, mat_id, type_id, rad, kolvo_sklad, norma, zakaz ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
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
  const { name, group_id, mat_id, type_id, kolvo_sklad, norma, zakaz, rad } = req.body

  try {
    const result = await pool.query('UPDATE dbo.nom SET name=$1, group_id=$2, mat_id=$3, type_id=$4, kolvo_sklad=$5, norma=$6, zakaz=$7, rad=$8 WHERE id=$9 RETURNING *', [name, group_id, mat_id, type_id, kolvo_sklad, norma, zakaz, rad, id])
    res.json(result.rows[0])  // Обновлено, чтобы возвращать первую строку результата
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
      FROM dbo.group_id
    `
    const matQuery = `
      SELECT id, name AS mat_name
      FROM dbo.mat_id
    `
    const typeQuery = `
      SELECT id, name AS type_name
      FROM dbo.type_id
    `

    // Параллельное выполнение запросов к базе данных
    const [groups, materials, types] = await Promise.all([
      pool.query(groupQuery),
      pool.query(matQuery),
      pool.query(typeQuery),
    ])

    // Форматирование результатов запросов в удобный для работы формат
    const formattedGroups = groups.rows.map(item => {
      return {
        id: item.id,
        name: item.group_name,
        // ... other fields ...
      }
    })

    const formattedMaterials = materials.rows.map(item => {
      return {
        id: item.id,
        name: item.mat_name,
        // ... other fields ...
      }
    })

    const formattedTypes = types.rows.map(item => {
      return {
        id: item.id,
        name: item.type_name,
        // ... other fields ...
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
  if (!name) {
    return res.status(400).send('Bad Request: Missing name field')
  }

  try {
    const result = await pool.query(  // Заменено db.one на pool.query
      'INSERT INTO dbo.mat_id (name) VALUES ($1) RETURNING *', [name])
    res.json(result.rows[0])  // Обновлено, чтобы возвращать первую строку результата
  } catch (err) {
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).send(err.message)
  }
}

async function addType(req, res) {
  const { name } = req.body
  if (!name) {
    return res.status(400).send('Bad Request: Missing name field')
  }

  try {
    const result = await pool.query('INSERT INTO dbo.type_id (name) VALUES ($1) RETURNING *', [name])
    res.json(result.rows[0])  // Обновлено, чтобы возвращать первую строку результата
  } catch (err) {
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).send(err.message)
  }
}

async function addGroup(req, res) {
  const { name } = req.body
  if (!name) {
    return res.status(400).send('Bad Request: Missing name field')
  }

  try {
    const result = await pool.query('INSERT INTO dbo.group_id (name) VALUES ($1) RETURNING *', [name])
    res.json(result.rows[0])  // Обновлено, чтобы возвращать первую строку результата
  } catch (err) {
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).send(err.message)
  }
}

// Экспорт контроллеров
module.exports = { getTools, deleteTool, addTool, editTool, addMaterial, addType, addGroup, getLibrary }
