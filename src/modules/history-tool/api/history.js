import axios from 'axios'
import { handleApiError } from '@/api/errorHandler'

const axiosInstance = axios.create({ baseURL: import.meta.env.VITE_BASE_URL })

function handleResponse(response) {
  return response.data
}

export const detailHistoryApi = {
  historyToolById: async (specs_op_id) =>
    axiosInstance
      .get('sklad/history', { params: { specs_op_id } })
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
      .get('/sklad', { params })
      .then(handleResponse)
      .catch(handleApiError)
  },
}
