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
    // Выбираем уникальные ID операций, для которых уведомления еще не отправлены
    const operationsResult = await pool.query(`
      SELECT DISTINCT specs_op_id
      FROM dbo.tool_history_nom
      WHERE sent != TRUE
      ORDER BY
        specs_op_id
    `)

    const operations = operationsResult.rows

    // Если операций нет, то ничего не делаем
    if (operations.length === 0) {
      console.log('Нет операций для отправки уведомлений.')
      return
    }

    // Перебираем операции и отправляем уведомления
    for (const operation of operations) {
      const specsOpId = operation.specs_op_id

      // Получаем данные для отправки уведомлений, сгруппированные по операции
      const toolsResult = await pool.query(
        `
          SELECT tool_nom.NAME                                           AS tool_name,
                 SUM(tool_history_nom.quantity)                          AS total_quantity,
                 dbo.kolvo_prod_ready(specs_nom_operations.specs_nom_id) AS quantity_prod,
                 specs_nom_operations.specs_nom_id,
                 specs_nom.NAME                                          AS specs_name,
                 specs_nom.description                                   AS description,
                 operations_ordersnom.no AS no,
            dbo.get_full_cnc_type(dbo.get_op_type_code(specs_nom_operations.ID)) AS cnc_type
          FROM dbo.tool_history_nom
            LEFT JOIN dbo.tool_nom
          ON tool_history_nom.id_tool = tool_nom.ID
            LEFT JOIN dbo.specs_nom_operations ON tool_history_nom.specs_op_id = specs_nom_operations.ID
            LEFT JOIN dbo.specs_nom ON specs_nom_operations.specs_nom_id = specs_nom.ID
            LEFT JOIN dbo.operations_ordersnom ON specs_nom_operations.ordersnom_op_id = operations_ordersnom.ID
          WHERE tool_history_nom.specs_op_id = $1
          GROUP BY tool_nom.NAME,
            specs_nom_operations.specs_nom_id,
            specs_nom.NAME,
            specs_nom.description,
            operations_ordersnom.no,
            specs_nom_operations.ID
        `,
        [specsOpId]
      )

      console.log(toolsResult.rows)

      const tools = toolsResult.rows

      // Если для указанной операции нет инструментов в базе данных
      if (tools.length === 0) {
        await logError(specsOpId, 'Ошибка: набор tools пуст.', pool)
        continue
      }

      // Формируем HTML уведомления
      let htmlContent = `<h2>Операция завершена: ${specsOpId}</h2>`

      if (tools.length === 0) {
        throw new Error('Ошибка: набор tools пуст.')
      }

      if (tools.length > 0) {
        const firstTool = tools[0] // Получаем первый элемент из массива результатов запроса
        // Если информация отсутствует, выдаем ошибку

        if (!firstTool.specs_name || !firstTool.quantity_prod) {
          throw new Error('Отсутствуют данные для формирования уведомления.')
        }

        console.log(firstTool)

        // Продолжаем формирование HTML с правильными данными
        htmlContent += `<p>${firstTool.specs_name} - ${firstTool.description} - ${firstTool.no} - ${firstTool.cnc_type}</p>`
        htmlContent += `<h3>Кол-во продукции: ${firstTool.quantity_prod}</h3>`
      }
      htmlContent += `<table border='1'><tr><th>Название инструмента</th><th>Кол-во выдано</th></tr>`

      // Теперь добавляем только инструменты и их количество
      tools.forEach((tool) => {
        htmlContent += `<tr><td>${tool.tool_name}</td><td>${tool.total_quantity}</td></tr>`
      })

      htmlContent += `</table>`

      // Определите переменные среды для адреса отправителя и получателя
      const mailOptions = {
        from: process.env.MAIL_USER,
        to: process.env.MAIL_TO,
        subject: `Отчет по завершению операции: ${specsOpId}`,
        html: htmlContent,
      }

      // Отправка уведомления
      transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
          console.log(error)
        } else {
          console.log(
            `Отправлено уведомление для операции: ${specsOpId}. Status info: ${info.response}`
          )
          // Обновляем статус отправки для операции, если уведомление успешно отправлено
          await pool.query(
            `
              UPDATE dbo.tool_history_nom
              SET sent = TRUE
              WHERE specs_op_id = $1
            `,
            [specsOpId]
          )
          await pool.query(
            `INSERT INTO dbo.vue_log (message, datetime_log)
             VALUES ($1, NOW())`,
            [
              `Операция: ${specsOpId}, кол-во инструмента: ${tools.length}, отправлено на почту: ${process.env.MAIL_TO}`,
            ]
          )
        }
      })
    }
  } catch (error) {
    console.error('Ошибка отправки уведомлений:', error)
  }
}

// Код для инициализации и настройки nodemailer, cron и подключения к базе данных остается прежним.

module.exports = { checkStatusChanges }

// Schedule the cron job
min15 = '0 */15 * * * *'
sec10 = '*/10 * * * * *'
cron.schedule(sec10, () => {
  checkStatusChanges()
    .then(() => {
      // console.log('Задача выполнена успешно.')
    })
    .catch((error) => {
      console.error('Ошибка при выполнении задачи: ', error)
    })
})

module.exports = { checkStatusChanges }
