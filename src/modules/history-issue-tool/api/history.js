import axios from 'axios'
import { handleApiError } from '@/api/errorHandler'

const axiosInstance = axios.create({ baseURL: import.meta.env.VITE_BASE_URL })

function handleResponse(response) {
  return response.data
}

export const issueHistoryApi = {
  fetchHistoryByPartId: async (partId) =>
    axiosInstance
      .get(`/history-part`, { params: { id_part: partId } })
      .then(handleResponse)
      .catch(handleApiError),

  // Обновленная функция для получения истории инструмента с учетом даты
  fetchToolHistory: async (
    search = '',
    page = 1,
    limit = 100,
    date = '' // Добавляем новый параметр для даты
  ) => {
    const params = { search, page, limit, date } // Добавляем date в параметры запроса

    return axiosInstance
      .get('/history', { params })
      .then(handleResponse)
      .catch(handleApiError)
  },
}
