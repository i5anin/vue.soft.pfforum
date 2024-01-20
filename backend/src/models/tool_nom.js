// models/tool_nom.js
const { Sequelize, DataTypes } = require('sequelize')
const { getNetworkDetails } = require('../db_type')
const config = require('../config')

const { databaseType } = getNetworkDetails()
const dbConfig =
  databaseType === 'build' ? config.dbConfig : config.dbConfigTest

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    port: dbConfig.port,
  }
)

const ToolNom = sequelize.define(
  'ToolNom',
  {
    // поля модели
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.FLOAT,
    },
    // другие поля...
  },
  {
    tableName: 'tool_nom', // Указываем точное имя таблицы
    schema: 'dbo',
    timestamps: false, // Установите в true, если у вас есть поля createdAt и updatedAt
  }
)

module.exports = ToolNom
