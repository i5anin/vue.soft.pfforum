const { Pool } = require('pg')
const ExcelJS = require('exceljs')
const { getNetworkDetails } = require('../../../../db_type')
const config = require('../../../../config')
const nodemailer = require('nodemailer')
const { emailConfig } = require('../../../../config')

// Функция для создания Excel файла и возврата его как потока данных
async function createExcelFileStream(data) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Заказ')

  worksheet.mergeCells('A1:E1')
  const titleRow = worksheet.getCell('A1')
  titleRow.value =
    'Заказ: Журнал испорченного раз в неделю. Отчет каждый ЧТ в 12:00 (за неделю)'
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

module.exports = { createExcelFileStream }
