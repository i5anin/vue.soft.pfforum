const express = require('express');
const { Client } = require('pg');

const app = express();
const port = 4000;

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '123qwe!',
  port: 5432,
});

client.connect();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // разрешить запросы с любого источника
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});


app.get('/tools', async (req, res) => {
  const text = 'SELECT * FROM dbo.tool_num';

  try {
    const result = await client.query(text);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});


app.post('/add-tool', express.json(), async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).send('Bad Request: Missing required fields');
  }

  const text = 'INSERT INTO dbo.tool_num (name) VALUES ($1) RETURNING *';
  const values = [name];

  try {
    const result = await client.query(text, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

