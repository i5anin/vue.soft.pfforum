const { Pool } = require('pg')
const { getNetworkDetails } = require('../../db_type')
const config = require('../../config')
const getDbConfig = require('../../databaseConfig')

// Получение конфигурации для соединения с базой данных
const networkDetails = getNetworkDetails()
const dbConfig = getDbConfig()
// Создание пула подключений к БД
const pool = new Pool(dbConfig)

// Функция для получения истории инструментов

async function updateToolInventory(req, res) {
  try {
    // Извлекаем id, sklad, и norma из запроса
    const { id, sklad, norma, limit } = req.body

    // Проверяем, что sklad и norma больше или равны нулю
    if (sklad < 0 || norma < 0 || limit < 0) {
      return res
        .status(400)
        .send('sklad, norma и limit должны быть больше или равны нулю.')
    }

    // SQL запрос для обновления данных
    const updateQuery = `
      UPDATE dbo.tool_nom
      SET sklad = $1,
          norma = $2
      WHERE id = $3 RETURNING *;
    `

    // Параметры для запроса
    const values = [sklad, norma, id]

    // Выполняем запрос
    const updateResult = await pool.query(updateQuery, values)

    // Проверяем, обновлена ли какая-либо строка
    if (updateResult.rowCount > 0) {
      // Возвращаем обновленные данные
      res.status(200).json({ success: 'OK', data: updateResult.rows[0] })
    } else {
      res.status(404).send('Инструмент не найден.')
    }
  } catch (err) {
    console.error('Ошибка при выполнении запроса на обновление', err.stack)
    res.status(500).send('Ошибка при выполнении запроса')
  }
}

module.exports = {
  updateToolInventory,
}
