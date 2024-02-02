module.exports = {
  dbConfigTest: {
    user: process.env.DB_TEST_USER,
    host: process.env.DB_TEST_HOST,
    database: process.env.DB_TEST_NAME,
    password: process.env.DB_TEST_PASSWORD,
    port: process.env.DB_TEST_PORT,
    dialect: 'postgres',
  },
  dbConfig: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    dialect: 'postgres',
  },
  server: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  port: process.env.PORT,
  emailConfig: {
    host: 'server87.hosting.reg.ru',
    port: 25,
    user: 'report@pf-forum.ru',
    pass: 'gE0pU0iH4lzB0jQ0',
  },
}

// EMAIL_HOST=server87.hosting.reg.ru
// EMAIL_PORT=25
// EMAIL_USER=report@pf-forum.ru
// EMAIL_PASS=gE0pU0iH4lzB0jQ0
