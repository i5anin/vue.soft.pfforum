const { Pool } = require('pg')
const config = require('../../../../config')
const { getNetworkDetails } = require('../../../../db_type')

// Настройка подключения к базе данных
const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest
const pool = new Pool(dbConfig)

async function getEmailRecipients(role) {
  const emailResult = await pool.query(
    `
    SELECT email
    FROM dbo.vue_users
    WHERE role = $1
    ORDER BY id LIMIT 1
  `,
    [role]
  )

  let email = null

  if (emailResult.rows.length > 0) {
    email = emailResult.rows[0].email
  } else {
    console.log(`Пользователь с ролью ${role} не найден.`)
  }

  return email
}

module.exports = getEmailRecipients
