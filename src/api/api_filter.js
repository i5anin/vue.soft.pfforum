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
