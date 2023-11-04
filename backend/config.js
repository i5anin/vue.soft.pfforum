const pgp = require('pg-promise')();
const config = require('./config');

const db = pgp({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

module.exports = db;
