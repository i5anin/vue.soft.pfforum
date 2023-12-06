import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api'

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
export async function getLibraries() {
  try {
    const response = await axios.get(`${BASE_URL}/tool-library`)
    // console.log(response.data)
    return response.data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
  }
}
export async function deleteMaterial(id) {
  try {
    const response = await axios.delete(`${BASE_URL}/material/${id}`)
    return response.data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
    return null
  }
}
export async function deleteType(id) {
  try {
    const response = await axios.delete(`${BASE_URL}/type/${id}`)
    return response.data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
    return null
  }
}
export async function deleteGroup(id) {
  try {
    const response = await axios.delete(`${BASE_URL}/group/${id}`)
    return response.data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
    return null
  }
}

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
