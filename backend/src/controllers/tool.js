// Импорт зависимостей
const { Pool } = require('pg')
const dbConfig = require('../config').dbConfig

// Создание пула подключений к БД
const pool = new Pool(dbConfig)

// Определение контроллеров
// Определение контроллеров
async function getTools(req, res) {
  try {
    // Получение параметров запроса
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Запрос на получение общего количества инструментов
    const countQuery = `
      SELECT COUNT(*) FROM dbo.nom
      ${search ? `WHERE name LIKE '%${search}%'` : ''}
    `;
    const countResult = await pool.query(countQuery);
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
      ${search ? `WHERE nom.name LIKE '%${search}%'` : ''}
      ORDER BY
        nom.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const tools = await pool.query(toolQuery);

    // Форматирование данных инструментов
    const formattedTools = tools.rows.map(tool => {
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
      };
    });

    res.json({ totalCount, tools: formattedTools });

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
    const libraryQuery = `
      SELECT * FROM dbo.library
    `

    const library = await pool.query(libraryQuery)

    const formattedLibrary = library.rows.map(item => {
      return {
        id: item.id,
        name: item.name,
        // ... other fields ...
      }
    })

    res.json({
      library: formattedLibrary,
    })

  } catch (err) {
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
