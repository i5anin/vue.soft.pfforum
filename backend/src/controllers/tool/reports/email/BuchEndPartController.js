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

function createMailContent(tools, partId) {
  let htmlContent = `<h2>Отчет по инструментам для партии: ${partId}</h2>`

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

    const htmlContent = createMailContent(tools, partId)
    const financeUserEmail = await getEmailRecipients('finance')

    let mailOptions = {}

    if (process.env.VITE_NODE_ENV === 'build' && financeUserEmail) {
      mailOptions = {
        from: process.env.MAIL_USER,
        to: financeUserEmail,
        subject: `Отчет по инструментам для партии: ${partId}`,
        html: htmlContent,
      }
    }

    await transporter.sendMail(mailOptions)
    console.log(`Отчет по инструментам для партии ${partId} отправлен на ${financeUserEmail}`)

    // Обновляем статус отправки отчета в таблице tool_part_archive
    await pool.query(
      `
        UPDATE dbo.tool_part_archive
        SET report_sent_buch      = TRUE,
            date_report_sent_buch = CURRENT_TIMESTAMP
        WHERE specs_nom_id = $1
      `,
      [partId],
    )

  } catch (error) {
    console.error(`Ошибка при отправке отчета для партии ${partId}:`, error)
  }
}

async function checkStatusChanges() {
  console.log("Checking status changes")
  try {
    const result = await pool.query(
      `
        SELECT sn.id AS part_id
        FROM dbo.specs_nom sn
        WHERE sn.prod_end_time <= NOW()
          AND EXISTS (SELECT 1
                      FROM dbo.tool_part_archive tpa
                      WHERE tpa.specs_nom_id = sn.id
                        AND tpa.report_sent_buch = FALSE)
        ORDER BY sn.prod_end_time DESC
        LIMIT 1
      `,
    )

    if (result.rows.length > 0) {
      console.log(part_id)
      const partId = result.rows[0].part_id
      await sendReportForPart(partId)
    } else {
      console.log('Нет партий для отправки отчетов.')
    }
  } catch (error) {
    console.error('Ошибка при проверке статусов:', error)
  }
}

// Запускаем проверку каждые 15 сек
cron.schedule('*/15 * * * * *', checkStatusChanges)

module.exports = { checkStatusChanges }
