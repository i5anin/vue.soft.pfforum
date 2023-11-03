function generateData() {
  // Заданные строки
  const initialData = [
    '"id","type_id","mat_id","rad","name","kolvo_sklad","norma","zakaz","group_id"',
    '"100","1","2","1","WNMG080408-BF WS7225 HARDSTONE","10","10","10","1"',
    '"101","2","1","2","SNMG090308","20","15","25","2"',
    // ... (все заданные строки)
  ].join('\n')

  // Массивы с возможными значениями для поля name
  const namePrefixes = ['WNMG', 'SNMG', 'CCMT', 'DCMT', 'TCMT', 'VCMT']
  const nameSuffixes = [
    '080408',
    '090308',
    '060204',
    '070204',
    '090204',
    '160408',
  ]
  const nameMaterials = [
    '-BF WS7225 HARDSTONE',
    '-TF IC907',
    '-EM YBG205',
    '-IC8250',
    '-IC907',
  ]

  let data = initialData + '\n'
  for (let i = 115; i <= 1000; i++) {
    const typeId = (i % 10) + 1
    const matId = (i % 6) + 1
    const groupId = (i % 8) + 1
    const rad = (Math.random() * 2.3 + 0.2).toFixed(2)
    const name = `${namePrefixes[i % namePrefixes.length]}${
      nameSuffixes[i % nameSuffixes.length]
    }${nameMaterials[i % nameMaterials.length]}`
    const kolvoSklad = Math.floor(Math.random() * 100) + 1
    const norma = Math.floor(Math.random() * 100) + 1
    const zakaz = Math.floor(Math.random() * 100) + 1

    data += `"${i}","${typeId}","${matId}","${rad}","${name}","${kolvoSklad}","${norma}","${zakaz}","${groupId}"\n`
  }
  return data
}

// Функция для сохранения данных в файл
function saveToFile(data, filename) {
  const blob = new Blob([data], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const csvData = generateData()
saveToFile(csvData, 'nom.csv')
