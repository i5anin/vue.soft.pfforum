const express = require('express')
const router = express.Router()

const loginController = require('./controllers/b_login')
const nomController = require('./controllers/b_tool_nom')
const paramController = require('./controllers/b_tool_param')
const treeController = require('./controllers/b_tool_tree')
const skladController = require('./controllers/b_tool_sklad')
const historyController = require('./controllers/b_tool_history')
const issueController = require('./controllers/b_tool_issue')

// Маршруты для аутентификации
// router.post('/validate-user', loginController.validateUser)
router.get('/database-info', loginController.getDatabaseInfo)

// Маршруты для работы с инструментами
router.get('/tool/:id', nomController.getToolById) //1 элемент
router.get('/tools', nomController.getTools) //ALL
router.post('/tool', nomController.addTool)
router.put('/tool/:id', nomController.editTool)
router.delete('/tool/:id', nomController.deleteTool)

// Маршруты для параметров инструмента
router.get('/tools-params', paramController.getToolParams)
router.post('/tools-params', paramController.addToolParam)
router.put('/tools-params/:id', paramController.updateToolParam)
router.delete('/tools-params/:id', paramController.deleteToolParam)

// tree
router.get('/tools-tree', treeController.getToolsTree)
router.post('/tools-tree', treeController.addBranch)
router.put('/tools-tree', treeController.updateFolderTree)
router.delete('/tools-tree/:id', treeController.dellFolderTree)
//issue
router.get('/detail/id', issueController.findDetailProduction)
router.get('/operators/fio', issueController.getFioOperators)
//history
router.get('/history/:id', historyController.getToolHistoryId)
router.get('/history', historyController.getToolHistory)
router.post('/history', historyController.saveToolHistory)
router.get('/history/part', historyController.getToolHistoryByPartId)
router.get('/test', historyController.getToolTest)
//sklad
router.post('/sklad/update', skladController.updateToolInventory)

module.exports = router
