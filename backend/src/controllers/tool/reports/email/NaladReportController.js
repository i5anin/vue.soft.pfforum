const { Pool } = require('pg')
const ExcelJS = require('exceljs')
const nodemailer = require('nodemailer')
const { emailConfig } = require('../../../../config/config')
const getDbConfig = require('../../../../config/databaseConfig')

// Настройка подключения к базе данных
const dbConfig = getDbConfig()
const pool = new Pool(dbConfig)

// Функция для получения данных из базы данных
async function getReportData() {
  const query = `
    WITH RankedRecords AS (SELECT marsh_naladka.cnc_code,
                                  CONCAT(NAME, ' ', description, ' операция: ', NO) AS det_name,
                                  'наладчик'                                        AS fio_nalad,
                                  marsh_naladka.datetime_nal,
                                  ROW_NUMBER() OVER (
                                    PARTITION BY CAST(marsh_naladka.datetime_nal AS DATE)
                                    ORDER BY LENGTH(CONCAT(NAME, ' ', description)), marsh_naladka.datetime_nal
                                    )                                               AS rn
                           FROM dbo.marsh_naladka
                                  INNER JOIN dbo.specs_nom_operations
                                             ON specs_nom_operations.ID = marsh_naladka.specs_op_id
                                  INNER JOIN dbo.specs_nom ON specs_nom.ID = specs_nom_operations.specs_nom_id
                                  INNER JOIN dbo.operations_ordersnom
                                             ON operations_ordersnom.op_id = specs_nom_operations.ordersnom_op_id
                           WHERE marsh_naladka.datetime_nal BETWEEN '01.05.2024 09:00:00' AND '01.06.2024 9:00:00'
                             AND dbo.get_op_cnc_type(specs_nom_operations.id) = 'Т')
    SELECT cnc_name                                  Станок,
           det_name                                  Наименование,
           fio_nalad                                 Нададчик,
           TO_CHAR(datetime_nal::DATE, 'DD.MM.YYYY') Дата
    FROM RankedRecords
           INNER JOIN dbo.cnc ON cnc.cnc_code = RankedRecords.cnc_code
    WHERE rn <= 3
    ORDER BY CAST(datetime_nal AS DATE),
             rn;

  `

  const { rows } = await pool.query(query)
  return rows
}

function getCurrentMonthDates() {
  const currentDate = new Date()
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  )
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  )

  const firstDate = firstDayOfMonth.toISOString().split('T')[0]
  const lastDate = lastDayOfMonth.toISOString().split('T')[0]

  return { firstDate, lastDate }
}

//  Функция для создания Excel файла и возврата его как потока данных
async function createExcelFileStream(data) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Отчёт')

  // Добавляем заголовки
  worksheet.columns = [
    { header: '# Excel', key: 'index', width: 5 },
    { header: 'ID', key: 'id_tool', width: 5 },
    {
      header: 'Название',
      key: 'name',
      width: 28,
      style: { font: { bold: true } },
    },
    {
      header: 'Заказ',
      key: 'zakaz',
      width: 10,
      style: {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' },
        },
      },
    },
    { header: 'Склад группы', key: 'group_sum', width: 20 },
    { header: 'На складе', key: 'sklad', width: 10 },
    { header: 'Норма', key: 'norma', width: 10 },
    { header: 'Путь', key: 'tool_path', width: 30 },
    // { header: 'Группа ID', key: 'group_display', width: 15 },
    // { header: 'Стандарт', key: 'group_standard', width: 15 },
  ]

  // Добавляем данные
  let index = 1
  data.forEach((item) => {
    let zakazRounded = item.zakaz
    // Round only if the tool path includes "пластины"
    if (item.tool_path && item.tool_path.toLowerCase().includes('пластины')) {
      zakazRounded = getRoundedCount(item.zakaz)
    }

    worksheet.addRow({
      index: index++,
      id_tool: item.id_tool,
      name: item.name,
      sklad: Number(item.sklad) || Number(0),
      norma: Number(item.norma) || '',
      zakaz: Number(zakazRounded) || '',
      group_display: Number(item.group_display) || '',
      group_standard: item.group_standard ? 'Да' : 'Нет',
      tool_path: item.tool_path ? item.tool_path : 'Не указан',
      group_sum: Number(item.group_sum) || '',
    })
  })

  // Автонастройка ширины ячеек
  worksheet.columns.forEach((column) => {
    let maxLength = 0
    column.eachCell({ includeEmpty: true }, (cell) => {
      let cellLength = cell.value ? cell.value.toString().length : 10
      if (cellLength > maxLength) {
        maxLength = cellLength
      }
    })
    column.width = maxLength < 10 ? 10 : maxLength // Устанавливаем минимальную ширину 10
  })

  const stream = new require('stream').PassThrough()
  await workbook.xlsx.write(stream)
  stream.end()
  return stream
}

