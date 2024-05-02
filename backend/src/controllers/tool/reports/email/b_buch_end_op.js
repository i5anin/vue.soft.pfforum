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
    const { rows } = await pool.query(`
      SELECT
        tool_nom.ID AS tool_id,
        tool_nom.NAME AS tool_name,
        SUM(tool_history_nom.quantity) AS total_quantity,
        tool_history_nom.specs_op_id,
        dbo.kolvo_prod_ready(specs_nom_operations.specs_nom_id) AS quantity_prod,
        specs_nom_operations.specs_nom_id,
        specs_nom.NAME AS specs_name,
        specs_nom.description,
        operations_ordersnom.no,
        dbo.get_full_cnc_type(dbo.get_op_type_code(specs_nom_operations.ID)) as cnc_type
      FROM
        dbo.tool_history_nom
        JOIN dbo.tool_nom ON tool_history_nom.id_tool = tool_nom.ID
        JOIN dbo.specs_nom_operations ON tool_history_nom.specs_op_id = specs_nom_operations.ID
        JOIN dbo.specs_nom ON specs_nom_operations.specs_nom_id = specs_nom.ID
        JOIN dbo.operations_ordersnom ON specs_nom_operations.ordersnom_op_id = operations_ordersnom.ID
      WHERE
        (tool_history_nom.sent IS NULL OR NOT tool_history_nom.sent)
        AND (specs_nom_operations.status_ready IS NULL OR specs_nom_operations.status_ready)
      GROUP BY
        tool_nom.ID,
        tool_nom.NAME,
        tool_history_nom.specs_op_id,
        specs_nom_operations.specs_nom_id,
        specs_nom.NAME,
        specs_nom.description,
        operations_ordersnom.no,
        specs_nom_operations.ID
    `)

    if (rows.length === 0) {
      console.log('Нет обновлений среди завершенных операций.')
      return
    }

    for (const row of rows) {
      const detailedDescription = `${row.specs_name} - ${row.description} - ${row.no} - ${row.cnc_type}`
      console.log(
        `Отправка уведомления для операции: ${detailedDescription}...`
      )
      let htmlContent = `<h2>Операция завершена: ${detailedDescription}</h2>`
      htmlContent += '<table border="1"><tr>'

      const tableStructure = [
        { label: 'specs_op_id', text: 'ID операции' },
        { label: 'specs_nom_id', text: 'ID партии' },
        { label: 'tool_name', text: 'Название инструмента' },
        { label: 'total_quantity', text: 'Кол-во выдано' },
        { label: 'quantity_prod', text: 'Кол-во продукции' },
        // { label: 'specs_name', text: 'Название' },
        // { label: 'description', text: 'Описание' },
        // { label: 'no', text: 'Номер' },
        // { label: 'cnc_type', text: 'Тип CNC' },
      ]

      // Добавляем заголовки в таблицу
      tableStructure.forEach((header) => {
        htmlContent += `<th>${header.text}</th>`
      })
      htmlContent += '</tr><tr>'

      // Добавляем данные для строки
      tableStructure.forEach((header) => {
        htmlContent += `<td>${row[header.label] ?? 'N/A'}</td>`
      })
      htmlContent += '</tr></table>'

      console.log('From:', process.env.MAIL_USER)
      console.log('To:', process.env.MAIL_TO)

      const mailOptions = {
        from: process.env.MAIL_USER,
        to: process.env.MAIL_TO,
        subject: `Бухгалтерия: отчет по завершению операции: ${detailedDescription}`,
        html: htmlContent,
      }

      if (!mailOptions.from || !mailOptions.to) {
        throw new Error('Не указан адрес отправителя или получателя')
      }

      // Отправка уведомления
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error)
        } else {
          console.log(
            `Отправлено уведомление для операции: ${detailedDescription}. Status info: ${info.response}`
          )
        }
      })

      // !!! Обновляем статус отправки для обработанных строк
      await pool.query(
        `UPDATE dbo.tool_history_nom
         SET sent = TRUE
         WHERE specs_op_id = $1 AND NOT sent`,
        [row.specs_op_id]
      )
    }
  } catch (error) {
    console.error('Ошибка при проверке статуса изменений:', error)
  }
}

// Schedule the cron job
min15 = '0 */15 * * * *'
sec10 = '*/10 * * * * *'
cron.schedule(min15, () => {
  checkStatusChanges()
    .then(() => {
      // console.log('Задача выполнена успешно.')
    })
    .catch((error) => {
      console.error('Ошибка при выполнении задачи: ', error)
    })
})

module.exports = { checkStatusChanges }
