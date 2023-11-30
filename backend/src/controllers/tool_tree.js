// tool_tree.js
const { Pool } = require('pg')
const { getNetworkDetails } = require('../db_type')
const config = require('../config')

const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest
// Create a connection pool to the database
const pool = new Pool(dbConfig)

async function buildTreeData(parentId = 0) {
  try {
    const { rows } = await pool.query(
      'SELECT id, id_parent, name FROM dbo.tool_tree WHERE id_parent = $1',
      [parentId]
    )

    const treeData = []
    for (const row of rows) {
      const children = await buildTreeData(row.id)
      treeData.push({
        // id: row.id,
        label: row.name,
        child: children,
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
