import axiosInstance from '@/api/axiosConfig'
import { handleApiError } from '@/api/errorHandler'

export const reportApi = {
  genZayavInstr: async () => {
    try {
      // Отправляем запрос, ожидая ответ в формате 'blob'
      const response = await axiosInstance.get('/report/genZayavInstr', {
        responseType: 'blob',
      })

      // Создаем URL из полученного blob для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url

      // Получаем текущую дату и время
      const now = new Date()
      const dateStr = now.toISOString().replace(/:/g, '.')

      // Устанавливаем имя файла для скачивания
      link.setAttribute('download', `Zakaz_${dateStr}.xlsx`)

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url) // Освобождаем ресурсы

      return response // Возвращаем ответ для дальнейшей обработки, если это необходимо
    } catch (error) {
      handleApiError(error) // Обработка ошибок
      throw error // Перебрасываем ошибку для дальнейшего уведомления пользователя
    }
  },
}
