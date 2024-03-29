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
  try {
    const query = `
SELECT
    tool_nom.id AS id_tool,
    tool_nom.name,
    tool_nom.sklad,
    tool_nom.norma,
    tool_nom.norma - tool_nom.sklad AS zakaz,
    COALESCE(SUM(tool_history_damaged.quantity), 0) AS damaged_last_7_days
FROM
    dbo.tool_nom
LEFT JOIN
    dbo.tool_history_damaged ON tool_nom.id = tool_history_damaged.id_tool
    AND tool_history_damaged.timestamp >= CURRENT_DATE - INTERVAL '7 days'
WHERE
    tool_nom.norma IS NOT NULL
    AND (tool_nom.norma - tool_nom.sklad) > 0
GROUP BY
    tool_nom.id,
    tool_nom.name,
    tool_nom.sklad,
    tool_nom.norma
ORDER BY
    tool_nom.id;
    `
    const { rows } = await pool.query(query)
    return rows
  } catch (error) {
    console.error('Ошибка при получении данных:', error)
    throw error
  }
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

  worksheet.mergeCells('A1:E1')
  const titleRow = worksheet.getCell('A1')
  titleRow.value =
    'Заказ: Журнал испорченного раз в неделю. Отчет каждый ЧТ в 12:00 (за неделю)'
  titleRow.font = { bold: true, size: 14 }

  // Определение дат начала и окончания недели
  let endDate = new Date()
  endDate.setDate(endDate.getDate() - endDate.getDay() - 2)
  let startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 6)

  // Форматирование дат
  startDate = startDate.toISOString().split('T')[0]
  endDate = endDate.toISOString().split('T')[0]

  worksheet.addRow([
    'Дата начала недели:',
    startDate,
    '',
    'Дата окончания недели:',
    endDate,
  ])
  worksheet.addRow([])

  worksheet.getRow(3).values = ['№', 'Название', 'Кол-во']
  worksheet.getRow(3).font = { bold: true }

  let rowNumber = 1
  data.forEach((item) => {
    if (item.zakaz > 0) {
      worksheet.addRow([rowNumber, item.name, item.zakaz])
      rowNumber++
    }
  })

  const stream = new require('stream').PassThrough()
  await workbook.xlsx.write(stream)
  stream.end()
  return stream
}

// Функция для отправки сообщения с файлом на почту
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

  // Генерация HTML таблицы для тела письма
  let htmlContent = `<h2>${subject}</h2>`
  htmlContent += `<table border="1" style="border-collapse: collapse;"><tr><th>№</th><th>Название</th><th>Количество</th></tr>`

  let rowNumber = 1
  data.forEach((item) => {
    let formattedDate = ''
    // Проверяем, существует ли timestamp и можно ли его преобразовать в дату
    if (item.timestamp && !isNaN(new Date(item.timestamp).getTime())) {
      formattedDate = new Date(item.timestamp).toISOString().split('T')[0] // Форматирование даты
    } else {
      formattedDate = 'Недоступно' // Или другое значение по умолчанию
    }

    htmlContent += `<tr><td>${rowNumber++}</td><td>${item.name}</td><td>${
      item.zakaz
    }</td></tr>`
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
    await transporter.sendMail(mailOptions)
    console.log('Отчет успешно отправлен на указанный email.')
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
