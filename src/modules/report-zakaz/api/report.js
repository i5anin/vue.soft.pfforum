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
  genZayavInstr: async (token) =>
    axiosInstance
      .get('/report/genZayavInstr', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(handleResponse)
      .catch(handleApiError),
  getZakaz: async () =>
    axiosInstance
      .get('/report/get-zakaz')
      .then(handleResponse)
      .catch(handleApiError),
}
