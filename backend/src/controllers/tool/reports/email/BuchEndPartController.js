const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const { emailConfig } = require('../../../../config/config');
const { htmlToText } = require('nodemailer-html-to-text');
const getEmailRecipients = require('./getEmailRecipients');
const getDbConfig = require('../../../../config/databaseConfig');
const cron = require('node-cron');

const dbConfig = getDbConfig();
const pool = new Pool(dbConfig);

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: false,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

transporter.use('compile', htmlToText());

function createMailContent(tools, partId) {
  let htmlContent = `<h2>Отчет по инструментам для партии: ${partId}</h2>`;

  if (tools.length > 0) {
    htmlContent += `
      <table border='1'>
        <tr>
          <th>ID инструмента</th>
          <th>Название инструмента</th>
          <th>Количество</th>
        </tr>
    `;
    tools.forEach((tool) => {
      htmlContent += `
        <tr>
          <td>${tool.id_tool}</td>
          <td>${tool.tool_name}</td>
          <td>${tool.quantity}</td>
        </tr>
      `;
    });
    htmlContent += `</table>`;
  } else {
    htmlContent += '<p>Инструменты для данной партии не найдены.</p>';
  }

  return htmlContent;
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
    );

    const tools = toolsResult.rows;

    if (tools.length === 0) {
      console.log(`Нет инструментов для отправки отчета по партии: ${partId}`);
      return false;
    }

    const htmlContent = createMailContent(tools, partId);
    const financeUserEmail = await getEmailRecipients('finance');

    let mailOptions = {};

    if (process.env.VITE_NODE_ENV === 'build' && financeUserEmail) {
      mailOptions = {
        from: process.env.MAIL_USER,
        to: financeUserEmail,
        subject: `Отчет по инструментам для партии: ${partId}`,
        html: htmlContent,
      };
    }

    // Отправляем письмо только если mailOptions не пустой
    if (Object.keys(mailOptions).length > 0) {
      await transporter.sendMail(mailOptions);
      console.log(`Отчет по инструментам для партии ${partId} отправлен на ${financeUserEmail}`);
    }

    return true;
  } catch (error) {
    console.error(`Ошибка при отправке отчета для партии ${partId}:`, error);
    return false;
  }
}

async function checkStatusChanges() {
  console.log('Checking status changes');
  try {
    // Выбираем партии, для которых нужно отправить отчет
    const result = await pool.query(
      `
        SELECT sn.id AS part_id
        FROM dbo.specs_nom sn
        LEFT JOIN dbo.tool_part_archive tpa ON tpa.specs_nom_id = sn.id
        WHERE sn.prod_end_time >= '2024-06-17 00:00:00'
          AND (tpa.report_sent_buch IS NULL OR tpa.report_sent_buch = FALSE)
        ORDER BY sn.prod_end_time ASC
      `,
    );

    console.log('Найденные партии:', result.rows);

    // Собираем список ID партий, для которых отчет был успешно отправлен
    const sentPartIds = [];

    // Отправляем отчеты
    for (const row of result.rows) {
      const partId = row.part_id;

      // Отправляем отчет
      const reportSent = await sendReportForPart(partId);

      // Если отчет был отправлен, добавляем ID партии в список
      if (reportSent) {
        sentPartIds.push(partId);
      }
    }

    // Обновляем статусы отправки отчетов для всех партий из списка sentPartIds
    if (sentPartIds.length > 0) {
      await pool.query(
        `
          UPDATE dbo.tool_part_archive
          SET report_sent_buch = TRUE,
              date_report_sent_buch = CURRENT_TIMESTAMP
          WHERE specs_nom_id = ANY($1)
        `,
        [sentPartIds],
      );
      console.log(`Статусы отправки отчетов обновлены для партий: ${sentPartIds.join(', ')}.`);
    }

    if (result.rows.length === 0) {
      console.log('Нет партий для отправки отчетов.');
    }
  } catch (error) {
    console.error('Ошибка при проверке статусов:', error);
  }
}

// Запускаем проверку каждые 15 секунд
cron.schedule('*/15 * * * * *', checkStatusChanges);

module.exports = { checkStatusChanges };
