// tool_tree.js
const { Pool } = require('pg')
const { getNetworkDetails } = require('../db_type')
const config = require('../config')

const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest
const pool = new Pool(dbConfig)

async function buildTreeData(parentId = 0) {
  try {
    const { rows } = await pool.query(
      'SELECT t.id, t.id_parent, t.name, COUNT(n.id) as element_count FROM dbo.tool_tree t LEFT JOIN dbo.tool_nom n ON t.id = n.parent_id WHERE t.id_parent = $1 GROUP BY t.id',
      [parentId]
    )

    const treeData = []
    for (const row of rows) {
      const children = await buildTreeData(row.id)
      treeData.push({
        id: row.id,
        label: row.name,
        elements: row.element_count, // Количество элементов
        nodes: children,
      })
    }

    return treeData
  } catch (error) {
    throw error
  }
}

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
