module.exports = {
  dbConfig: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'db',
    password: process.env.DB_PASSWORD || '123qwe!',
    port: process.env.DB_PORT || 5432,
  },
  port: process.env.PORT || 4000,
};