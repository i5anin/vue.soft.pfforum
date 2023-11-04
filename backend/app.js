const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');  // Изменено с './routes' на './router'
const app = express();
const port = 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: err.message });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
