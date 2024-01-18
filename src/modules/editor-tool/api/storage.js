import axios from 'axios'
import { handleError } from '@/api/errorHandler'

const axiosInstance = axios.create({ baseURL: import.meta.env.VITE_BASE_URL })

function handleResponse(response) {
  return response.data
}

export const detailApi = {
  //получить fio
  getDetailFio: async () =>
    axiosInstance.get('detail/fio').then(handleResponse).catch(handleError),

  //получить название
  getDetailNames: async () =>
    axiosInstance.get('detail/names').then(handleResponse).catch(handleError),

  //получить обозначение
  getDetailDescriptions: async (name) =>
    axiosInstance
      .get('detail/descriptions', { params: { name } })
      .then(handleResponse)
      .catch(handleError),

  //получить номер
  getDetailNo: async (name, description) =>
    axiosInstance
      .get('detail/no', { params: { name, description } })
      .then(handleResponse)
      .catch(handleError),

  //получить тип
  getDetailType: async (name, description, no) =>
    axiosInstance
      .get('detail/types', {
        params: { name, description, no },
      })
      .then(handleResponse)
      .catch(handleError),

  onToolOperation: async (name, description, no, type) =>
    axiosInstance
      .get('detail/find-id', {
        params: { name, description, no, type },
      })
      .then(handleResponse)
      .catch(handleError),

  searchById: async (value) =>
    axiosInstance
      .get('detail/id', { params: { value } })
      .then(handleResponse)
      .catch(handleError),
}
