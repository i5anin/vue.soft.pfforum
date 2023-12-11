import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api'

export async function getToolsTree() {
  try {
    const response = await axios.get(`${BASE_URL}/tools-tree`)
    return response.data // Возвращаем полученное дерево
  } catch (error) {
    console.error('There has been a problem with fetching tools tree:', error)
    return null
  }
}

export async function addBranch(name, parentId) {
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

export async function deleteItem(itemId) {
  return axios.delete(`${BASE_URL}/tools-tree/${itemId}`)
}
