import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api'

export async function getTree() {
  try {
    const response = await axios.get(`${BASE_URL}/tools-tree`)
    return response.data // Возвращаем полученное дерево
  } catch (error) {
    console.error('There has been a problem with fetching tools tree:', error)
    return null
  }
}

export async function addFolder(name, parentId) {
  try {
    const response = await axios.post(`${BASE_URL}/tools-tree`, {
      name,
      parentId,
    })
    return response.data // Return the response data from the server
  } catch (error) {
    console.error('Error adding new branch:', error)
    return null // Return null or an appropriate error response
  }
}

export async function deleteFolder(itemId) {
  return axios.delete(`${BASE_URL}/tools-tree/${itemId}`)
}

export async function renameFolder(id, newName) {
  try {
    console.log(
      `Отправка запроса на переименование: id=${id}, newName=${newName}`
    )
    const response = await axios.put(`${BASE_URL}/tools-tree`, { id, newName })
    console.log('Ответ сервера:', response.data)
    return response.data
  } catch (error) {
    console.error('Ошибка при переименовании элемента:', error)
    return null
  }
}
