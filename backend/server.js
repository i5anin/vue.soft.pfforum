const restify = require('restify');
const { Client } = require('pg');

const server = restify.createServer();
const port = 4000;

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '123qwe!',
  port: 5432,
});

client.connect();

server.use(restify.plugins.bodyParser());
server.get('/tools', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM dbo.tool_num');
    return res.send(result.rows);
  } catch (err) {
    console.error(err);
    return res.send(500, err.message);
  }
});

server.post('/add-tool', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.send(400, 'Bad Request: Missing required fields');
  }

  try {
    const result = await client.query(
      'INSERT INTO dbo.tool_num (name) VALUES ($1) RETURNING *',
      [name]
    );
    return res.send(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.send(500, err.message);
  }
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
