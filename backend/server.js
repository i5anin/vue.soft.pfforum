const express = require('express')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()
const cors = require('cors')

const app = express()
const port = 4000

// Создаем новое подключение к базе данных
const db = pgp({
  user: 'postgres',
  host: 'localhost',
  database: 'db', //postgres //db
  password: '123qwe!',
  port: 5432,
})

// Добавляем middleware для парсинга JSON из входящих запросов
app.use(bodyParser.json())
// Добавляем middleware для поддержки Cross-Origin Resource Sharing (CORS)
app.use(cors())

// Запускаем сервер на заданном порту
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

app.get('/tools', async (req, res) => {
  try {
    const toolQuery = `
     SELECT nom.id, nom.name, nom.group_id, nom.mat_id, nom.type_id, nom.rad, nom.kolvo_sklad, nom.norma, nom.zakaz
     FROM dbo.nom
    `
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

    const [tools, groups, materials, types] =
      await Promise.all([
        db.any(toolQuery),
        db.any(groupQuery),
        db.any(matQuery),
        db.any(typeQuery),
      ]) //Promise.all Параллельное выполнение, Ждёт все промисы, Порядок результатов строгий

    // Отправляем данные обратно клиенту в формате JSON
    res.json({
      tools,
      groups,
      materials,
      types,
    })
  } catch (err) {
    // Логируем ошибку в консоль и отправляем ее обратно клиенту
    console.error(err)
    res.status(500).send(err.message)
  }
})

// Обрабатываем POST запросы на URL /add-tool
app.post('/add-tool', async (req, res) => {
  // Извлекаем данные из тела запроса
  const { name, group_id, mat_id, type_id } = req.body
  // Проверяем, что все необходимые данные были отправлены
  if (!name || !group_id || !mat_id || !type_id) {
    return res.status(400).send('Bad Request: Missing required fields')
  }

  try {
    // SQL запрос для добавления нового инструмента в базу данных
    const result = await db.one(
      'INSERT INTO dbo.nom (name, group_id, mat_id, type_id,red,kolvo_sklad,norma,zakaz,group_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, group_id, mat_id, type_id],
    )
    res.json(result)
  } catch (err) {
    // Логируем ошибку в консоль и отправляем ее обратно клиенту
    console.error('Error:', err.message)  // добавлено логирование
    console.error('Stack:', err.stack)    // добавлено логирование
    res.status(500).send(err.message)
  }
})


app.put('/edit-tool/:id', async (req, res) => {
  // Извлекаем id инструмента из параметров URL
  const { id } = req.params;
  // Извлекаем данные из тела запроса
  const { name, group_id, mat_id, type_id, kolvo_sklad, norma, zakaz, rad } = req.body

  try {
    const result = await db.one(
      'UPDATE dbo.nom SET name=$1, group_id=$2, mat_id=$3, type_id=$4, kolvo_sklad=$5, norma=$6, zakaz=$7, rad=$8 WHERE id=$9 RETURNING *',
      [name, group_id, mat_id, type_id, kolvo_sklad, norma, zakaz, rad, id],
    )
    res.json(result)
  } catch (err) {
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).send(err.message)
  }
})

app.post('/add-material', async (req, res) => {
  const { name } = req.body
  if (!name) {
    return res.status(400).send('Bad Request: Missing name field')
  }

  try {
    const result = await db.one(
      'INSERT INTO dbo.mat_id (name) VALUES ($1) RETURNING *',
      [name],
    )
    res.json(result)
  } catch (err) {
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).send(err.message)
  }
})

app.post('/add-type', async (req, res) => {
  const { name } = req.body
  if (!name) {
    return res.status(400).send('Bad Request: Missing name field')
  }

  try {
    const result = await db.one(
      'INSERT INTO dbo.type_id (name) VALUES ($1) RETURNING *',
      [name],
    )
    res.json(result)
  } catch (err) {
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).send(err.message)
  }
})

app.post('/add-group', async (req, res) => {
  const { name } = req.body
  if (!name) {
    return res.status(400).send('Bad Request: Missing name field')
  }

  try {
    const result = await db.one(
      'INSERT INTO dbo.group_id (name) VALUES ($1) RETURNING *',
      [name],
    )
    res.json(result)
  } catch (err) {
    console.error('Error:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).send(err.message)
  }
})



