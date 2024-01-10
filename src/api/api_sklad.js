import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api'
export async function fetchToolHistory( //FIXME тут проблема
  search = '',
  page = 1,
  limit = 100,
  includeNull = false,
  parentId = null
) {
  const params = { search, page, limit, includeNull }
  if (parentId !== null) {
    params.parent_id = parentId
  }

  try {
    const response = await axios.get(`${BASE_URL}/sklad`, { params })
    response.data.totalCount = parseInt(response.data.totalCount, 10)
    return response.data
  } catch (error) {
    console.error('Проблема с запросом на сервер:', error)
    return null
  }
}

export async function updateToolInventory(toolData) {
  try {
    const response = await axios.post(`${BASE_URL}/sklad/update`, toolData)
    return response.data
  } catch (error) {
    console.error('Проблема с запросом на сервер:', error)
    return null
  }
}
