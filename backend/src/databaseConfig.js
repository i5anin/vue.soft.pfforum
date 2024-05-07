const { getNetworkDetails } = require('./db_type')
const config = require('./config')
const express = require('express')
const app = express()

function getDbConfig() {
  const networkDetails = 'определить ip клиента!!!'

  if (networkDetails.ip === '192.168.0.200') {
    console.log(config.dbConfigSuperTest)
    return config.dbConfigSuperTest
  } else {
    return networkDetails.databaseType === 'build'
      ? config.dbConfig
      : config.dbConfigTest
  }
}

module.exports = getDbConfig
