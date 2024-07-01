const axios = require('axios')
const ip = '192.168.0.200'
const port = '4001'
const baseUrl = `http://${ip}:${port}/api`

describe('Тесты API для инструментов', () => {
  let createdRecordId

  it('Создание нового инструмента', async () => {
    const newRecordData = {
      'name': 'Название',
      'parent_id': 239,
      'property': {
        '6': '123',
        '10': '123',
        '17': '123',
      },
      'sklad': '123',
      'norma': '123',
      'group_id': '1001',
      'group_standard': true,
      'limit': null,
    }

    console.log('--- Создание нового инструмента ---')
    console.log('Отправляю данные:', newRecordData)
    const response = await axios.post(baseUrl + '/tool', newRecordData)

    console.log('Получен ответ:', response.data)
    expect(response.status).toBe(200)
    expect(response.data.data).toHaveProperty('id')
    expect(response.data.data).toHaveProperty('name', newRecordData.name)
    expect(response.data.data).toHaveProperty('parent_id', newRecordData.parent_id)

    createdRecordId = response.data.data.id
    console.log('Созданный ID:', createdRecordId)
  })

  it('Получение созданного инструмента', async () => {
    console.log('--- Получение созданного инструмента ---')
    const response = await axios.get(`${baseUrl}/tool/${createdRecordId}`)
    console.log('Получен ответ:', response.data)

    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('id', createdRecordId)
    expect(response.data).toHaveProperty('name', 'Название')
    // Добавьте другие проверки полей, если необходимо
  })

  it('Изменение существующего инструмента', async () => {
    console.log('--- Изменение существующего инструмента ---')
    const updatedRecordData = {
      'name': 'Измененный инструмент',
      'parent_id': 2,
      'property': {
        '1': 'Тип инструмента',
        '2': 'Группа инструмента',
        '3': 'Материал инструмента',
        '4': 'Ширина',
        '5': 'Габарит',
      },
      'sklad': 1,
      'norma': 2,
    }

    console.log('Отправляю данные:', updatedRecordData)
    const response = await axios.put(`${baseUrl}/tool/${createdRecordId}`, updatedRecordData)
    console.log('Получен ответ:', response.data)

    expect(response.status).toBe(200)
    expect(response.data.data).toHaveProperty('id', createdRecordId)
    expect(response.data.data).toHaveProperty('name', updatedRecordData.name)
    expect(response.data.data).toHaveProperty('parent_id', updatedRecordData.parent_id)
    expect(response.data.data).toHaveProperty('property', updatedRecordData.property)
  })

  it('Удаление инструмента', async () => {
    console.log('--- Удаление инструмента ---')
    const response = await axios.delete(`${baseUrl}/tool/${createdRecordId}`)
    console.log('Получен ответ:', response.data)
    expect(response.status).toBe(200)
  })

  it('Проверка удаления: получение несуществующего инструмента', async () => {
    console.log('--- Проверка удаления ---')
    try {
      const response = await axios.get(`${baseUrl}/tool/${createdRecordId}`)
      console.log('Получен ответ:', response.data)
    } catch (error) {
      console.log('Ошибка:', error.response ? error.response.data : error.message)
      expect(error.response.status).toBe(404)
    }
  })
})
