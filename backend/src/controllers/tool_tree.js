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
    const { name, parentId } = req.body
    // Execute SQL query to insert the new branch
    const result = await pool.query(
      `INSERT INTO dbo.tool_tree (name, id_parent)
       VALUES ($1, $2)
       RETURNING id`, // Return the ID of the new row
      [name, parentId]
    )

    // Respond with the ID of the newly added branch
    res.json({
      message: 'New branch added successfully.',
      newBranchId: result.rows[0].id,
    })
  } catch (error) {
    console.error('Error adding new branch:', error)
    res.status(500).send(`Error: ${error.message}`)
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
  addBranch,
}
