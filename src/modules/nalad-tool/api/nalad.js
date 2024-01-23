import { handleApiError } from '@/api/errorHandler'
import axiosInstance from '@/api/axiosConfig'

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
