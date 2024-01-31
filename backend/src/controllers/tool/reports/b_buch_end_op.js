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
    // Update completed_previous
    const updateQuery = `
      UPDATE dbo.tool_history_nom t
      SET completed_previous =
        CASE
          WHEN s.status_ready = TRUE THEN 't'
          WHEN s.status_ready = FALSE THEN 'f'
          ELSE NULL
        END
      FROM dbo.specs_nom_operations s
      WHERE t.id = s.id;
    `
    await pool.query(updateQuery)

    console.log('Проверка наличия обновленных строк...')
    // Fetch and group rows by id_tool, summing up quantities
    const { rows } = await pool.query(`
      SELECT n.id AS tool_id, n.name, SUM(t.quantity) AS total_quantity
      FROM dbo.tool_history_nom t
      JOIN dbo.tool_nom n ON t.id_tool = n.id
      WHERE t.completed_previous = 't'
      GROUP BY n.id, n.name;
    `)

    if (rows.length > 0) {
      sendEmailNotification(rows)
    } else {
      console.log('Строки для отправки электронной почты не обновлены')
    }
  } catch (error) {
    console.error('Изменение статуса проверки ошибок:', error)
  }
}

function sendEmailNotification(rows) {
  let htmlContent = '<h2>The status of the following tools has changed:</h2>'
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