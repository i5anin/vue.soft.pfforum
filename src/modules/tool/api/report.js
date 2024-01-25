import { handleApiError } from '@/api/errorHandler'
import axiosInstance from '@/api/axiosConfig'

function handleResponse(response) {
  return response.data
}

export const reportApi = {
  updateToolParam: async () =>
    axiosInstance.put(`/excel`).then(handleResponse).catch(handleApiError),
}
