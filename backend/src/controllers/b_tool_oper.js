const { Pool } = require('pg')
const { getNetworkDetails } = require('../db_type')
const config = require('../config')

// Получение настроек для подключения к базе данных
const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest

// Создание соединения с базой данных
const pool = new Pool(dbConfig)

async function getDetailNames(req, res) {
  try {
    const query = `
      SELECT DISTINCT
        TRIM(BOTH ' ' FROM dbo.specs_nom.NAME) AS trimmed_name
      FROM
        dbo.specs_nom
        INNER JOIN dbo.specs_nom_operations ON specs_nom_operations.specs_nom_id = specs_nom.id
        INNER JOIN dbo.operations_ordersnom ON operations_ordersnom.op_id = specs_nom_operations.ordersnom_op_id
      WHERE
        specs_nom.status_p = 'П'
        AND NOT specs_nom.status_otgruzka
        AND (POSITION('ЗАПРЕТ' IN UPPER(specs_nom.comments)) = 0 OR specs_nom.comments IS NULL)
        AND (T OR dmc OR hision OR f OR f4 OR fg OR tf)
      ORDER BY
        trimmed_name;
    `
    const result = await pool.query(query)
    // Преобразование результатов в массив имен
    const namesArray = result.rows.map((row) => row.trimmed_name)

    res.json(namesArray)
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error)
    res.status(500).send('Внутренняя ошибка сервера')
  }
}

async function getDetailDescriptions(req, res) {
  try {
    const query = `
      SELECT
        CAST(dbo.specs_nom_operations.id AS INTEGER) AS specs_op_id,
        dbo.specs_nom.ID,
        dbo.specs_nom.NAME,
        dbo.specs_nom.description,
        operations_ordersnom.no,
        dbo.get_full_cnc_type(dbo.get_op_type_code ( specs_nom_operations.ID )) as cnc_type
      FROM
        dbo.specs_nom
        INNER JOIN dbo.specs_nom_operations ON specs_nom_operations.specs_nom_id = specs_nom.id
        INNER JOIN dbo.operations_ordersnom ON operations_ordersnom.op_id = specs_nom_operations.ordersnom_op_id
      WHERE
        CAST(dbo.specs_nom.ID AS TEXT) LIKE $1
        AND specs_nom.status_p = 'П'
        AND NOT specs_nom.status_otgruzka
        AND ( POSITION('ЗАПРЕТ' IN UPPER(specs_nom.comments)) = 0 OR specs_nom.comments IS NULL )
        AND (T OR dmc OR hision OR f OR f4 OR fg OR tf)
      ORDER BY
        dbo.specs_nom.NAME,
        dbo.specs_nom.description,
        operations_ordersnom.no::INT
    `
    const result = await pool.query(query, [req.query.id + '%'])
    res.json(result.rows)
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error)
    res.status(500).send('Внутренняя ошибка сервера')
  }
}

async function getDetailNo(req, res) {
  try {
    const name = req.query.name.toLowerCase().trim()
    const description = req.query.description.toLowerCase().trim()

    const query = `
      SELECT DISTINCT
        dbo.operations_ordersnom.no
      FROM
        dbo.specs_nom
        INNER JOIN dbo.specs_nom_operations ON specs_nom_operations.specs_nom_id = specs_nom.id
        INNER JOIN dbo.operations_ordersnom ON operations_ordersnom.op_id = specs_nom_operations.ordersnom_op_id
      WHERE
        LOWER(TRIM(BOTH ' ' FROM dbo.specs_nom.name)) = '${name}'
        AND LOWER(TRIM(BOTH ' ' FROM dbo.specs_nom.description)) = '${description}'
        AND specs_nom.status_p = 'П'
        AND NOT specs_nom.status_otgruzka
        AND (POSITION('ЗАПРЕТ' IN UPPER(specs_nom.comments)) = 0 OR specs_nom.comments IS NULL)
        AND (T OR dmc OR hision OR f OR f4 OR fg OR tf)
      ORDER BY
        dbo.operations_ordersnom.no;
    `
    const result = await pool.query(query)
    const nosArray = result.rows.map((row) => row.no)
    res.json(nosArray)
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error)
    res.status(500).send('Внутренняя ошибка сервера')
  }
}

