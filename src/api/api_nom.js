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

export async function getToolsWithInventoryInfo(
  search = '',
  page = 1,
  limit = 10
) {
  try {
    const response = await axios.get(`${BASE_URL}/tools-inventory`, {
      params: { search, page, limit },
    })
    response.data.totalCount = parseInt(response.data.totalCount, 10)
    return response.data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
    return null
  }
}
export async function getTools(
  search = '',
  page = 1,
  limit = 10,
  includeNull = false,
  parentId = null
) {
  const params = { search, page, limit, includeNull }
  if (parentId !== null) {
    params.parent_id = parentId
  }

  try {
    const response = await axios.get(`${BASE_URL}/tools`, { params })
    response.data.totalCount = parseInt(response.data.totalCount, 10)
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
    console.error(
      'There has been a problem with your fetch operation:',
      error.response ? error.response.data : error.message
    )
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

export async function getUniqueToolSpecs() {
  try {
    const response = await axios.get(`${BASE_URL}/unique-tool-specs`)
    return response.data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
    throw error
  }
}

export async function getToolById(id) {
  try {
    const response = await axios.get(`${BASE_URL}/tool/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching tool by ID:', error)
    return null
  }
}
