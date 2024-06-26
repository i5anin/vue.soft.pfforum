const nodemailer = require('nodemailer')
const { Pool } = require('pg')
const { emailConfig } = require('../../../../config')
const { htmlToText } = require('nodemailer-html-to-text')
const getEmailRecipients = require('./getEmailRecipients')
const getDbConfig = require('../../../../databaseConfig')

// Настройка подключения к базе данных

const dbConfig = getDbConfig()
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

// Функция для формирования содержимого электронного письма
function createMailContent(tools, specsOpId) {
  let htmlContent = `<h2>Операция завершена: ${specsOpId}</h2>`
  if (tools.length > 0) {
    const firstTool = tools[0]
    if (!firstTool.specs_name)
      throw new Error('Отсутствуют данные для формирования уведомления.')

    htmlContent += `<p>${firstTool.specs_name} - ${firstTool.description} - ${
      firstTool.no || ''
    } - ${firstTool.cnc_type}</p>`
    htmlContent += `<h3>Кол-во продукции: ${firstTool.quantity_prod}</h3>`
    htmlContent += `<table border='1'><tr><th>Название инструмента</th><th>Кол-во выдано</th></tr>`
    tools.forEach((tool) => {
      htmlContent += `<tr><td>${tool.tool_name}</td><td>${tool.total_quantity}</td></tr>`
    })
    htmlContent += `</table>`
  }
  return htmlContent
}

async function checkStatusChanges() {
  let financeUserEmail
  let adminUserEmail
  try {
    // Выбираем уникальные ID операций, для которых уведомления еще не отправлены
    const operationsResult = await pool.query(`
      SELECT DISTINCT
        thn.specs_op_id
      FROM
        "dbo"."tool_history_nom" AS thn
          LEFT JOIN
        "dbo"."specs_nom_operations" AS sno ON thn.specs_op_id = sno.id
      WHERE
        sno.status_ready = true AND thn.sent IS NULL;
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
            AND tool_history_nom.quantity != 0
          GROUP BY tool_nom.NAME,
            specs_nom_operations.specs_nom_id,
            specs_nom.NAME,
            specs_nom.description,
            operations_ordersnom.no,
            specs_nom_operations.ID
        `,
        [specsOpId]
      )

      const tools = toolsResult.rows

      // Если для указанной операции нет инструментов в базе данных
      if (tools.length === 0) {
        await console.log(specsOpId, 'Ошибка: набор tools пуст.', pool)
        continue
      }

      // Формируем HTML уведомления
      const htmlContent = createMailContent(tools, specsOpId)

      financeUserEmail = await getEmailRecipients('finance')
      adminUserEmail = await getEmailRecipients('admin')

      let mailOptions = {}

      if (process.env.VITE_NODE_ENV === 'build' && financeUserEmail) {
        mailOptions = {
          from: process.env.MAIL_USER,
          to: financeUserEmail,
          subject: `Отчет по завершению операции: ${specsOpId}`,
          html: htmlContent,
        }
      } else if (adminUserEmail) {
        mailOptions = {
          from: process.env.MAIL_USER,
          to: adminUserEmail,
          subject: `Отчет по завершению операции для администратора: ${specsOpId}`,
          html: htmlContent,
        }
      }

      // Отправка уведомления
      transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
          console.log(error)
        } else {
          console.log(
            `Отправлено уведомление для операции: ${specsOpId}. Status info: ${info.response}`
          )

          // Получаем адрес электронной почты в зависимости от окружения
          // Обновляем статус отправки для операции, если уведомление успешно отправлено
          await pool.query(
            `
        UPDATE dbo.tool_history_nom
        SET sent = TRUE
        WHERE specs_op_id = $1
      `,
            [specsOpId]
          )
        }
      })
    }
  } catch (error) {
    console.error('Ошибка отправки уведомлений: ', error)
  }
}

// Schedule the cron job
// const min15 = '0 */15 * * * *'
// const sec10 = '*/10 * * * * *'
// cron.schedule(min15, () => {
//   checkStatusChanges()
//     .then(() => {
//       // console.log('Задача выполнена успешно.')
//     })
//     .catch((error) => {
//       console.error('Ошибка при выполнении задачи:', error)
//     })
// })

module.exports = { checkStatusChanges }
