// Импорт общего экземпляра Axios и обработчиков ошибок
import axiosInstance from '@/api/axiosConfig'
import { handleApiError, handleResponse } from '@/api/errorHandler'

export const toolApi = {
  // Получить инструменты с фильтрацией и пагинацией
  getTools: async (
    search = '',
    page = 1,
    limit = 10,
    includeNull = false,
    parentId = null,
    onlyInStock = true,
    filters = {} // Добавьте новый параметр для динамических фильтров
  ) => {
    if (parentId === null || parentId === undefined) {
      console.error(
        'Критическая ошибка: данные о папке отсутствуют (расположение текущего каталога не известно)'
      )
      return Promise.reject(new Error('Отсутствует parentId'))
    }

    // Соединение статических и динамических параметров
    const params = { search, page, limit, includeNull, onlyInStock, ...filters }
    params.parent_id = parentId // Добавляем parentId к параметрам запроса

    return axiosInstance
      .get('/tools', { params })
      .then(handleResponse)
      .catch(handleApiError)
  },

  // Получить инструмент по ID
  getToolById: async (id) => {
    return axiosInstance
      .get(`/tool/${id}`)
      .then(handleResponse)
      .catch(handleApiError)
  },
}
