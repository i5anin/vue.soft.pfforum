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

  // New API function for fetching old part history
  fetchHistoryByPartIdOld: async (page, limit) =>
    axiosInstance
      .get('/history-part-old', { params: { page, limit } })
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

  // New API function for canceling an operation by its ID
  cancelOperationAdmin: async (operationId) =>
    axiosInstance
      .get(`/issue/cancel-operation-admin/${operationId}`)
      .then(handleResponse)
      .catch(handleApiError),

  // New API function for canceling an operation by its ID
  cancelOperation: async (operationId) =>
    axiosInstance
      .get(`/issue/cancel-operation/${operationId}`)
      .then(handleResponse)
      .catch(handleApiError),
}
