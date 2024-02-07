// Импорт общего экземпляра Axios и обработчиков ошибок
import axiosInstance from '@/api/axiosConfig'
import { handleApiError, handleResponse } from '@/api/errorHandler'

export const toolApi = {
  /**
   * Получение инструментов с возможностью фильтрации и пагинации.
   * @param search Поиск по ключевым словам.
   * @param page Номер страницы для пагинации.
   * @param limit Количество элементов на странице.
   * @param includeNull  Включать ли в результаты элементы с нулевыми значениями.
   * @param folderId Идентификатор родительской категории.
   * @param onlyInStock Показывать только те элементы, которые есть в наличии.
   * @param filters Объект с дополнительными фильтрами.
   */
  getTools: async (
    search = '',
    page = 1,
    limit = 10,
    includeNull = false,
    foldertId = null,
    onlyInStock = true,
    filters = {}
  ) => {
    console.log(filters)
    if (folderId === null || folderId === undefined) {
      console.error('Расположение текущего каталога не известно')
      return Promise.reject(new Error('Отсутствует folderId'))
    }

    // Соединение статических и динамических параметров
    const params = {
      search,
      page,
      limit,
      includeNull,
      onlyInStock,
      folder_id: folderId,
      ...filters,
    }

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
