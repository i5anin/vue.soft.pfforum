import axios from 'axios'

const BASE_URL = 'http://localhost:4000/api'

// Получить все инструменты и связанные данные
export async function getTools(search = '', page = 1, limit = 10) {
  try {
    const response = await axios.get(`${BASE_URL}/tools`, {
      params: { search, page, limit },
    })
    // Преобразование totalCount в число
    response.data.totalCount = parseInt(response.data.totalCount, 10);
    return response.data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
  }
}


// Добавить новый инструмент
export async function addTool(toolData) {
  try {
    const response = await axios.post(`${BASE_URL}/add-tool`, toolData)
    console.log('Result from addTool:', response.data)
    return response.data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
    return null
  }
}

// Удалить инструмент по ID
export async function deleteTool(id) {
  try {
    const response = await axios.delete(`${BASE_URL}/delete-tool/${id}`)
    return response.data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
    return null
  }
}

// Обновить существующий инструмент
export async function updateTool(id, toolData) {
  try {
    const response = await axios.put(`${BASE_URL}/edit-tool/${id}`, toolData)
    return response.data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
    return null
  }
}

export async function addMaterial(name) {
  const response = await axios.post('/add-material', { name })
  return response.data
}

export async function addType(name) {
  const response = await axios.post('/add-type', { name })
  return response.data
}

export async function addGroup(name) {
  const response = await axios.post('/add-group', { name })
  return response.data
}
