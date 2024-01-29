const { Pool } = require('pg')
const ExcelJS = require('exceljs')
const { getNetworkDetails } = require('../../db_type')
const config = require('../../config')

// Настройка подключения к базе данных
const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest
const pool = new Pool(dbConfig)

// Функция для получения данных из базы данных
// Функция для получения данных о расходе
async function getConsumptionData() {
  try {
    const query = `
      SELECT id_tool, SUM(quantity) as total_consumption
      FROM dbo.tool_history_nom
      GROUP BY id_tool;
    `
    const { rows } = await pool.query(query)
    return rows
  } catch (error) {
    console.error('Ошибка при получении данных о расходе:', error)
    throw error
  }
}

// Функция для получения данных об испорченном инструменте
// async function getDamagedToolData() {
//   try {
//     const query = `
//     SELECT id_tool, SUM(quantity) as total_consumption
//     FROM dbo.tool_history_nom
//     GROUP BY id_tool;
//     `
//     const { rows } = await pool.query(query)
//     return rows
//   } catch (error) {
//     console.error(
//       'Ошибка при получении данных об испорченном инструменте:',
//       error
//     )
//     throw error
//   }
// }

// Обновленная функция для получения данных из базы данных
async function getReportData() {
  try {
    const consumptionData = await getConsumptionData()
    // const damagedToolData = await getDamagedToolData()

    const query = `
  SELECT id_tool, SUM(quantity) as total_consumption
  FROM dbo.tool_history_nom
  WHERE date >= current_date - interval '7 days'
  GROUP BY id_tool;
    `
    const { rows } = await pool.query(query)

    // Обновление данных для каждого инструмента
    rows.forEach((row) => {
      const consumption = consumptionData.find(
        (item) => item.id_tool === row.id
      )
      const damaged = damagedToolData.find((item) => item.id_tool === row.id)

      row.consumption = consumption ? consumption.total_consumption : 0
      // row.damaged = damaged ? damaged.total_damaged : 0
      row.zakaz = row.norma - row.consumption - row.damaged
    })

    return rows
  } catch (error) {
    console.error('Ошибка при получении данных:', error)
    throw error
  }
}

// Функция для создания Excel файла
async function createExcelFile(data) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Report')

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
    // Остальные столбцы по необходимости
  ]

  // Добавление данных в лист
  data.forEach((item) => {
    if (item.zakaz > 0) {
      worksheet.addRow(item)
    }
  })

  // Стили для заголовков
  worksheet.getRow(4).font = { bold: true } // Предполагая, что заголовки начинаются с 4-й строки

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
