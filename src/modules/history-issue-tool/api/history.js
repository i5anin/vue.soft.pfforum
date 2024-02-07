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

  // Получить историю инструмента
  fetchToolHistory: async (
    search = '',
    page = 1,
    limit = 100,
    includeNull = false,
    folderId = null
  ) => {
    const params = { search, page, limit, includeNull }
    if (folderId !== null) {
      params.folder_id = folderId
    }

    return axiosInstance
      .get('/history', { params })
      .then(handleResponse)
      .catch(handleApiError)
  },
}
