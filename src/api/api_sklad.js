import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api'
export async function addToWarehouse(toolId, kolvo_sklad, norma, zakaz) {
  try {
    const response = await axios.post(
      `${BASE_URL}/add-to-warehouse/${toolId}`,
      { kolvo_sklad, norma, zakaz }
    )
    console.log('Ответ сервера:', response)
    return response.data
  } catch (error) {
    console.error('Проблема с запросом на сервер:', error)
    console.log(error.response) // Добавьте это для вывода ответа сервера
    return null
  }
}
