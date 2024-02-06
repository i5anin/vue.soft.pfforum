// Импорт общего экземпляра Axios и обработчиков ошибок
import axiosInstance from '@/api/axiosConfig'
import { handleApiError, handleResponse } from '@/api/errorHandler'

export const toolApi = {
  /**
   * Получение инструментов с возможностью фильтрации и пагинации.
   *
   * @param {Object} options Объект с параметрами запроса.
   * @param {string} [options.search=''] Поиск по ключевым словам.
   * @param {number} [options.page=1] Номер страницы для пагинации.
   * @param {number} [options.limit=10] Количество элементов на странице.
   * @param {boolean} [options.includeNull=false] Включать ли в результаты элементы с нулевыми значениями.
   * @param {number} options.parentId Идентификатор родительской категории.
   * @param {boolean} [options.onlyInStock=true] Показывать только те элементы, которые есть в наличии.
   * @param {Object} [options.filters={}] Объект с дополнительными фильтрами.
   * @returns {Promise} Промис с результатом запроса.
   */
  getTools: async ({
    search = '',
    page = 1,
    limit = 10,
    includeNull = false,
    parentId = null,
    onlyInStock = true,
    filters = {},
  }) => {
    // Логирование аргументов функции
    console.log(`Вызов getTools с аргументами:
    search: ${search},
    page: ${page},
    limit: ${limit},
    includeNull: ${includeNull},
    parentId: ${parentId},
    onlyInStock: ${onlyInStock},
    filters: ${JSON.stringify(filters)}
  `)

    if (parentId === null || parentId === undefined) {
      console.error('Отсутствует parentId')
      return
    }
    const params = {
      search,
      page,
      limit,
      includeNull,
      onlyInStock,
      parentId,
      ...filters,
    }
    console.log('Отправка запроса с параметрами:', params)

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
