module.exports = {
  dbConfig: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  },
  server: {
    host: '192.168.0.11', // Или другой хост, если он у вас есть
    port: process.env.PORT || 3000 // Значение порта по умолчанию, если переменная окружения не установлена
  },
  port: process.env.PORT,
}
