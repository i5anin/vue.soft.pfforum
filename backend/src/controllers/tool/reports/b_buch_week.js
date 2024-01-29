const { Pool } = require('pg')
const ExcelJS = require('exceljs')
const { getNetworkDetails } = require('../../../db_type')
const config = require('../../../config')

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
      -- WHERE date >= (CURRENT_DATE - INTERVAL '7 days')
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
  worksheet.addRow([]) // Пустая строка для разделения

  // Заголовки столбцов
  worksheet.columns = [
    { header: 'Название', key: 'name', width: 40 },
    { header: 'Заявка', key: 'zakaz', width: 10 },
    { header: 'Дата', key: 'date', width: 10 },
    // Остальные столбцы по необходимости
  ]

  // Добавление данных в лист
  data.forEach((item) => {
    if (item.zakaz > 0) worksheet.addRow(item)
  })

  // Стили для заголовков
  worksheet.getRow(3).font = { bold: true } // Предполагая, что заголовки начинаются с 4-й строки
  return workbook
}

// Объединение функционала
async function genBuchWeek(req, res) {
  try {
    const data = await getReportData()

    // Проверка на наличие позиций в данных
    if (data.length === 0) {
      // Если данных нет, отправляем ошибку
      res.status(404).send('Нет данных для создания отчета.')
      return // Остановим дальнейшее выполнение функции
    }

    const workbook = await createExcelFile(data)

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader('Content-Disposition', 'attachment; filename=Report.xlsx')

    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error('Ошибка при генерации отчета:', error)
    res.status(500).send('Ошибка при генерации отчета')
  }
}

module.exports = {
  genBuchWeek,
}
