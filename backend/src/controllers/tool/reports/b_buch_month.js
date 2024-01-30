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

// Функция для создания Excel файла
async function createExcelFile(data) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Бухгалтерия')

  // Добавление текста в начало листа
  worksheet.mergeCells('A1:E1')
  const titleRow = worksheet.getCell('A1')
  titleRow.value =
    'Бухгалтерия: Исключен сломанный инструмент. Отчет каждый ПТ в 12:00 (за неделю)'
  titleRow.font = { bold: true, size: 14 }

  // Определение дат начала и окончания недели (предыдущей недели относительно текущей)
  let endDate = new Date()
  endDate.setDate(endDate.getDate() - endDate.getDay() - 2) // Воскресенье предыдущей недели
  let startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 6) // Понедельник предыдущей недели

  // Форматирование дат
  startDate = startDate.toISOString().split('T')[0]
  endDate = endDate.toISOString().split('T')[0]

  // Добавление дат в лист
  worksheet.addRow([
    'Дата начала недели:',
    startDate,
    '',
    'Дата окончания недели:',
    endDate,
  ])
  // Добавление пустых строк перед заголовками столбцов
  worksheet.addRow([])

  // Установка заголовков столбцов вручную
  worksheet.getRow(3).values = ['№', 'Название', 'Кол-во']

  // Добавление данных в лист
  let rowNumber = 1 // Инициализация счетчика строк
  data.forEach((item) => {
    if (item.zakaz > 0) {
      // Добавляем номер строки в начало каждой строки данных
      worksheet.addRow([rowNumber, item.name, item.zakaz])
      rowNumber++ // Инкрементируем номер строки
    }
  })

  // Стили для заголовков
  worksheet.getRow(3).font = { bold: true } // Предполагая, что заголовки начинаются с 4-й строки
  return workbook
}

// Функция для отправки сообщения с файлом на почту
// Функция для отправки текстового сообщения с прикрепленным файлом на почту
async function sendEmailWithTextAndAttachment(email, text, attachmentPath) {
  const transporter = nodemailer.createTransport({
    host: emailConfig.host, // Замените на доменное имя сервера почты
    port: emailConfig.port,
    secure: false, // true для SSL, false для TCP
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
    text: text, // Текстовое сообщение
    attachments: [{ path: attachmentPath }],
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Отчет успешно отправлен на почту ${email}`)
  } catch (error) {
    console.error('Ошибка при отправке отчета на почту:', error)
    throw error
  }
}

// Объединение функционала
async function genBuchMonth(req, res) {
  try {
    const data = await getReportData()

    // Проверка на наличие позиций в данных
    if (data.length === 0) {
      // Если данных нет, отправляем ошибку
      res.status(404).send('Нет данных для создания отчета.')
      return // Остановим дальнейшее выполнение функции
    }

    const workbook = await createExcelFile(data)

    const attachmentPath = 'Report.xlsx' // Путь к файлу отчета
    await workbook.xlsx.writeFile(attachmentPath)

    // Текстовое сообщение для отправки по почте
    const emailText =
      'Сообщение сделано автоматически почтовым сервисом\nПожалуйста, найдите вложенный отчет в формате Excel.'

    // Отправляем отчет на указанный email
    await sendEmailWithTextAndAttachment(
      'isa@pf-forum.ru',
      emailText,
      attachmentPath
    )

    // Удаляем временный файл отчета
    const fs = require('fs')
    fs.unlinkSync(attachmentPath)

    res.status(200).send('Отчет успешно отправлен на указанный email.')
  } catch (error) {
    console.error('Ошибка при генерации и отправке отчета:', error)
    res.status(500).send('Ошибка при генерации и отправке отчета')
  }
}

module.exports = {
  genBuchMonth,
}
