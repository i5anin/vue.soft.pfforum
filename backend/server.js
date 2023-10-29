const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const cors = require('cors');

const app = express();
const port = 4000;

const db = pgp({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '123qwe!',
  port: 5432,
});

app.use(bodyParser.json());
app.use(cors());

app.get('/tools', async (req, res) => {
  try {
    const result = await db.any('SELECT * FROM dbo.tool_num');
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.post('/add-tool', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).send('Bad Request: Missing required fields');
  }

  try {
    const result = await db.one(
      'INSERT INTO dbo.tool_num (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.json(result);
  } catch (err) {
    console.error('Error:', err.message);  // добавлено логирование
    console.error('Stack:', err.stack);    // добавлено логирование
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
