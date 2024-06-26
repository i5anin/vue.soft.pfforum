import { handleApiError } from '@/api/errorHandler'
import { axiosInstance } from '@/api/axiosConfig'

function handleResponse(response) {
  return response.data
}

export const reportApi = {
  genBuchWeek: async () =>
    axiosInstance
      .get('/report/buch-week')
      .then(handleResponse)
      .catch(handleApiError),
  genBuchEndOp: async () =>
    axiosInstance
      .get('/report/buch-end-op')
      .then(handleResponse)
      .catch(handleApiError),
  genBuchMonth: async () =>
    axiosInstance
      .get('/report/buch-month')
      .then(handleResponse)
      .catch(handleApiError),
  genZayavInstr: async (token) =>
    axiosInstance
      .get('/report/zayav-instr', {
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
