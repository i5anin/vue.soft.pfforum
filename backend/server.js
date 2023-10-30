const express = require('express')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()
const cors = require('cors')

const app = express()
const port = 4000

const db = pgp({
  user: 'postgres',
  host: 'localhost',
  database: 'db',
  password: '123qwe!',
  port: 5432,
})

app.use(bodyParser.json())
app.use(cors())

app.get('/tools', async (req, res) => {
  try {
    const query = `
     SELECT
      nom.id,
        nom.name,
        nom.group_id,
        group_id.name AS group_name,
        nom.mat_id,
        mat_id.name AS mat_name,
        nom.type_id,
        type_id.name AS type_name,
        nom.rad,
        nom.kolvo_sklad,
        nom.norma,
        nom.zakaz
      FROM
        dbo.nom
      INNER JOIN
        dbo.group_id ON nom.group_id = group_id.id
      INNER JOIN
        dbo.mat_id ON nom.mat_id = mat_id.id
      INNER JOIN
        dbo.type_id ON nom.type_id = type_id.id;
    `;
    const result = await db.any(query);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});


app.post('/add-tool', async (req, res) => {
  const { name, group_id, mat_id, type_id } = req.body
  if (!name || !group_id || !mat_id || !type_id) {
    return res.status(400).send('Bad Request: Missing required fields')
  }

  try {
    const result = await db.one(
      'INSERT INTO dbo.tool_num (name, group_id, mat_id, type_id,red,kolvo_sklad,norma,zakaz,group_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, group_id, mat_id, type_id],
    )
    res.json(result)
  } catch (err) {
    console.error('Error:', err.message)  // добавлено логирование
    console.error('Stack:', err.stack)    // добавлено логирование
    res.status(500).send(err.message)
  }
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

