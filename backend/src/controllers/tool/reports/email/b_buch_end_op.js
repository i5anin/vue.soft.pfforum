const cron = require('node-cron')
const nodemailer = require('nodemailer')
const { Pool } = require('pg')
const config = require('../../../../config')
const { emailConfig } = require('../../../../config')
const { getNetworkDetails } = require('../../../../db_type')
const { htmlToText } = require('nodemailer-html-to-text')

console.log('Почтовый сервер:')
console.log('Host:', process.env.MAIL_HOST)
console.log('Port:', process.env.MAIL_PORT)
console.log('User:', process.env.MAIL_USER)
console.log('Pass:', process.env.MAIL_PASS)
console.log('From:', process.env.MAIL_USER)
console.log('To:', process.env.MAIL_TO)

console.log('\nКонфигурация базы данных:')
console.log('User:', process.env.DB_USER || process.env.DB_TEST_USER)
console.log('Host:', process.env.DB_HOST || process.env.DB_TEST_HOST)
console.log('Database:', process.env.DB_NAME || process.env.DB_TEST_NAME)
console.log('Password:', process.env.DB_PASSWORD)
console.log('Port:', process.env.DB_PORT || process.env.DB_TEST_PORT)

// Настройка подключения к базе данных
const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest
const pool = new Pool(dbConfig)

// Set up Nodemailer
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: false,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
})

// Use htmlToText plugin
transporter.use('compile', htmlToText())

// Массив для отслеживания уже отправленных уведомлений
const sentNotifications = []

async function checkStatusChanges() {
  try {
    const operations = await pool.query(`
      SELECT DISTINCT
        specs_op_id
      FROM
        dbo.tool_history_nom
      WHERE
        sent != TRUE
        AND EXISTS (
          SELECT 1
          FROM dbo.specs_nom_operations
          WHERE
            dbo.specs_nom_operations.ID = dbo.tool_history_nom.specs_op_id
            AND (specs_nom_operations.status_ready IS NULL OR specs_nom_operations.status_ready)
        )
    `)

    for (const operation of operations.rows) {
      const tools = await pool.query(
        `
        SELECT
          tool_nom.NAME AS tool_name,
          SUM(tool_history_nom.quantity) AS total_quantity
        FROM
          dbo.tool_history_nom
        JOIN dbo.tool_nom ON tool_history_nom.id_tool = tool_nom.ID
        WHERE
          tool_history_nom.specs_op_id = $1
          AND tool_history_nom.sent != TRUE
        GROUP BY
          tool_nom.NAME
      `,
        [operation.specs_op_id]
      )

      // Если инструменты есть, объединяем их и отправляем уведомление.
      if (tools.rows.length > 0) {
        let htmlContent = `<h2>Операция завершена: ID ${operation.specs_op_id}</h2>`
        htmlContent +=
          '<table border="1"><tr><th>Название инструмента</th><th>Кол-во выдано</th></tr>'

        tools.rows.forEach((tool) => {
          htmlContent += `<tr><td>${tool.tool_name}</td><td>${tool.total_quantity}</td></tr>`
        })
        htmlContent += '</table>'

        const mailOptions = {
          from: process.env.MAIL_USER,
          to: process.env.MAIL_TO,
          subject: `Уведомление о завершении операции ID ${operation.specs_op_id}`,
          html: htmlContent,
        }

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error)
          } else {
            console.log(
              `Отправлено уведомление для операции: ID ${operation.specs_op_id}. Status info: ${info.response}`
            )
          }
        })

        // После успешной отправки обновляем статус sent для всех инструментов этой операции
        await pool.query(
          `
          UPDATE dbo.tool_history_nom
          SET sent = TRUE
          WHERE specs_op_id = $1
        `,
          [operation.specs_op_id]
        )
      }
    }
  } catch (error) {
    console.error('Ошибка при проверке статуса изменений:', error)
  }
}

// Schedule the cron job
min15 = '0 */15 * * * *'
sec30 = '*/30 * * * * *'
cron.schedule(sec30, () => {
  checkStatusChanges()
    .then(() => {
      // console.log('Задача выполнена успешно.')
    })
    .catch((error) => {
      console.error('Ошибка при выполнении задачи: ', error)
    })
})

module.exports = { checkStatusChanges }
