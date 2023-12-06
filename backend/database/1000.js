const fs = require('fs')

// Функция для создания случайного имени товара
function randomName() {
  const parts = ['WNMG', 'SNMG', 'CCMT', 'DCMT', 'TCMT', 'VCMT']
  const codes = ['080408', '090308', '060204', '070204', '090204', '160408']
  const suffixes = [
    'BF WS7225 HARDSTONE',
    'EM YBG205',
    'TF IC907',
    'IC8250',
    'IC907',
  ]

  const part = parts[Math.floor(Math.random() * parts.length)]
  const code = codes[Math.floor(Math.random() * codes.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]

  return `${part}${code} ${suffix}`
}

// Функция для генерации случайных данных
function generateData() {
  let data = [
    '"id","type_id","mat_id","rad","name","kolvo_sklad","norma","zakaz","group_id"',
    '"100","1","2","1","WNMG080408-BF WS7225 HARDSTONE","10","10","10","1"',
    '"101","2","1","2","SNMG090308","20","15","25","2"',
    // ... (и другие начальные строки)
  ]

  for (let i = 102; i <= 1000; i++) {
    const typeId = Math.floor(Math.random() * 10) + 1
    const matId = Math.floor(Math.random() * 5) + 1
    const rad = (Math.random() * 2).toFixed(2)
    const name = randomName()
    const kolvoSklad = Math.floor(Math.random() * 100) + 1
    const norma = Math.floor(Math.random() * 100) + 1
    const zakaz = Math.floor(Math.random() * 100) + 1
    const groupId = Math.floor(Math.random() * 10) + 1

    const row = `"${i}","${typeId}","${matId}","${rad}","${name}","${kolvoSklad}","${norma}","${zakaz}","${groupId}"`
    data.push(row)
  }

  return data.join('\n')
}

// Функция для сохранения данных в файл в Node.js
function saveToFile(data, filename) {
  fs.writeFile(filename, data, (err) => {
    if (err) {
      console.error('Ошибка при сохранении файла:', err)
    } else {
      console.log('Файл успешно сохранен')
    }
  })
}

const csvData = generateData()
saveToFile(csvData, 'nom.csv')
