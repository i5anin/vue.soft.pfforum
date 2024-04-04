const { Pool } = require('pg')
const ExcelJS = require('exceljs')
const { getNetworkDetails } = require('../../../../db_type')
const config = require('../../../../config')
const nodemailer = require('nodemailer')
const { emailConfig } = require('../../../../config')

// Настройка подключения к базе данных
const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest
const pool = new Pool(dbConfig)

// Функция для получения данных из базы данных
async function getReportData() {
  const query = `
WITH RECURSIVE TreePath AS (
  SELECT
    id,
    CAST(name AS TEXT) AS path,
    parent_id
  FROM
    dbo.tool_tree
  WHERE
    parent_id = 1
  UNION ALL
  SELECT
    tt.id,
    CONCAT(tp.path, ' / ', tt.name) AS path,
    tt.parent_id
  FROM
    dbo.tool_tree tt
    JOIN TreePath tp ON tt.parent_id = tp.id
)
, ToolReport AS (
  SELECT
    tn.id AS id_tool,
    tn.name,
    tn.sklad,
    tn.norma,
    tn.norma - tn.sklad AS zakaz,
    tn.parent_id
  FROM
    dbo.tool_nom tn
  WHERE
    tn.norma IS NOT NULL AND (tn.norma - tn.sklad) > 0
)
SELECT
  tr.id_tool,
  tr.name,
  tr.sklad,
  tr.norma,
  tr.zakaz,
  tp.path AS tool_path
FROM
  ToolReport tr
LEFT JOIN
  TreePath tp ON tr.parent_id = tp.id
ORDER BY
  tp.path,
  tr.name;
  `

  const { rows } = await pool.query(query)
  return rows
}

function getCurrentMonthDates() {
  const currentDate = new Date()
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  )
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  )

  const firstDate = firstDayOfMonth.toISOString().split('T')[0]
  const lastDate = lastDayOfMonth.toISOString().split('T')[0]

  return { firstDate, lastDate }
}

// Функция для создания Excel файла и возврата его как потока данных
async function createExcelFileStream(data) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Заказ')

  // Добавляем заголовки
  worksheet.addRow(['ID', 'Название', 'На складе', 'Норма', 'Заказ', 'Путь'])

  // Заполняем строки данными
  data.forEach((item) => {
    worksheet.addRow([
      item.id_tool,
      item.name,
      item.sklad,
      item.norma,
      item.zakaz,
      item.tool_path,
    ])
  })

  const stream = new require('stream').PassThrough()
  await workbook.xlsx.write(stream)
  stream.end()
  return stream
}

// Функция для отправки сообщения с файлом на почту
async function sendEmailWithExcelStream(email, text, excelStream, data) {
  // console.log('SMTP Configuration:', emailConfig)

  // Использование значений из переменных окружения, если они определены, иначе из config
  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure, // В зависимости от вашего сервера это может быть true
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
  })

  // Даты для имени файла и темы письма
  const { firstDate, lastDate } = getCurrentMonthDates()
  const envPrefix = process.env.NODE_ENV === 'development' ? 'development ' : ''
  const subject = `${envPrefix}Заказ: Журнал испорченного инструмента за неделю с ${firstDate} по ${lastDate}`

  // Генерация HTML таблицы для тела письма email
  let htmlContent = `<h2>${subject}</h2>`
  htmlContent += `
<table border="1" style="border-collapse: collapse;">
<tr>
<th>ID</th>
<th>Название</th>
<th>Количество</th>
<th>Путь</th>
</tr>`

  let rowNumber = 1
  data.forEach((item) => {
    let formattedDate = ''
    // Проверяем, существует ли timestamp и можно ли его преобразовать в дату
    if (item.timestamp && !isNaN(new Date(item.timestamp).getTime())) {
      new Date(item.timestamp).toISOString().split('T')[0] // Форматирование даты
    }

    htmlContent += `
<tr>
<td>${item.id_tool}</td>
<td>${item.name}</td>
<td>${item.zakaz}</td>
<td>${item.tool_path}</td>
</tr>`
  })

  htmlContent += `</table>`

  // Опции письма
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: subject,
    text: text,
    html: htmlContent, // Включение HTML
    attachments: [
      {
        filename: `Поврежденный инструмент ${firstDate} - ${lastDate}.xlsx`,
        content: excelStream,
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    ],
  }

  // Отправка письма
  try {
    console.log(`\nЗаказ: Журнал испорченного инструмента за неделю`)
    console.log(`Отчет будет отправлен на email: ${email}`)
    await transporter.sendMail(mailOptions)
    console.log(`Отчет успешно отправлен на email: ${email}.\n`)
  } catch (error) {
    console.error('Ошибка при отправке письма:', error)
    throw error
  }
}

// Объединение функционала
async function genZayavInstr(req, res) {
  try {
    const data = await getReportData()

    if (data.length === 0) {
      res.status(404).send('Нет данных для создания отчета.')
      return
    }

    const excelStream = await createExcelFileStream(data)
    const emailText = 'Пожалуйста, найдите вложенный отчет в формате Excel.'

    await sendEmailWithExcelStream(
      process.env.MAIL_TO,
      emailText,
      excelStream,
      data
    )

    res.status(200).send('Отчет успешно отправлен на указанный email.')
  } catch (error) {
    console.error('Ошибка при генерации и отправке отчета:', error)
    res.status(500).send('Ошибка при генерации и отправке отчета')
  }
}

module.exports = {
  genZayavInstr,
}
