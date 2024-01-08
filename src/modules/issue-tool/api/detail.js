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
  //получить название
  getDetailNames: async () =>
    axiosInstance.get('detail/names').then(handleResponse).catch(handleError),

  //получить обозначение
  getDetailDescriptions: async (value) =>
    axiosInstance
      .get('detail/descriptions', { params: { name: value } })
      .then(handleResponse)
      .catch(handleError),

  //получить номер
  getDetailNo: async (value) =>
    axiosInstance
      .get('detail/no', {
        params: { name: value, description: value },
      })
      .then(handleResponse)
      .catch(handleError),

  //получить тип
  getDetailType: async (value) =>
    axiosInstance
      .get('detail/type', {
        params: { name: value, description: value, no: value },
      })
      .then(handleResponse)
      .catch(handleError),

  //получить fio
  getDetailFio: async () =>
    axiosInstance.get('detail/fio').then(handleResponse).catch(handleError),
}
