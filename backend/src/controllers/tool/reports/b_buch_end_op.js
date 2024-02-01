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
    // console.log('Проверка наличия обновленных строк...')

    // console.log('Получение обновленных строк для отправки электронной почты...')
    // Получаем строки для отправки электронной почты
    const { rows } = await pool.query(`
        SELECT
        tool_nom.ID AS tool_id,
        tool_nom.NAME,
        tool_history_nom.quantity,
        tool_history_nom.specs_op_id,
        tool_history_nom.sent,
        specs_nom_operations.status_ready
        FROM
        dbo.tool_history_nom
        JOIN dbo.tool_nom ON tool_history_nom.id_tool = tool_nom.
        ID JOIN dbo.specs_nom_operations ON tool_history_nom.specs_op_id = specs_nom_operations.ID
        WHERE
        NOT tool_history_nom.sent
        AND specs_nom_operations.status_ready
    `)

    if (rows.length === 0) {
      console.log('Нет обновленных строк среди завершенных операций.')
      return
    } else {
      console.log('Обнаружено обновление данных:')
    }

    for (const row of rows) {
      console.log(row)
      console.log('row =', row.tool_id)

      // Проверяем, было ли уже отправлено уведомление для данного инструмента
      await pool.query(
        `
          UPDATE dbo.tool_history_nom
          SET sent = TRUE
          FROM
          dbo.specs_nom_operations
          WHERE
          NOT tool_history_nom.sent
          AND specs_nom_operations.status_ready
          AND tool_history_nom.specs_op_id = specs_nom_operations.ID
      `
      )

      // Добавляем лог измененного ID истории инструмента
      console.log(
        `Изменен статус для инструмента с ID истории инструмента: ${row.tool_id}`
      )

      sendEmailNotification(row)
      // Добавляем ID инструмента в массив отправленных уведомлений
      sentNotifications.push(row.tool_id)
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
cron.schedule('*/10 * * * * *', () => {
  console.log('Запуск задачи каждые 10 секунд')
  checkStatusChanges()
})
