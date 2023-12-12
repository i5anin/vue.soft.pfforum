const { Pool } = require('pg')
const { getNetworkDetails } = require('../db_type')
const config = require('../config')

const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest

// Создание пула соединений с базой данных
const pool = new Pool(dbConfig)

// Функция для построения дерева данных
async function buildTreeData(parentId = 0) {
  try {
    const { rows } = await pool.query(
      `SELECT t.id, t.id_parent, t.name,
        (SELECT COUNT(*) FROM dbo.tool_nom n WHERE n.parent_id = t.id) as element_count
      FROM dbo.tool_tree t
      WHERE t.id_parent = $1`,
      [parentId]
    )

    const treeData = []
    for (const row of rows) {
      const children = await buildTreeData(row.id)
      const totalElements =
        children.reduce((acc, child) => acc + child.totalElements, 0) +
        parseInt(row.element_count)

      treeData.push({
        id: row.id,
        label: row.name,
        elements: parseInt(row.element_count, 10),
        totalElements: totalElements, // Общее количество элементов в поддереве
        nodes: children,
      })
    }

    return treeData
  } catch (error) {
    throw error
  }
}

const addBranch = async (req, res) => {
  try {
    // Check for malformed JSON input
    if (!req.body) {
      return res.status(400).json({ message: 'Invalid JSON input' })
    }

    const { name, parentId } = req.body

    // First, check if the parentId exists in the database
    const parentCheckResult = await pool.query(
      `SELECT id FROM dbo.tool_tree WHERE id = $1`,
      [parentId]
    )

    // If the parentId does not exist, send an error response
    if (parentCheckResult.rows.length === 0) {
      return res
        .status(400)
        .json({ message: `Branch ID ${parentId} does not exist.` })
    }

    // Execute SQL query to insert the new branch
    const result = await pool.query(
      `INSERT INTO dbo.tool_tree (name, id_parent)
       VALUES ($1, $2)
       RETURNING id`,
      [name, parentId]
    )

    // Respond with the ID of the newly added branch
    res.json({
      message: 'New branch added successfully.',
      newBranchId: result.rows[0].id,
    })
  } catch (error) {
    console.error('Error adding new branch:', error)
    res.status(500).json({ message: `Error: ${error.message}` })
  }
}

// Экспорт функции для получения дерева инструментов
async function getToolsTree(req, res) {
  try {
    const tree = await buildTreeData()
    res.json(tree)
  } catch (error) {
    console.error(error)
    res.status(500).send(error.message)
  }
}

async function dellFolderTree(req, res) {
  try {
    const itemId = req.params.id // Изменено на req.params.id

    // Проверка существования папки
    const folderExistResult = await pool.query(
      'SELECT id FROM dbo.tool_tree WHERE id = $1',
      [itemId]
    )
    console.log('Folder Exist Result:', folderExistResult)
    if (folderExistResult.rows.length === 0) {
      return res.status(400).send({
        message: 'Папка не существует',
        reason: 'Folder does not exist',
      })
    }

    // Проверка наличия дочерних элементов
    const childCheckResult = await pool.query(
      'SELECT id FROM dbo.tool_tree WHERE id_parent = $1',
      [itemId]
    )
    console.log('Child Check Result:', childCheckResult.rows)
    if (childCheckResult.rows.length > 0) {
      return res.status(400).send({
        message: 'Нельзя удалить папку с дочерними элементами',
        reason: 'Folder has child elements',
      })
    }

    // Проверка отсутствия привязанных номенклатур
    const nomenclatureCheckResult = await pool.query(
      'SELECT id FROM dbo.tool_nom WHERE parent_id = $1',
      [itemId]
    )
    console.log('Nomenclature Check Result:', nomenclatureCheckResult.rows)
    if (nomenclatureCheckResult.rows.length > 0) {
      return res.status(400).send({
        message: 'Нельзя удалить папку с привязанными номенклатурами',
        reason: 'Folder is linked to nomenclature',
      })
    }

    // Удаление папки из базы данных
    await pool.query('DELETE FROM dbo.tool_tree WHERE id = $1', [itemId])

    res.status(200).send({ message: 'Папка успешно удалена' })
  } catch (error) {
    console.error('Ошибка при удалении папки:', error)
    res
      .status(500)
      .send({ message: 'Ошибка при удалении папки', reason: error.message })
  }
}

async function updateFolderTree(req, res) {
  console.log('Request body:', req.body) // Для отладки
  try {
    const { id, newName } = req.body // Получение ID и нового названия из тела запроса

    if (!id || !newName)
      return res
        .status(400)
        .json({ message: 'Необходимы ID и новое имя папки' })

    // Проверка, чтобы не разрешать обновление для ID равного 0
    if (id === 0)
      return res
        .status(400)
        .json({ message: 'Переименование папки с ID 0 запрещено' })

    // Выполнение SQL запроса на обновление
    await pool.query('UPDATE dbo.tool_tree SET name = $1 WHERE id = $2', [
      newName,
      id,
    ])

    res.json({ message: 'Название папки успешно обновлено' })
  } catch (error) {
    console.error('Ошибка при обновлении названия папки:', error)
    res.status(500).json({ message: 'Ошибка сервера', reason: error.message })
  }
}

module.exports = {
  updateFolderTree,
  dellFolderTree,
  getToolsTree,
  addBranch,
}
