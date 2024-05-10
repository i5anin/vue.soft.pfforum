const { Pool } = require('pg')
const ExcelJS = require('exceljs')
const nodemailer = require('nodemailer')
const { emailConfig } = require('../../../../config')
const getDbConfig = require('../../../../databaseConfig')

// Настройка подключения к базе данных

const dbConfig = getDbConfig()
const pool = new Pool(dbConfig)

// Функция для получения данных из базы данных
async function getReportData() {
  const query = `
    WITH RECURSIVE
      TreePath AS (SELECT id, CAST(name AS TEXT) AS path, parent_id
                   FROM dbo.tool_tree
                   WHERE parent_id = 1
                   UNION ALL
                   SELECT tt.id, CONCAT(tp.path, ' / ', tt.name) AS path, tt.parent_id
                   FROM dbo.tool_tree tt
                          JOIN TreePath tp ON tt.parent_id = tp.id),
      ToolReport AS (SELECT tn.id               AS id_tool,
                            tn.name,
                            tn.sklad,
                            tn.norma,
                            tn.norma - tn.sklad AS zakaz,
                            tn.parent_id,
                            tn.group_id
                     FROM dbo.tool_nom tn
                     WHERE tn.norma IS NOT NULL
                       AND (tn.norma - tn.sklad) > 0)
    SELECT tr.id_tool, tr.name, tr.sklad, tr.norma, tr.zakaz, tp.path AS tool_path, tr.group_id
    FROM ToolReport tr
           LEFT JOIN TreePath tp ON tr.parent_id = tp.id
    ORDER BY tp.path, tr.name;
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
// Функция для создания Excel файла и возврата его как потока данных
async function createExcelFileStream(data) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Отчёт')

  // Добавляем заголовки
  worksheet.columns = [
    { header: 'ID', key: 'id_tool', width: 10 },
    { header: 'Название', key: 'name', width: 32 },
    { header: 'На складе', key: 'sklad', width: 10 },
    { header: 'Норма', key: 'norma', width: 10 },
    { header: 'Заказ', key: 'zakaz', width: 10 },
    { header: 'Группа', key: 'group_id', width: 15 },
    { header: 'Путь', key: 'tool_path', width: 30 },
  ]

  // Добавляем данные
  data.forEach((item) => {
    const zakazRounded = item.tool_path.includes('Пластины')
      ? Math.floor(item.zakaz / 10) * 10
      : item.zakaz
    const group_id = item.group_id === null ? 'нет группы' : item.group_id

    worksheet.addRow({
      id_tool: item.id_tool,
      name: item.name,
      sklad: item.sklad,
      norma: item.norma,
      zakaz: zakazRounded,
      group_id: group_id,
      tool_path: item.tool_path,
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
  const subject = `${envPrefix}Заказ: Журнал инструмента за неделю с ${firstDate} по ${lastDate}`

  // Генерация HTML таблицы для тела письма email
  let htmlContent = `<h2>${subject}</h2>`
  htmlContent += `
<table border="1" style="border-collapse: collapse;">
<tr>
<th>ID</th>
<th>Название</th>
<th>На складе</th>
<th>Норма</th>
<th>Заказ округленный</th>
<th>Группа</th>
<th>Путь</th>
</tr>`

  data.forEach((item) => {
    // Округление заказа для пластин до ближайшего меньшего кратного 10
    const zakazRounded = item.tool_path.includes('Пластины')
      ? Math.floor(item.zakaz / 10) * 10
      : item.zakaz

    // Корректное отображение отсутствующей группы
    const groupDisplay = item.group_id === null ? 'нет группы' : item.group_id

    htmlContent += `
<tr>
<td>${item.id_tool}</td>
<td>${item.name}</td>
<td>${item.sklad}</td>
<td>${item.norma}</td>
<td>${zakazRounded}</td>
<td>${groupDisplay}</td>
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
async function genZayavInstr(req, res) {
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

module.exports = {
  genZayavInstr,
}
