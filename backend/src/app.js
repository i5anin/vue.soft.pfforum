require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const config = require('./config');
const routers = require('./routers')


const app = express()

// Добавляем middleware для парсинга JSON из входящих запросов
app.use(bodyParser.json())
// Добавляем middleware для поддержки Cross-Origin Resource Sharing (CORS)
app.use(cors())

app.use('/api', routers)

// Middleware для обработки ошибок
app.use((err, req, res, next) => {
  console.error(err.stack); // Логируем стек ошибки в консоль для отладки

  // Определяем статус ошибки
  const status = err.status || 500;

  // Отправляем клиенту статус ошибки и сообщение
  res.status(status).send({
    status: status,
    message: err.message || 'Произошла ошибка на сервере',
  });
});


// Запускаем сервер на заданном порту
// Запускаем сервер на заданном порту
app.listen(config.port, () => {
  console.log(`DB connect http://${config.dbConfig.host}:${config.dbConfig.port}`);
  console.log(`Server is run http://${config.server.host}:${config.server.port}`);
});