async function getDetailType(req, res) {
  try {
    const name = req.query.name.toLowerCase().trim()
    const description = req.query.description.toLowerCase().trim()
    const no = req.query.no

    const query = `
      SELECT DISTINCT
        dbo.get_full_cnc_type(dbo.get_op_type_code(specs_nom_operations.ID)) AS type
      FROM
        dbo.specs_nom
        INNER JOIN dbo.specs_nom_operations ON specs_nom_operations.specs_nom_id = specs_nom.id
        INNER JOIN dbo.operations_ordersnom ON operations_ordersnom.op_id = specs_nom_operations.ordersnom_op_id
      WHERE
        LOWER(TRIM(BOTH ' ' FROM dbo.specs_nom.name)) = '${name}'
        AND LOWER(TRIM(BOTH ' ' FROM dbo.specs_nom.description)) = '${description}'
        AND operations_ordersnom.no = '${no}'
        AND specs_nom.status_p = 'П'
        AND NOT specs_nom.status_otgruzka
        AND (POSITION('ЗАПРЕТ' IN UPPER(specs_nom.comments)) = 0 OR specs_nom.comments IS NULL)
        AND (T OR dmc OR hision OR f OR f4 OR fg OR tf)
      ORDER BY
        type;
    `
    const result = await pool.query(query)
    const typesArray = result.rows.map((row) => row.type)
    res.json(typesArray)
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error)
    res.status(500).send('Внутренняя ошибка сервера')
  }
}

async function getDetailId(req, res) {
  try {
    // Extracting parameters from the request
    const { name, description, no, type } = req.query

    // SQL query to fetch data based on the parameters
    const query = `
            SELECT
                dbo.specs_nom_operations.id AS specs_op_id,
                dbo.specs_nom.ID,
                dbo.specs_nom.NAME,
                dbo.specs_nom.description,
                operations_ordersnom.no,
                dbo.get_full_cnc_type(dbo.get_op_type_code(specs_nom_operations.ID)) AS type
            FROM
                dbo.specs_nom
                INNER JOIN dbo.specs_nom_operations ON specs_nom_operations.specs_nom_id = specs_nom.id
                INNER JOIN dbo.operations_ordersnom ON operations_ordersnom.op_id = specs_nom_operations.ordersnom_op_id
            WHERE
                LOWER(TRIM(BOTH ' ' FROM dbo.specs_nom.name)) = LOWER('${name}')
                AND LOWER(TRIM(BOTH ' ' FROM dbo.specs_nom.description)) = LOWER('${description}')
                AND operations_ordersnom.no = '${no}'
                AND dbo.get_full_cnc_type(dbo.get_op_type_code(specs_nom_operations.ID)) = '${type}'
                AND specs_nom.status_p = 'П'
                AND NOT specs_nom.status_otgruzka
                AND (POSITION('ЗАПРЕТ' IN UPPER(specs_nom.comments)) = 0 OR specs_nom.comments IS NULL)
                AND (T OR dmc OR hision OR f OR f4 OR fg OR tf)
            ORDER BY
                dbo.specs_nom.NAME, dbo.specs_nom.description, operations_ordersnom.no;
        `

    // Executing the query
    const result = await pool.query(query)

    // Проверка, есть ли результаты, и отправка первого результата
    if (result.rows && result.rows.length > 0) {
      res.json(result.rows[0])
    } else {
      res.status(404).send('Объект не найден')
    }
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error)
    res.status(500).send('Внутренняя ошибка сервера')
  }
}

async function getAllOperators(req, res) {
  try {
    // SQL запрос для получения всех ID и фамилий из таблицы operators, исключая запись с id = 1,
    // отсортированных по фамилии в алфавитном порядке
    const query = `
      SELECT id, fio
      FROM dbo.operators
      WHERE id != 1
      ORDER BY fio ASC;
    `

    // Выполнение запроса
    const result = await pool.query(query)

    // Проверка наличия результатов и их отправка
    if (result.rows && result.rows.length > 0) {
      res.json(result.rows)
    } else {
      res.status(404).send('Операторы не найдены')
    }
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error)
    res.status(500).send('Внутренняя ошибка сервера')
  }
}

module.exports = {
  getDetailId,
  getDetailNames,
  getDetailDescriptions,
  getDetailNo,
  getDetailType,
  getAllOperators,
}
