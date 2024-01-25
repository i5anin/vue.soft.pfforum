const { Pool } = require('pg')
const ExcelJS = require('exceljs')
const { getNetworkDetails } = require('../db_type')
const config = require('../config')
const { join } = require('path')

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
  console.log('createExcelFile')
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Report')

  // Заголовки столбцов
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Название', key: 'name', width: 30 },
    { header: 'Кол-во', key: 'quantity', width: 10 },
    { header: 'sklad', key: 'sklad', width: 10 },
    { header: 'norma', key: 'normanorma', width: 10 },
    // { header: 'parent_id', key: 'parent_id', width: 10 },
    // { header: 'property', key: 'property', width: 10 },
    { header: 'limit', key: 'limit', width: 10 },
    // Добавьте другие заголовки
  ]

  // Добавление данных в лист
  data.forEach((item) => {
    worksheet.addRow(item)
  })

  // Стили для заголовков
  worksheet.getRow(1).font = { bold: true }

  try {
    const filePath = join(__dirname, 'Report.xlsx')
    await workbook.xlsx.writeFile(filePath)
    console.log('Файл Excel успешно создан!')
  } catch (error) {
    console.error('Ошибка при создании файла Excel:', error)
  }
}

// Объединение функционала
async function generateReport() {
  console.log('Запрос на создание отчета получен')
  try {
    const data = await getReportData()
    await createExcelFile(data)
  } catch (error) {
    console.error('Ошибка при генерации отчета:', error)
  }
}

module.exports = {
  generateReport,
}
