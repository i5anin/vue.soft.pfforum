// routers.js

const express = require('express')
const router = express.Router()

const loginController = require('./controllers/login/LoginController')
const nomController = require('./controllers/tool/main/NomController')
const paramController = require('./controllers/tool/main/ParamController')
const treeController = require('./controllers/tool/main/TreeController')

const historyController = require('./controllers/tool/HistoryIssueController')
const historyControllerModal = require('./controllers/tool/HistoryIssueModalController')

const damagedController = require('./controllers/tool/HistoryDamagedController')
const issueController = require('./controllers/tool/IssueController')

const reportBuchEndPartController = require('./controllers/tool/reports/email/BuchEndPartController')
const reportZakazController = require('./controllers/tool/reports/email/OrderToolsController')
const reportRevisionController = require('./controllers/tool/reports/email/RevisionToolsController')

const reportVueZakazController = require('./controllers/tool/reports/vue/OrderToolsController')
const reportVueBuhController = require('./controllers/tool/reports/vue/BuchWeekController')

const groupsController = require('./controllers/tool/main/GroupController')

// const excelZakazController = require('./controllers/tool/reports/excel/b_order_Instr')

// Маршруты для аутентификации
router.post('/login', loginController.login)
router.post('/check-login', loginController.checkLogin)

router.get('/database-info', loginController.getDatabaseInfo)
// nom
router.get('/tool/:id', nomController.getToolById) //1 элемент
router.get('/tools', nomController.getTools)
// router.post('/tools', nomController.getTools) //POST ALL
router.post('/tool', nomController.addTool)
router.put('/tool/:id', nomController.editTool)
router.delete('/tool/:id', nomController.deleteTool)
router.get('/filter-params/:parent_id', nomController.getFilterParamsByParentId)

// param
router.get('/tools-params', paramController.getToolParams)

router.post('/tools-params', paramController.addToolParam)
router.put('/tools-params/:id', paramController.updateToolParam)
router.delete('/tools-params/:id', paramController.deleteToolParam)
router.patch('/tools-params/:id/move', paramController.moveToolParam)

// tree
router.get('/tools-tree', treeController.getToolsTree)
router.post('/tools-tree', treeController.addBranch)
router.put('/tools-tree', treeController.updateFolderTree)
router.delete('/tools-tree/:id', treeController.dellFolderTree)

// issue
router.get('/operators/fio', issueController.getFioOperators)

router.get(
  '/issue/cancel-operation-admin/:id',
  issueController.cancelOperationAdmin,
) // отмена любой
router.post('/issue/cancel-operation/:id', issueController.cancelOperation) //отмена 3 дня

router.post('/issue', issueController.issueTool)
router.post('/issues', issueController.issueTools)
router.get('/cnc', issueController.getCncData)

// history
router.get('/history/:id', historyController.getToolHistoryId)
router.get('/history', historyController.getToolHistory)
router.get('/history-all-tool', historyController.getAllIssuedToolIdsWithNames)
router.get('/tool-movement/:id', historyController.getToolMovementById)

//groups
router.get('/tools-groups', groupsController.getGroupedTools)

router.get('/history-part', historyControllerModal.getToolHistoryByPartId)

//Modal архив истории информация о
router.get(
  '/history-part/info',
  historyControllerModal.getToolHistoryByPartIdInfo,
)
//Modal архив истории выдачи
router.post('/history-add-archive', historyControllerModal.addToArchive)

// damaged
router.get('/damaged-history', damagedController.getDamaged)
router.post('/tool-history-damaged', damagedController.addToolHistoryDamaged)

// email report
router.get('/report/zayav-instr', reportZakazController.genZayavInstr) // заявка на инструмент	раз в неделю каждый ЧТ в 12:00 (за неделю)
router.get('/report/revision-instr', reportRevisionController.genRevisionInstr) // заявка на инструмент	раз в неделю каждый ЧТ в 12:00 (за неделю)
// email report Buch
router.get('/report/buch-end-op', reportBuchEndPartController.checkStatusChanges) //в режиме CRON

//vue
router.get('/report/get-zakaz', reportVueZakazController.getTableReportData) // заявка на инструмент	раз в неделю каждый ЧТ в 12:00 (за неделю)
router.get('/report/getBuchWeek', reportVueBuhController.getTableReportData) //❓ бухгалтерию исключен сломанный	раз в неделю каждый ПТ в 12:00 (за неделю)

module.exports = router
