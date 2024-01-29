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
async function getDamagedToolData() {
  try {
    const query = `
    SELECT id_tool, SUM(quantity) as total_consumption
    FROM dbo.tool_history_nom
    GROUP BY id_tool;
    `
    const { rows } = await pool.query(query)
    return rows
  } catch (error) {
    console.error(
      'Ошибка при получении данных об испорченном инструменте:',
      error
    )
    throw error
  }
}

// Обновленная функция для получения данных из базы данных
async function getReportData() {
  try {
    const consumptionData = await getConsumptionData()
    const damagedToolData = await getDamagedToolData()

    const query = `
      SELECT id, name, sklad, norma, parent_id, property, "limit"
      FROM dbo.tool_nom;
    `
    const { rows } = await pool.query(query)

    // Обновление данных для каждого инструмента
    rows.forEach((row) => {
      const consumption = consumptionData.find(
        (item) => item.id_tool === row.id
      )
      const damaged = damagedToolData.find((item) => item.id_tool === row.id)

      row.consumption = consumption ? consumption.total_consumption : 0
      row.damaged = damaged ? damaged.total_damaged : 0
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

  // Заголовки столбцов
  worksheet.columns = [
    { header: 'Название', key: 'name', width: 40 },
    { header: 'Заявка', key: 'zakaz', width: 10 },
    { header: 'Дата генерации отчёта', key: 'date', width: 20 }, // новый столбец
  ]

  // Добавление данных в лист
  data.forEach((item) => {
    if (item.zakaz > 0) {
      item.date = new Date() // добавление даты генерации
      worksheet.addRow(item)
    }
  })

  // Стили для заголовков
  worksheet.getRow(1).font = { bold: true }

  return workbook
}

// Объединение функционала
async function genZayavInstr(req, res) {
  try {
    const data = await getReportData()
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
  genZayavInstr,
}
