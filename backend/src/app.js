require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const config = require('./config');
const routers = require('./routers')
const os = require('os');

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

const networkInterfaces = os.networkInterfaces();

let localIp;
for (let interfaceDetail of Object.values(networkInterfaces)) {
  for (let interface of interfaceDetail) {
    // Проверяем, что это IPv4 и не внутренний адрес (не 127.0.0.1), и что он соответствует подсети 192.168.3.*
    if (interface.family === 'IPv4' && !interface.internal && interface.address.startsWith('192.168.')) {
      localIp = interface.address;
      break;
    }
  }
  if (localIp) {
    break;
  }
}

if (!localIp) {
  throw new Error('Не удалось определить локальный IP-адрес.');
}


// Запускаем сервер на заданном порту
// Запускаем сервер на заданном порту
app.listen(config.port, localIp, () => {
  console.log(`DB connect http://${config.dbConfig.host}:${config.dbConfig.port}`);
  console.log(`Server is running on http://${localIp}:${config.server.port}`);
});

