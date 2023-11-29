// tool_tree.js
const { Pool } = require('pg')
const { getNetworkDetails } = require('../db_type')
const config = require('../config')

const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest
// Создание пула подключений к БД
const pool = new Pool(dbConfig)

function buildTree(nodes, parentId = 0) {
  // console.log(`Building tree for parent ID: ${parentId}`) // Добавление логирования
  return nodes
    .filter((node) => node.id_parent === parentId)
    .map((node) => ({
      id: node.id,
      name: node.name,
      children: buildTree(nodes, node.id),
    }))
}

async function getToolsTree(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT id, id_parent, name FROM dbo.tool_tree'
    )
    // console.log('Data from DB:', rows) // Логирование данных из БД
    const tree = buildTree(rows)
    // console.log('Generated Tree:', tree) // Логирование сгенерированного дерева
    res.json(tree)
  } catch (error) {
    console.error(error)
    res.status(500).send(error.message)
  }
}

module.exports = {
  getToolsTree,
}
