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

export async function getTools(
  search = '',
  page = 1,
  limit = 10,
  includeNull = false,
  parentId = null,
  onlyInStock = true
) {
  const params = { search, page, limit, includeNull, onlyInStock }
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

export async function getToolById(id) {
  try {
    const response = await axios.get(`${BASE_URL}/tool/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching tool by ID:', error)
    return null
  }
}
