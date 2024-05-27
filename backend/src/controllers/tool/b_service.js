const { Pool } = require('pg')
const getDbConfig = require('../../databaseConfig')
const { get } = require('axios')

// Получаем конфигурацию базы данных
const dbConfig = getDbConfig()

// Создаем пул подключений
const pool = new Pool(dbConfig)

async function compareINN() {
  try {
    // Загрузка данных из внешнего источника
    const externalResponse = await get(
      'https://api.pf-forum.ru/api/payments/inn.php'
    )
    const externalData = externalResponse.data.data

    // Загрузка данных из внутреннего API
    const internalResponse = await axios.get(
      'http://192.168.0.200:4001/api/inn'
    )
    const internalData = internalResponse.data.payments

    // Сравниваем данные по полю "fio" и ищем несоответствия в ИНН
    const discrepancies = []

    externalData.forEach((externalRecord) => {
      const internalRecord = internalData.find(
        (record) => record.fio === externalRecord.fio
      )

      if (internalRecord && (!externalRecord.inn || !internalRecord.inn)) {
        discrepancies.push({
          fio: externalRecord.fio,
          externalINN: externalRecord.inn || 'нет данных',
          internalINN: internalRecord.inn || 'нет данных',
          recommendation: !externalRecord.inn
            ? 'Добавить ИНН во внешний источник'
            : 'Добавить ИНН во внутренний источник',
        })
      }
    })

    // Выводим результат сравнения
    console.log(discrepancies)
  } catch (error) {
    console.error('Ошибка при загрузке или анализе данных: ', error)
  }
}

async function getUniqueRowsWithMaxId(req, res) {
  try {
    const getQuery = `
      WITH RankedTable AS (
        SELECT
          *,
          row_number() OVER (PARTITION BY inn ORDER BY id DESC) as rn
        FROM
          "dbo"."tabel_1c"
      )
      SELECT
        id,
        date,
        type,
        inn,
        fio,
        hours,
        hours_total,
        grade
      FROM
        RankedTable
      WHERE
        rn = 1;
    `

    // Выполняем SQL-запрос
    const result = await pool.query(getQuery)

    // Если запрос успешно выполнен и строки получены
    if (result.rows.length > 0) {
      res.status(200).json(result.rows)
    } else {
      res.status(404).send('Строки не найдены.')
    }
  } catch (err) {
    // Обработка возможных ошибок выполнения запроса
    console.error('Ошибка при выполнении запроса:', err.stack)
    res.status(500).send('Внутренняя ошибка сервера')
  }
}

module.exports = {
  getUniqueRowsWithMaxId,
  compareINN,
}
