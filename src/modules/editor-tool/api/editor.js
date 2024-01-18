import axios from 'axios'
import { handleApiError } from '@/api/errorHandler'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api',
})

function handleResponse(response) {
  return response.data
}

export const toolEditorApi = {
  // Добавить новый инструмент
  addTool: async (toolData) =>
    axiosInstance
      .post('/tool', toolData)
      .then(handleResponse)
      .catch(handleApiError),

  // Удалить инструмент по ID
  deleteTool: async (id) =>
    axiosInstance
      .delete(`/tool/${id}`)
      .then(handleResponse)
      .catch(handleApiError),

  // Обновить существующий инструмент
  updateTool: async (id, toolData) =>
    axiosInstance
      .put(`/tool/${id}`, toolData)
      .then(handleResponse)
      .catch(handleApiError),
}
