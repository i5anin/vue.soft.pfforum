// Импорт общего экземпляра Axios и обработчиков ошибок
import axiosInstance from '@/api/axiosConfig'
import { handleApiError, handleResponse } from '@/api/errorHandler'

export const toolApi = {
  // Получить инструменты с фильтрацией и пагинацией
  checkLogin: async () => {
    return axiosInstance
      .get('/check-login')
      .then(handleResponse)
      .catch(handleApiError)
  },

  // Выполнить логин пользователя
  login: async (credentials) => {
    return axiosInstance
      .post('/login', credentials)
      .then(handleResponse)
      .catch(handleApiError)
  },
}
