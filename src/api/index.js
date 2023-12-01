import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api'

import { addTool, deleteTool } from './api_tool'

export * from './api_tool'
// export * from './api_libraries'
// export * from './api_sklad'

export async function getDatabaseInfo() {
  try {
    const response = await axios.get(`${BASE_URL}/database-info`)
    return response.data
  } catch (error) {
    console.error('Error fetching database info:', error)
    throw error
  }
}
