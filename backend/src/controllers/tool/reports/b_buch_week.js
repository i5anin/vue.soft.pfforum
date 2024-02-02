const { Pool } = require('pg')
const ExcelJS = require('exceljs')
const { getNetworkDetails } = require('../../../db_type')
const config = require('../../../config')
const nodemailer = require('nodemailer')
const { emailConfig } = require('../../../config')

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
          tool_history_nom.id_tool,
          tool_nom.name,
          tool_history_nom.timestamp,
          SUM(tool_history_nom.quantity) as zakaz
      FROM
          dbo.tool_history_nom
      JOIN
          dbo.tool_nom ON tool_history_nom.id_tool = tool_nom.id
      WHERE
          tool_history_nom.timestamp >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY
          tool_history_nom.id_tool,
          tool_nom.name,
          tool_history_nom.timestamp
      ORDER BY
          tool_history_nom.timestamp;
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
  const worksheet = workbook.addWorksheet('Бухгалтерия')

  worksheet.mergeCells('A1:E1')
  const titleRow = worksheet.getCell('A1')
  titleRow.value =
    'Бухгалтерия: Журнал испорченного раз в месяц. Отчет каждый ПТ в 12:00 (за месяц)'
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
async function sendEmailWithExcelStream(email, text, excelStream, data) {
  console.log('SMTP Configuration:', emailConfig)

  // Продолжение с созданием транспорта и отправкой письма...

  // host: process.env.EMAIL_HOST,
  //   port: process.env.EMAIL_PORT,
  //   user: process.env.EMAIL_USER,
  //   pass: process.env.EMAIL_PASS,

  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: false, // В зависимости от вашего сервера это может быть true
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
  })

  // Даты для имени файла
  const { firstDate, lastDate } = getCurrentMonthDates() // Используем функцию для определения текущего месяца
  const filename = `Damaged Tools Report ${firstDate} - ${lastDate}.xlsx`

  // Генерация HTML таблицы для тела письма
  let htmlContent = `<h2>Бухгалтерия: Журнал испорченного инструмента за неделю с ${firstDate} по ${lastDate}</h2>`
  htmlContent += `<table border="1" style="border-collapse: collapse;"><tr><th>№</th><th>Название</th><th>Дата</th><th>Количество</th></tr>`

  let rowNumber = 1
  data.forEach((item) => {
    const formattedDate = new Date(item.timestamp).toISOString().split('T')[0] // Форматируем дату
    htmlContent += `<tr><td>${rowNumber++}</td><td>${
      item.name
    }</td><td>${formattedDate}</td><td>${item.zakaz}</td></tr>`
  })

  htmlContent += `</table>`

  // Опции письма
  const mailOptions = {
    from: 'report@pf-forum.ru',
    to: email,
    subject: 'Бухгалтерия: Журнал испорченного инструмента. Отчет за неделю',
    text: text,
    html: htmlContent, // Включаем HTML
    attachments: [
      {
        filename,
        content: excelStream,
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    ],
  }

  // Отправка письма
  await transporter.sendMail(mailOptions)
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
async function genBuchWeek(req, res) {
  try {
    const data = await getReportData()

    if (data.length === 0) {
      res.status(404).send('Нет данных для создания отчета.')
      return
    }

    const excelStream = await createExcelFileStream(data)
    const emailText = 'Пожалуйста, найдите вложенный отчет в формате Excel.'

    await sendEmailWithExcelStream(
      'isa@pf-forum.ru',
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
  genBuchWeek,
}
