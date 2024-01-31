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

    // Обновляем status_temp в tool_history_nom
    await pool.query(`
      UPDATE dbo.tool_history_nom
      SET status_temp =
        CASE
          WHEN (SELECT status_ready FROM dbo.specs_nom_operations WHERE id = tool_history_nom.specs_op_id) = TRUE THEN 't'
          WHEN (SELECT status_ready FROM dbo.specs_nom_operations WHERE id = tool_history_nom.specs_op_id) = FALSE THEN 'f'
          ELSE NULL
        END;
    `)

    console.log('Получение обновленных строк для отправки электронной почты...')
    // Получаем строки для отправки электронной почты
    const { rows } = await pool.query(`
      SELECT
        tool_nom.id AS tool_id,
        tool_nom.name,
        tool_history_nom.quantity,
        tool_history_nom.specs_op_id,
        tool_history_nom.status_temp,
        (SELECT status_ready FROM dbo.specs_nom_operations WHERE id = tool_history_nom.specs_op_id) AS status_ready
      FROM
        dbo.tool_history_nom
      JOIN
        dbo.tool_nom ON tool_history_nom.id_tool = tool_nom.id
      WHERE
        tool_history_nom.status_temp = 't';
    `)

    if (rows.length > 0) {
      sendEmailNotification(rows)
    } else {
      console.log('Строки для отправки электронной почты не обновлены')
    }
  } catch (error) {
    console.error('Ошибка при проверке статуса изменений:', error)
  }
}

function sendEmailNotification(rows) {
  let htmlContent = '<h2>Изменился статус следующих инструментов:</h2>'
  htmlContent +=
    '<table border="1"><tr><th>ID Инструмента</th><th>Название</th><th>Количество</th></tr>'

  rows.forEach((row) => {
    htmlContent += `<tr><td>${row.tool_id}</td><td>${row.name}</td><td>${row.quantity}</td></tr>`
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
  console.log('Запуск задачи каждую минуту')
  checkStatusChanges()
})
