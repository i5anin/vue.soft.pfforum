//login

const { Pool } = require('pg')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config() // Это должно быть в самом верху файла
const jwt = require('jsonwebtoken')
const config = require('../../config')
const { getNetworkDetails } = require('../../db_type')
const express = require('express')
const app = express()

const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest

// Создание пула соединений с базой данных
const pool = new Pool(dbConfig)

async function getDatabaseInfo(req, res) {
  try {
    const dbInfo = getNetworkDetails()
    res.json(dbInfo)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
async function login(req, res) {
  try {
    const { login, password } = req.body

    // Проверяем существование пользователя
    const userQuery = 'SELECT * FROM vue_users WHERE login = $1'
    const userResult = await pool.query(userQuery, [login])

    if (
      userResult.rows.length > 0 &&
      userResult.rows[0].password === password
    ) {
      // Пользователь найден и пароль совпадает, генерируем токен
      const token = uuidv4()
      const updateTokenQuery =
        'UPDATE vue_users SET token = $1 WHERE login = $2'
      await pool.query(updateTokenQuery, [token, login])

      res.json({ status: 'ok', token })
    } else {
      res
        .status(401)
        .json({ status: 'error', message: 'Неправильный логин или пароль' })
    }
  } catch (error) {
    console.error('Ошибка при логине:', error)
    res
      .status(500)
      .json({ status: 'error', message: 'Внутренняя ошибка сервера' })
  }
}
async function checkLogin(req, res) {
  try {
    const { token } = req.body

    // Проверяем действительность токена
    const tokenQuery = 'SELECT * FROM vue_users WHERE token = $1'
    const tokenResult = await pool.query(tokenQuery, [token])

    if (tokenResult.rows.length > 0) {
      res.json({ status: 'ok', user: tokenResult.rows[0] })
    } else {
      res
        .status(401)
        .json({ status: 'error', message: 'Недействительный токен' })
    }
  } catch (error) {
    console.error('Ошибка при проверке токена:', error)
    res
      .status(500)
      .json({ status: 'error', message: 'Внутренняя ошибка сервера' })
  }
}

module.exports = {
  getDatabaseInfo,
  login,
  checkLogin,
}
