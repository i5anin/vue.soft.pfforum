import axios from 'axios'
import { handleApiError } from '@/api/errorHandler'

const axiosInstance = axios.create({ baseURL: import.meta.env.VITE_BASE_URL })

function handleResponse(response) {
  return response.data
}

export const detailHistoryApi = {
  historyToolById: async (specs_op_id) =>
    axiosInstance
      .get(`/history/${specs_op_id}`)
      .then(handleResponse)
      .catch(handleApiError),

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
    parentId = null
  ) => {
    const params = { search, page, limit, includeNull }
    if (parentId !== null) {
      params.parent_id = parentId
    }

    return axiosInstance
      .get('/history', { params })
      .then(handleResponse)
      .catch(handleApiError)
  },
}