// Функция для генерации HTML таблицы
function generateHtmlTable(data) {
  // Определение заголовков для таблицы
  const headers = [
    { header: '# HTML', key: 'index' },
    { header: 'ID', key: 'id_tool' },
    { header: 'Название', key: 'name' },
    { header: 'Заказ', key: 'zakaz' },
    { header: 'Склад группы', key: 'group_sum' },
    { header: 'На складе', key: 'sklad' },
    { header: 'Норма', key: 'norma' },
    { header: 'Группа ID', key: 'group_display' },
    { header: 'Стандарт', key: 'group_standard' },
    { header: 'Путь', key: 'tool_path' },
  ]

  let htmlContent = `<h2>Заказ: Журнал инструмента за период</h2>`
  htmlContent += `<table border='1' style='border-collapse: collapse;'><tr>`

  // Генерируем шапку таблицы
  headers.forEach((header) => {
    htmlContent += `<th>${header.header}</th>`
  })

  htmlContent += `</tr>`

  // Генерация строк таблицы
  data.forEach((item, index) => {
    let zakazValue = item.zakaz
    // Round only if the tool path includes "пластины"
    if (item.tool_path && item.tool_path.toLowerCase().includes('пластины')) {
      zakazValue = getRoundedCount(item.zakaz)
    }

    htmlContent += `<tr>`
    headers.forEach(({ key }) => {
      let value = ''
      switch (key) {
        case 'index':
          value = index + 1
          break
        case 'sklad':
          value = item[key] || 0
          break
        case 'zakaz': // Use zakazValue for rounded value
          value = zakazValue
          break
        default:
          value = item[key] || ''
      }
      htmlContent += `<td>${value}</td>`
    })
    htmlContent += `</tr>`
  })

  htmlContent += `</table>`

  return htmlContent
}

// Функция для отправки сообщения с файлом на почту, использующая generateHtmlTable
async function sendEmailWithExcelStream(email, text, excelStream, data) {
  // Используем переменные emailConfig, как раньше

  // Использование значений из переменных окружения, если они определены, иначе из config
  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure, // В зависимости от вашего сервера это может быть true
    auth: { user: emailConfig.user, pass: emailConfig.pass },
  })

  const { firstDate, lastDate } = getCurrentMonthDates()
  const envPrefix = process.env.NODE_ENV === 'development' ? 'development ' : ''
  const subject = `${envPrefix}Заказ: Журнал инструмента за неделю с ${firstDate} по ${lastDate}`

  const htmlContent = generateHtmlTable(data) // Генерация HTML

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: subject,
    text: text,
    html: htmlContent, // Вставка сгенерированного HTML
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
    console.log(`\nЗаказ: Журнал инструмента за неделю`)
    console.log(`Отчет будет отправлен на email: ${email}`)
    await transporter.sendMail(mailOptions)
    console.log(`Отчет успешно отправлен на email: ${email}.\n`)
  } catch (error) {
    console.error('Ошибка при отправке письма:', error)
    throw error
  }
}

// Функция для определения пользователя по токену и получения его email
async function getUserEmailByToken(token) {
  const query = 'SELECT email FROM dbo.vue_users WHERE token = $1;'
  const { rows } = await pool.query(query, [token])
  if (rows.length === 0) throw new Error('Пользователь не найден.')
  return rows[0].email
}

// Объединение функционала
async function genSetupReport(req, res) {
  try {
    // Check if the Authorization header is present and correctly formatted
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')
    ) {
      res.status(400).send('Authorization token is missing or invalid.')
      return
    }

    // Safely extract the token
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
      res.status(400).send('Bearer token is malformed.')
      return
    }

    const email = await getUserEmailByToken(token)

    const data = await getReportData()
    if (data.length === 0) {
      res.status(404).send('No data available for the report.')
      return
    }

    const excelStream = await createExcelFileStream(data)
    const emailText = 'Please find the attached Excel report.'
    await sendEmailWithExcelStream(email, emailText, excelStream, data)

    res
      .status(200)
      .send('The report has been successfully sent to the specified email.')
  } catch (error) {
    console.error('Error in generating and sending the report:', error)
    res
      .status(500)
      .send(`Error in generating and sending the report: ${error.message}`)
  }
}

// Функция для округления заказа
function getRoundedCount(count) {
  if (count < 10) return 10
  return count % 10 < 5
    ? Math.floor(count / 10) * 10
    : Math.ceil(count / 10) * 10
}

module.exports = { genSetupReport }