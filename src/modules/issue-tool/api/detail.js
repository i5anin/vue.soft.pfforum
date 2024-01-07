import axios from 'axios'

const axiosInstance = axios.create({ baseURL: import.meta.env.VITE_BASE_URL })

export const detailApi = {
  getDetailNames: async () =>
    axiosInstance
      .get('detail/names')
      .then((response) => response.data)
      .catch((e) => console.error(e)),
  getDetailDescriptions: async (value) =>
    axiosInstance
      .get('detail/descriptions', { params: { name: value } })
      .then((response) => response.data)
      .catch((e) => console.error(e)),
}
