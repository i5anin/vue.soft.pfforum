const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const routers = require('./routers');

const app = express();

// Добавляем middleware для парсинга JSON из входящих запросов
app.use(bodyParser.json());
// Добавляем middleware для поддержки Cross-Origin Resource Sharing (CORS)
app.use(cors());

app.use('/api', routers);

// Запускаем сервер на заданном порту
app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});
