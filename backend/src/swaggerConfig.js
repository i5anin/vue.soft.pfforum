// swaggerConfig.js

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Название вашего API',
      version: '1.0.0',
      description: 'Описание вашего API',
    },
  },
  // Путь к файлам с документированными маршрутами
  apis: ['./routers.js'],
}

module.exports = swaggerOptions
