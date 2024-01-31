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
    // Update status_temp
    const updateQuery = `
      UPDATE dbo.tool_history_nom t
      SET status_temp =
        CASE
          WHEN specs_nom_operations.status_ready = TRUE THEN 't'
          WHEN specs_nom_operations.status_ready = FALSE THEN 'f'
          ELSE NULL
        END
      FROM dbo.specs_nom_operations
      WHERE tool_history_nom.id = specs_nom_operations.id;
    `
    await pool.query(updateQuery)

    console.log('Проверка наличия обновленных строк...')
    // Fetch and group rows by id_tool, summing up quantities
    const { rows } = await pool.query(`
     SELECT tool_nom.id AS tool_id, tool_nom.name, SUM(tool_history_nom.quantity) AS total_quantity
      FROM dbo.tool_history_nom
      JOIN dbo.tool_nom ON tool_history_nom.id_tool = tool_nom.id
      WHERE tool_history_nom.status_temp = 't'
      GROUP BY tool_nom.id, tool_nom.name;
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
  let htmlContent = '<h2>Изменился статус следующих инструментов:</h2>'
  htmlContent +=
    '<table border="1"><tr><th>Tool ID</th><th>Название</th><th>Кол-во</th></tr>'

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
