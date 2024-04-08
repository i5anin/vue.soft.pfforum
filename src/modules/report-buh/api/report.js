import { handleApiError } from '@/api/errorHandler'
import axiosInstance from '@/api/axiosConfig'

function handleResponse(response) {
  return response.data
}

export const reportApi = {
  genBuchWeek: async () =>
    axiosInstance
      .get('/report/genBuchWeek')
      .then(handleResponse)
      .catch(handleApiError),
  genBuchEndOp: async () =>
    axiosInstance
      .get('/report/genBuchEndOp')
      .then(handleResponse)
      .catch(handleApiError),
  genBuchMonth: async () =>
    axiosInstance
      .get('/report/genBuchMonth')
      .then(handleResponse)
      .catch(handleApiError),
  genZayavInstr: async () =>
    axiosInstance
      .get('/report/genZayavInstr')
      .then(handleResponse)
      .catch(handleApiError),
  getZakaz: async () =>
    axiosInstance
      .get('/report/getZakaz')
      .then(handleResponse)
      .catch(handleApiError),
}
