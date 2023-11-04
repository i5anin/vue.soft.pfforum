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

    // Запросы
    const toolQuery = `
      SELECT nom.id, nom.name, nom.group_id, nom.mat_id, nom.type_id, nom.rad, nom.kolvo_sklad, nom.norma, nom.zakaz
      FROM dbo.nom
      ${search ? `WHERE nom.name LIKE '%${search}%'` : ''}
      ORDER BY nom.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const groupQuery = `
      SELECT id, name AS group_name
      FROM dbo.group_id
    `;
    const matQuery = `
      SELECT id, name AS mat_name
      FROM dbo.mat_id
    `;
    const typeQuery = `
      SELECT id, name AS type_name
      FROM dbo.type_id
    `;

    const [tools, groups, materials, types] =
      await Promise.all([
        pool.query(toolQuery),  // заменено db.any на pool.query
        pool.query(groupQuery),  // заменено db.any на pool.query
        pool.query(matQuery),  // заменено db.any на pool.query
        pool.query(typeQuery),  // заменено db.any на pool.query
      ]); //Promise.all Параллельное выполнение, Ждёт все промисы, Порядок результатов строгий

    // Отправляем данные обратно клиенту в формате JSON
    res.json({
      tools: tools.rows,  // Обновлено, чтобы возвращать строки результата
      groups: groups.rows,  // Обновлено, чтобы возвращать строки результата
      materials: materials.rows,  // Обновлено, чтобы возвращать строки результата
      types: types.rows,  // Обновлено, чтобы возвращать строки результата
    });
  } catch (err) {
    // Логируем ошибку в консоль и отправляем ее обратно клиенту
    console.error(err);
    res.status(500).send(err.message);
  }
}

async function deleteTool(req, res) {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM tools WHERE id = $1 RETURNING *', [id])
    res.json(result.rows[0])
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
      [name, group_id, mat_id, type_id, rad, kolvo_sklad, norma, zakaz]
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
module.exports = { getTools, deleteTool, addTool, editTool, addMaterial, addType, addGroup }
