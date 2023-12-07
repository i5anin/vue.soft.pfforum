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
    // Запрос к базе данных
    const { rows } = await pool.query(
      'SELECT id, name, (SELECT COUNT(*) FROM dbo.tool_nom WHERE parent_id = tt.id) AS elements FROM dbo.tool_tree AS tt WHERE id_parent = $1',
      [parentId]
    )

    const treeData = []
    for (const row of rows) {
      // Рекурсивно строим дерево для каждого дочернего узла
      const children = await buildTreeData(row.id)
      treeData.push({
        id: row.id,
        label: row.name,
        elements: parseInt(row.elements, 10), // Преобразование строки в число
        nodes: children,
      })
    }

    return treeData
  } catch (error) {
    throw error
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

module.exports = {
  getToolsTree,
}
