import axios from 'axios'

const axiosInstance = axios.create({ baseURL: import.meta.env.VITE_BASE_URL })

function handleResponse(response) {
  return response.data
}

function handleApiError(error) {
  if (error.response) {
    console.error('Ошибка от сервера:', error.response.data)
    console.error('Статус:', error.response.status)
    console.error('Заголовки:', error.response.headers)
  } else if (error.request) {
    console.error('Запрос был сделан, но ответ не получен:', error.request)
  } else {
    console.error('Ошибка при настройке запроса:', error.message)
  }
  console.error('Конфигурация запроса:', error.config)
  throw error // Перебрасываем ошибку дальше, если нужно дополнительное взаимодействие с ней
}

export const detailHistoryApi = {
  historyToolById: async (specs_op_id) =>
    axiosInstance
      .get('sklad/history', { params: { specs_op_id } })
      .then(handleResponse)
      .catch(handleApiError),

  // Получить историю инструмента
  fetchToolHistory: async (
    search = '',
    page = 1,
    limit = 100,
    includeNull = false,
    parentId = null
  ) => {
    const params = { search, page, limit, includeNull }
    if (parentId !== null) {
      params.parent_id = parentId
    }

    return axiosInstance
      .get('/sklad', { params })
      .then(handleResponse)
      .catch(handleApiError)
  },
}
