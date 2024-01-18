import axios from 'axios'
import { handleError } from '@/api/errorHandler'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api',
})

function handleResponse(response) {
  return response.data
}

export const toolTreeApi = {
  getTree: async () =>
    axiosInstance.get('/tools-tree').then(handleResponse).catch(handleError),
  addFolder: async (name, parentId) =>
    axiosInstance
      .post('/tools-tree', { name, parentId })
      .then(handleResponse)
      .catch(handleError),
  deleteFolder: async (itemId) =>
    axiosInstance.delete(`/tools-tree/${itemId}`).catch(handleError),
  renameFolder: async (id, newName) =>
    axiosInstance
      .put('/tools-tree', { id, newName })
      .then(handleResponse)
      .catch(handleError),
}
