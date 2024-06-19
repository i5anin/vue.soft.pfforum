const nodemailer = require('nodemailer')
const { Pool } = require('pg')
const { emailConfig } = require('../../../../config/config')
const { htmlToText } = require('nodemailer-html-to-text')
const getEmailRecipients = require('./getEmailRecipients')
const getDbConfig = require('../../../../config/databaseConfig')
const cron = require('node-cron')

const dbConfig = getDbConfig()
const pool = new Pool(dbConfig)

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: false,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
})

transporter.use('compile', htmlToText())

function createMailContent(tools, partId, partName, partDesignation) {
  let htmlContent = `<h2>Отчет по инструментам для партии: ${partId} (${partName} - ${partDesignation})</h2>`

  if (tools.length > 0) {
    htmlContent += `
      <table border='1'>
        <tr>
          <th>ID инструмента</th>
          <th>Название инструмента</th>
          <th>Количество</th>
        </tr>
    `
    tools.forEach((tool) => {
      htmlContent += `
        <tr>
          <td>${tool.id_tool}</td>
          <td>${tool.tool_name}</td>
          <td>${tool.quantity}</td>
        </tr>
      `
    })
    htmlContent += `</table>`
  } else {
    htmlContent += '<p>Инструменты для данной партии не найдены.</p>'
  }

  return htmlContent
}

async function sendReportForPart(partId) {
  try {
    // Получаем данные о партии, включая название и обозначение
    const partDataResult = await pool.query(
      `
        SELECT name, description
        FROM dbo.specs_nom
        WHERE id = $1
      `,
      [partId],
    )

    if (partDataResult.rows.length === 0) {
      console.log(`Партия с ID ${partId} не найдена.`)
      return
    }

    const partName = partDataResult.rows[0].name
    const partDesignation = partDataResult.rows[0].description

    const toolsResult = await pool.query(
      `
        SELECT thn.id,
               thn.id_tool,
               tn.name AS tool_name,
               thn.quantity
        FROM dbo.tool_history_nom thn
               JOIN dbo.tool_nom tn ON thn.id_tool = tn.id
        WHERE thn.specs_nom_id = $1
      `,
      [partId],
    )

    const tools = toolsResult.rows

    if (tools.length === 0) {
      console.log(`Нет инструментов для отправки отчета по партии: ${partId}`)
      return
    }

    const htmlContent = createMailContent(tools, partId, partName, partDesignation)
    const financeUserEmail = await getEmailRecipients('finance')

    if (!financeUserEmail) {
      console.error('Не удалось получить адрес электронной почты для роли \'finance\'.')
      return
    }

    let mailOptions = {
      from: process.env.MAIL_USER,
      to: financeUserEmail,
      subject: `Отчет по инструментам для партии: ${partId} (${partName} - ${partDesignation})`,
      html: htmlContent,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Отчет по инструментам для партии ${partId} (${partName} - ${partDesignation}) отправлен на ${financeUserEmail}`)

  } catch (error) {
    console.error(`Ошибка при отправке отчета для партии ${partId}:`, error)
  }
}

async function checkStatusChanges() {
  console.log('Checking status changes')
  try {
    // Получаем список ID завершенных партий до указанной даты
    const completedPartsResult = await pool.query(
      `
        SELECT id
        FROM dbo.specs_nom
        WHERE prod_end_time >= '2024-06-17 00:00:00'
        ORDER BY prod_end_time ASC
      `,
    )
    const completedPartIds = completedPartsResult.rows.map(row => row.id)

    // Получаем список ID партий, для которых отчет еще не был отправлен
    const unsentReportsResult = await pool.query(
      `
        SELECT DISTINCT specs_nom_id
        FROM dbo.tool_part_archive
        WHERE report_sent_buch IS NULL
           OR report_sent_buch = FALSE
      `,
    )
    const unsentReportPartIds = unsentReportsResult.rows.map(row => row.specs_nom_id)

    // Находим партии, которые нужно отправить
    const partsToSend = completedPartIds.filter(partId => unsentReportPartIds.includes(partId))

    console.log('Завершенные партии:', completedPartIds)
    console.log('Партии без отчетов:', unsentReportPartIds)
    console.log('Партии для отправки:', partsToSend)

    // Отправляем отчеты для каждой найденной партии
    for (const partId of partsToSend) {
      await sendReportForPart(partId)

      // Обновляем статус отправки отчета
      await pool.query(
        `
          UPDATE dbo.tool_part_archive
          SET report_sent_buch      = TRUE,
              date_report_sent_buch = CURRENT_TIMESTAMP
          WHERE specs_nom_id = $1
        `,
        [partId],
      )
      console.log(`Статус отправки отчета для партии ${partId} обновлен.`)
    }

    if (partsToSend.length === 0) {
      console.log('Нет партий для отправки отчетов.')
    }
  } catch (error) {
    console.error('Ошибка при проверке статусов:', error)
  }
}

// Запускаем проверку каждую минуту
cron.schedule('*/10 * * * * *', checkStatusChanges)

module.exports = { checkStatusChanges }
