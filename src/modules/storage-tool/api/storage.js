import axios from 'axios'
import { handleApiError } from '@/api/errorHandler'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api',
})

function handleResponse(response) {
  return response.data
}

export const toolInventoryApi = {
  // Обновить инвентарь инструмента
  updateToolInventory: async (toolData) =>
    axiosInstance
      .post('/sklad/update', toolData)
      .then(handleResponse)
      .catch(handleApiError),
}
