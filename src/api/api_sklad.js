import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api'
export async function fetchToolHistory() {
  try {
    const response = await axios.get(`${BASE_URL}/sklad`)
    console.log('Ответ сервера:', response)
    return response.data
  } catch (error) {
    console.error('Проблема с запросом на сервер:', error)
    return null
  }
}
