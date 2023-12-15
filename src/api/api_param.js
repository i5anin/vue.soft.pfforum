import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api'

export async function getToolParams() {
  try {
    const response = await axios.get(`${BASE_URL}/tools-params`)
    return response.data
  } catch (error) {
    console.error(
      'There has been a problem with fetching tool parameters:',
      error
    )
    return null
  }
}

export async function updateToolParam(id, updatedParam) {
  try {
    const response = await axios.put(
      `${BASE_URL}/tools-params/${id}`,
      updatedParam
    )
    return response.data
  } catch (error) {
    console.error('Error updating tool parameter:', error)
    return null
  }
}

export async function deleteToolParam(id) {
  try {
    const response = await axios.delete(`${BASE_URL}/tools-params/${id}`)
    return response.data
  } catch (error) {
    console.error('Error deleting tool parameter:', error)
    return null
  }
}

export async function addToolParam(newParam) {
  try {
    const response = await axios.post(`${BASE_URL}/tools-params`, newParam)
    return response.data
  } catch (error) {
    console.error('Error adding new tool parameter:', error)
    return null
  }
}
