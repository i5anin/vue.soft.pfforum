const { Pool } = require('pg')
const ExcelJS = require('exceljs')
const { getNetworkDetails } = require('../db_type')
const config = require('../config')

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
      SELECT id, name, sklad, norma, parent_id, property, "limit"
      FROM dbo.tool_nom;
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
  const worksheet = workbook.addWorksheet('Report')

  // Заголовки столбцов
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Название', key: 'name', width: 30 },
    { header: 'Кол-во', key: 'quantity', width: 10 },
    { header: 'sklad', key: 'sklad', width: 10 },
    { header: 'norma', key: 'norma', width: 10 },
    { header: 'limit', key: 'limit', width: 10 },
  ]

  // Добавление данных в лист
  data.forEach((item) => {
    worksheet.addRow(item)
  })

  // Стили для заголовков
  worksheet.getRow(1).font = { bold: true }

  return workbook
}

// Объединение функционала
async function generateReport(req, res) {
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
  generateReport,
}
