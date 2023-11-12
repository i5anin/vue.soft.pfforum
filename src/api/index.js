import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api'

export async function getDatabaseInfo() {
  try {
    const response = await axios.get(`${BASE_URL}/database-info`)
    return response.data
  } catch (error) {
    console.error('Error fetching database info:', error)
    throw error
  }
}

export async function getTools(search = '', page = 1, limit = 10) {
  try {
    const response = await axios.get(`${BASE_URL}/tools`, { params: { search, page, limit } })
    response.data.totalCount = parseInt(response.data.totalCount, 10)
    return response.data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
  }
}

export async function getLibraries() {
  try {
    const response = await axios.get(`${BASE_URL}/tool-library`)
    return response.data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
  }
}

// Добавить новый инструмент
export async function addTool(toolData) {
  try {
    const response = await axios.post(`${BASE_URL}/tool`, toolData)
    return response.data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error.response ? error.response.data : error.message)
    return null
  }
}

// Удалить инструмент по ID
export async function deleteTool(id) {
  try {
    const response = await axios.delete(`${BASE_URL}/tool/${id}`)
    return response.data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
    return null
  }
}

// Обновить существующий инструмент
export async function updateTool(id, toolData) {
  try {
    const response = await axios.put(`${BASE_URL}/tool/${id}`, toolData)
    return response.data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
    return null
  }
}

export async function addMaterial(name) {
  const response = await axios.post(`${BASE_URL}/add-material`, { name })
  return response.data
}

export async function addType(name) {
  const response = await axios.post(`${BASE_URL}/add-type`, { name })
  return response.data
}

export async function addGroup(name) {
  const response = await axios.post(`${BASE_URL}/add-group`, { name })
  return response.data
}

// Метод для проверки логина и пароля
export async function login(credentials) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials) // Сохраните полученный токен в localStorage или в каком-либо хранилище состояний
    localStorage.setItem('token', response.data.token) // Возвращаем данные пользователя, если вам это необходимо
    return response.data
  } catch (error) {
    console.error('There has been a problem with your login operation:', error.response ? error.response.data : error.message)
    throw error // Перебросьте ошибку, чтобы вызывающий код мог ее обработать
  }
}
