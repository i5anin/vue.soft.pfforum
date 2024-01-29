import axiosInstance from '@/api/axiosConfig'
import { handleApiError } from '@/api/errorHandler'

async function downloadReport(endpoint) {
  try {
    const response = await axiosInstance.get(endpoint, { responseType: 'blob' })

    // Создаем URL из полученного blob для скачивания
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url

    // Получаем текущую дату и время
    const now = new Date()
    const dateStr = now.toISOString().replace(/:/g, '.')

    // Устанавливаем имя файла для скачивания
    link.setAttribute('download', `Report_${dateStr}.xlsx`)

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url) // Освобождаем ресурсы

    return response
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const reportApi = {
  genBuchWeek: () => downloadReport('/report/genBuchWeek'),
  genBuchEndOp: () => downloadReport('/report/genBuchEndOp'),
  genBuchMonth: () => downloadReport('/report/genBuchMonth'),
  genZayavInstr: () => downloadReport('/report/genZayavInstr'),
}
