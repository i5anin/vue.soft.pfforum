import axios from 'axios'

const axiosInstance = axios.create({ baseURL: import.meta.env.VITE_BASE_URL })

function handleResponse(response) {
  return response.data
}

function handleError(error) {
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

  onToolOperationId: async (name, description, no) =>
    axiosInstance
      .get('detail/types', {
        params: { name, description, no, type },
      })
      .then(handleResponse)
      .catch(handleError),
}
