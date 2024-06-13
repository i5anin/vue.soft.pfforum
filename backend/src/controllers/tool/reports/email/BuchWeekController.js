const { Pool } = require('pg')
const ExcelJS = require('exceljs')
const nodemailer = require('nodemailer')
const { emailConfig } = require('../../../../config/config')
const getEmailRecipients = require('./getEmailRecipients')
const { schedule } = require('node-cron')
const getDbConfig = require('../../../../config/databaseConfig')

// Настройка подключения к базе данных
const dbConfig = getDbConfig()
const pool = new Pool(dbConfig)

// Функция для получения данных из базы данных
async function getReportData() {
  try {
    const query = `
      SELECT tool_nom.id,
             tool_nom.name,
             MIN(tool_history_nom.timestamp) AS start_date,
             MAX(tool_history_nom.timestamp) AS end_date,
             SUM(tool_history_nom.quantity) AS zakaz
      FROM dbo.tool_history_nom
             JOIN
           dbo.tool_nom ON tool_history_nom.id_tool = tool_nom.id
      WHERE tool_history_nom.timestamp >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY tool_nom.id, tool_nom.name
      ORDER BY tool_nom.name;
    `
    const { rows } = await pool.query(query)
    return rows
  } catch (error) {
    console.error('Ошибка при получении данных:', error)
    throw error
  }
}

// Функция для создания Excel файла и возврата его как потока данных
async function createExcelFileStream(data) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Бухгалтерия')

  worksheet.mergeCells('A1:E1')
  const titleRow = worksheet.getCell('A1')
  titleRow.value =
    'Бухгалтерия: Журнал уничтоженного раз в месяц. Отчет каждый ПТ в 12:00 (за месяц)'
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

  worksheet.getRow(3).values = [
    '№',
    'Название',
    'Дата начала',
    'Дата конца',
    'Кол-во',
  ]
  worksheet.getRow(3).font = { bold: true }

  let rowNumber = 1
  data.forEach((item) => {
    if (item.zakaz > 0) {
      const formattedStartDate = new Date(item.start_date)
        .toISOString()
        .split('T')[0]
      const formattedEndDate = new Date(item.end_date)
        .toISOString()
        .split('T')[0]

      worksheet.addRow([
        rowNumber,
        item.name,
        formattedStartDate,
        formattedEndDate,
        item.zakaz,
      ])
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

  // Создание транспорта для отправки письма
  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure, // В зависимости от вашего сервера это может быть true
    auth: { user: emailConfig.user, pass: emailConfig.pass },
  })

  // Даты для определения периода отчета
  const { firstDate, lastDate } = getCurrentWeekDates()
  const envPrefix = process.env.NODE_ENV === 'development' ? 'development ' : ''
  const subject = `${envPrefix}Бухгалтерия: Журнал выданного инструмента за неделю с ${firstDate} по ${lastDate}`

  // Генерация HTML таблицы для тела письма
  let htmlContent = `<h2>${subject}</h2>`
  htmlContent += `<table border='1' style='border-collapse: collapse;'><tr><th>№</th><th>Название</th><th>Дата начала</th><th>Дата конца</th><th>Количество</th></tr>`

  let rowNumber = 1
  data.forEach((item) => {
    const formattedStartDate = new Date(item.start_date)
      .toISOString()
      .split('T')[0]
    const formattedEndDate = new Date(item.end_date).toISOString().split('T')[0]

    htmlContent += `<tr><td>${rowNumber++}</td><td>${
      item.name
    }</td><td>${formattedStartDate}</td><td>${formattedEndDate}</td><td>${
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
    html: htmlContent, // Включаем HTML
    attachments: [
      {
        filename: `Выдано инструмент ${firstDate} - ${lastDate}.xlsx`,
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

// Функция для получения даты начала и конца текущей недели
function getCurrentWeekDates() {
  const currentDate = new Date()
  const firstDayOfWeek = currentDate.getDate() - currentDate.getDay() + 1 // Понедельник
  const lastDayOfWeek = firstDayOfWeek + 6 // Воскресенье

  const firstDate = new Date(currentDate.setDate(firstDayOfWeek))
    .toISOString()
    .split('T')[0]
  const lastDate = new Date(currentDate.setDate(lastDayOfWeek))
    .toISOString()
    .split('T')[0]

  return { firstDate, lastDate }
}

// Объединение функционала
async function genBuchWeek() {
  try {
    // Получаем email бухгалтерии и администратора
    const financeUserEmail = await getEmailRecipients('finance')
    const adminUserEmail = await getEmailRecipients('Admin')

    // Отправляем отчет финансовому отделу
    if (financeUserEmail && process.env.VITE_NODE_ENV === 'build') {
      await sendReport(financeUserEmail)
    }

    // Отправляем отчет администратору
    if (adminUserEmail) {
      await sendReport(adminUserEmail)
    }
  } catch (error) {
    console.error('Ошибка при генерации и отправке отчета:', error)
    // При необходимости, добавьте обработку ошибки
  }
}

async function sendReport(email) {
  // Получение данных для отчета
  const data = await getReportData()

  if (data.length === 0) {
    console.log('Нет данных для создания отчета.')
    return // Ничего не делаем, если данных нет
  }

  // Создание Excel файла
  const excelStream = await createExcelFileStream(data)
  const emailText = 'Пожалуйста, найдите вложенный отчет в формате Excel.'
  await sendEmailWithExcelStream(email, emailText, excelStream, data)

  console.log(`Отчет успешно отправлен на email: ${email}`)
}

// const min15 = '0 */15 * * * *'
// const sec10 = '*/10 * * * * *'
const week = '0 11 * * 5'
schedule(week, async function () {
  console.log('Запускаем genBuchWeek с помощью задачи cron...')
  try {
    await genBuchWeek()
  } catch (error) {
    console.error(`Error running genBuchWeek: ${error}`)
  }
})

module.exports = {
  genBuchWeek,
}
