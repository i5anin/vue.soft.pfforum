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

async function checkStatusChanges() {
  try {
    console.log('Проверка наличия обновленных строк...')
    // Сохраняем текущий статус во временную переменную
    let previousStatuses = await pool.query(`
      SELECT t.id, t.completed_previous
      FROM dbo.tool_history_nom t;
    `)

    // Обновляем completed_previous на основе status_ready
    await pool.query(`
      UPDATE dbo.tool_history_nom t
      SET completed_previous =
        CASE
          WHEN s.status_ready = TRUE THEN 't'
          ELSE 'f'
        END
      FROM dbo.specs_nom_operations s
      WHERE t.id = s.id;
    `)

    console.log('Проверка наличия обновленных строк...')
    // Фильтруем строки, где статус изменился с null или 'f' на 't'
    const changedRows = previousStatuses.rows.filter(
      (row) =>
        (row.completed_previous === null || row.completed_previous === 'f') &&
        rows.find((r) => r.id === row.id).completed_previous === 't'
    )

    if (changedRows.length > 0) {
      sendEmailNotification(changedRows)
    } else {
      console.log('Строки для отправки электронной почты не обновлены')
    }
  } catch (error) {
    console.error('Ошибка при проверке изменений статуса:', error)
  }
}

function sendEmailNotification(rows) {
  let htmlContent = '<h2>Изменился статус следующих инструментов:</h2>'
  htmlContent +=
    '<table border="1"><tr><th>Tool ID</th><th>Name</th><th>Total Quantity</th></tr>'

  rows.forEach((row) => {
    htmlContent += `<tr><td>${row.tool_id}</td><td>${row.name}</td><td>${row.total_quantity}</td></tr>`
  })

  htmlContent += '</table>'

  const mailOptions = {
    from: 'report@pf-forum.ru',
    to: 'isa@pf-forum.ru',
    subject: 'Бухгалтерия: по окончанию операции',
    html: htmlContent,
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

// Schedule the cron job
cron.schedule('* * * * *', () => {
  console.log('Running a task every minute')
  checkStatusChanges()
})
