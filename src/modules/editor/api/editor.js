import { handleApiError } from '@/api/errorHandler'
import { axiosInstance, axiosInstanceLaravel } from '@/api/axiosConfig'

function handleResponse(response) {
  return response.data
}

export const editorToolApi = {
  // Добавить новый инструмент
  addTool: async (toolData) =>
    axiosInstanceLaravel
      .post('/tool', toolData)
      .then(handleResponse)
      .catch(handleApiError),

  // Удалить инструмент по ID
  deleteTool: async (id) =>
    axiosInstanceLaravel
      .delete(`/tool/${id}`)
      .then(handleResponse)
      .catch(handleApiError),

  // Обновить существующий инструмент
  updateTool: async (id, toolData) =>
    axiosInstanceLaravel
      .put(`/tool/${id}`, toolData)
      .then(handleResponse)
      .catch(handleApiError),

  // Получить параметры инструмента по parent_id
  getToolParamsByParentId: async (parentId) =>
    axiosInstanceLaravel
      .get(`/tools-params/${parentId}`)
      .then(handleResponse)
      .catch(handleApiError),
  // В editorToolApi объекте
  getToolNamesByParentId: async (parentId) =>
    axiosInstance
      .get(`/tools-params-name/${parentId}`)
      .then(handleResponse)
      .catch(handleApiError),
}
