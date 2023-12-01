import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api'

export async function login(credentials) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials) // Сохраните полученный токен в localStorage или в каком-либо хранилище состояний
    localStorage.setItem('token', response.data.token) // Возвращаем данные пользователя, если вам это необходимо
    return response.data
  } catch (error) {
    console.error(
      'There has been a problem with your login operation:',
      error.response ? error.response.data : error.message
    )
    throw error // Перебросьте ошибку, чтобы вызывающий код мог ее обработать
  }
}
