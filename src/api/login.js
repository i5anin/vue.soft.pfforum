import axiosInstance from '@/api/axiosConfig'
import { handleApiError, handleResponse } from '@/api/errorHandler'

export async function getToolParams() {
  return axiosLogin
    .get('/check-login')
    .then(handleResponse)
    .catch(handleApiError)

    .get('/login')
    .then(handleResponse)
    .catch(handleApiError)
}
