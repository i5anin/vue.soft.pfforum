const express = require('express')
const router = express.Router()

const loginController = require('./controllers/b_login')
const nomController = require('./controllers/b_tool_nom')
const paramController = require('./controllers/b_tool_param')
const treeController = require('./controllers/b_tool_tree')
const skladController = require('./controllers/b_tool_sklad')
const historyController = require('./controllers/b_tool_history')
const damagedController = require('./controllers/b_tool_damaged')
const issueController = require('./controllers/b_tool_issue')
const reportController = require('./controllers/b_tool_report')
// Маршруты для аутентификации
// router.post('/validate-user', loginController.validateUser)
router.get('/database-info', loginController.getDatabaseInfo)
// nom
router.get('/tool/:id', nomController.getToolById) //1 элемент
router.get('/tools', nomController.getTools) //ALL
router.post('/tool', nomController.addTool)
router.put('/tool/:id', nomController.editTool)
router.delete('/tool/:id', nomController.deleteTool)
// param
router.get('/tools-params', paramController.getToolParams)
router.post('/tools-params', paramController.addToolParam)
router.put('/tools-params/:id', paramController.updateToolParam)
router.delete('/tools-params/:id', paramController.deleteToolParam)
// tree
router.get('/tools-tree', treeController.getToolsTree)
router.post('/tools-tree', treeController.addBranch)
router.put('/tools-tree', treeController.updateFolderTree)
router.delete('/tools-tree/:id', treeController.dellFolderTree)
// issue
router.get('/detail/id', issueController.findDetailProduction)
router.get('/operators/fio', issueController.getFioOperators)
router.post('/issue', issueController.issueTool)
router.get('/cnc', issueController.getCncData)
// history
router.get('/history/:id', historyController.getToolHistoryId)
router.get('/history', historyController.getToolHistory)
router.get('/history-part', historyController.getToolHistoryByPartId)
// damaged
router.get('/damaged-history', damagedController.getDamaged)
router.post('/tool-history-damaged', damagedController.addToolHistoryDamaged)
// sklad
router.post('/sklad/update', skladController.updateToolInventory)
// excel
// router.get('/excel/generateBuchIscSlom', reportController.generateBuchIscSlom)
// router.get('/excel/generateBuchOtchet', reportController.generateBuchOtchetEndOperation)
// router.get('/excel/generateBuchJurnIsp', reportController.generateBuchJurnIspMonth)
router.get('/excel/generateZayavInstr', reportController.generateZayavInstr)

module.exports = router
