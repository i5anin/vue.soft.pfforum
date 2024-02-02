const cron = require('node-cron')
const nodemailer = require('nodemailer')
const { Pool } = require('pg')
const config = require('../../../config')
const { emailConfig } = require('../../../config')
const { getNetworkDetails } = require('../../../db_type')
const { htmlToText } = require('nodemailer-html-to-text')

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
    // Получаем строки для отправки электронной почты
    const { rows } = await pool.query(`
      SELECT
          tool_nom.ID AS tool_id,
          tool_nom.NAME,
          SUM(tool_history_nom.quantity) AS total_quantity,
          tool_history_nom.specs_op_id
      FROM
          dbo.tool_history_nom
      JOIN dbo.tool_nom ON tool_history_nom.id_tool = tool_nom.ID
      JOIN dbo.specs_nom_operations ON tool_history_nom.specs_op_id = specs_nom_operations.ID
      WHERE
          NOT tool_history_nom.sent
          AND specs_nom_operations.status_ready
      GROUP BY
          tool_nom.ID,
          tool_nom.NAME,
          tool_history_nom.specs_op_id
    `)

    if (rows.length === 0) {
      console.log('Нет обновлений среди завершенных операций.')
      return
    }

    // Группируем строки по specs_op_id
    const groupedBySpecsOpId = rows.reduce((acc, row) => {
      ;(acc[row.specs_op_id] = acc[row.specs_op_id] || []).push(row)
      return acc
    }, {})

    for (const [specsOpId, rows] of Object.entries(groupedBySpecsOpId)) {
      console.log(`Отправка уведомления для операции с ID ${specsOpId}...`)
      let htmlContent = '<h2>Изменился статус следующих инструментов:</h2>'
      htmlContent +=
        '<table border="1"><tr><th>ID Инструмента</th><th>Название</th><th>Количество</th></tr>'

      // Добавляем строки для каждого инструмента
      rows.forEach((row) => {
        htmlContent += `<tr><td>${row.tool_id}</td><td>${row.name}</td><td>${row.total_quantity}</td></tr>`
      })

      htmlContent += '</table>'

      const mailOptions = {
        from: 'report@pf-forum.ru',
        to: 'isa@pf-forum.ru',
        subject: `Бухгалтерия: обновление статуса операции ${specsOpId}`,
        html: htmlContent,
      }

      // Отправка уведомления
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error)
        } else {
          console.log(
            `Отправлено уведомление для операции ${specsOpId}. Status info: ${info.response}`
          )
        }
      })

      // Обновляем статус отправки для обработанных строк
      await pool.query(
        `UPDATE dbo.tool_history_nom
         SET sent = TRUE
         WHERE specs_op_id = $1 AND NOT sent`,
        [specsOpId]
      )

      // Добавляем ID операции в массив отправленных уведомлений
      sentNotifications.push(specsOpId)
    }
  } catch (error) {
    console.error('Ошибка при проверке статуса изменений:', error)
  }
}

function sendEmailNotification(row) {
  console.log(`Отправка уведомления для инструмента с ID ${row.tool_id}...`)
  let htmlContent = '<h2>Изменился статус инструмента:</h2>'
  htmlContent +=
    '<table border="1"><tr><th>ID Инструмента</th><th>Название</th><th>Количество</th></tr>'

  htmlContent += `<tr><td>${row.tool_id}</td><td>${row.name}</td><td>${row.quantity}</td></tr>`

  htmlContent += '</table>'

  const mailOptions = {
    from: 'report@pf-forum.ru',
    to: 'isa@pf-forum.ru',
    subject: `Бухгалтерия: по окончанию операции  ${row.specs_op_id}`,
    html: htmlContent,
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log(
        `Отправлено электронное письмо с указанием номера операции ${row.specs_op_id}\n` +
          `status info:` +
          info.response +
          `\n`
      )
    }
  })
}

// Schedule the cron job
cron.schedule('* */15 * * * *', () => {
  checkStatusChanges()
})
