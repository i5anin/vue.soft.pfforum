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
      SELECT tool_history_nom.id_tool, tool_nom.name, SUM(tool_history_nom.quantity) as zakaz
      FROM dbo.tool_history_nom
      JOIN dbo.tool_nom ON tool_history_nom.id_tool = tool_nom.id
      GROUP BY tool_history_nom.id_tool, tool_nom.name;
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
    'Бухгалтерия: Исключен сломанный инструмент. Отчет каждый ПТ в 12:00 (за неделю)'
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
async function sendEmailWithExcelStream(email, text, excelStream) {
  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: false,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
  })

  const mailOptions = {
    from: 'report@pf-forum.ru',
    to: email,
    subject:
      'Бухгалтерия: Исключен сломанный инструмент. Отчет каждый ПТ в 12:00 (за неделю)',
    text: text,
    attachments: [{ filename: 'Report.xlsx', content: excelStream }],
  }

  await transporter.sendMail(mailOptions)
}

// Объединение функционала
async function genBuchMonth(req, res) {
  try {
    const data = await getReportData()

    if (data.length === 0) {
      res.status(404).send('Нет данных для создания отчета.')
      return
    }

    const excelStream = await createExcelFileStream(data)
    const emailText = 'Пожалуйста, найдите вложенный отчет в формате Excel.'

    await sendEmailWithExcelStream('isa@pf-forum.ru', emailText, excelStream)

    res.status(200).send('Отчет успешно отправлен на указанный email.')
  } catch (error) {
    console.error('Ошибка при генерации и отправке отчета:', error)
    res.status(500).send('Ошибка при генерации и отправке отчета')
  }
}

module.exports = {
  genBuchMonth,
}
