// routers.js

const express = require('express')
const router = express.Router()

const loginController = require('./controllers/login/LoginController')
const nomController = require('./controllers/tool/main/NomController')
const paramController = require('./controllers/tool/main/ParamController')
const treeController = require('./controllers/tool/main/TreeController')
const skladController = require('./controllers/tool/SkladController')

const historyController = require('./controllers/tool/HistoryIssueController')
const historyControllerModal = require('./controllers/tool/HistoryIssueModalController')

const damagedController = require('./controllers/tool/HistoryDamagedController')
const issueController = require('./controllers/tool/IssueController')

const reportBuchWeekController = require('./controllers/tool/reports/email/BuchWeekController')
const reportBuchEndPartController = require('./controllers/tool/reports/email/BuchEndPartController')
const reportBuchMonthController = require('./controllers/tool/reports/email/BuchMonthController')
const reportZakazController = require('./controllers/tool/reports/email/OrderToolsController')
const reportRevisionController = require('./controllers/tool/reports/email/RevisionToolsController')

const reportVueZakazController = require('./controllers/tool/reports/vue/OrderToolsController')
const reportVueBuhController = require('./controllers/tool/reports/vue/BuchWeekController')
const reportVueBuchEndPartController = require('./controllers/tool/reports/vue/BuchEndPartController')


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
router.get('/detail/id', issueController.findDetailProduction)
router.get('/operators/fio', issueController.getFioOperators)

router.get('/issue/cancel-operation-admin/:id', issueController.cancelOperationAdmin) // отмена любой
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
router.post('/history-add-archive', historyControllerModal.addToArchive)
router.get(
  '/history-part/info',
  historyControllerModal.getToolHistoryByPartIdInfo
)

// damaged
router.get('/damaged-history', damagedController.getDamaged)
router.post('/tool-history-damaged', damagedController.addToolHistoryDamaged)

// sklad
router.post('/sklad/update', skladController.updateToolInventory)

// email report
router.get('/report/buch-week', reportBuchWeekController.genBuchWeek) // бухгалтерию исключен сломанный	раз в неделю каждый ПТ в 12:00 (за неделю)
router.get('/report/buch-end-op', reportBuchEndPartController.checkStatusChanges) // бухгалтерию	по завершению операции
router.get('/report/buch-month', reportBuchMonthController.genBuchMonth) // бухгалтерию журнал уничтоженного	раз в месяц каждый ПТ в 12:00 (за месяц)

router.get('/report/zayav-instr', reportZakazController.genZayavInstr) // заявка на инструмент	раз в неделю каждый ЧТ в 12:00 (за неделю)
router.get('/report/revision-instr', reportRevisionController.genRevisionInstr) // заявка на инструмент	раз в неделю каждый ЧТ в 12:00 (за неделю)

//vue
router.get('/report/getBuchWeek', reportVueBuhController.getTableReportData) // бухгалтерию исключен сломанный	раз в неделю каждый ПТ в 12:00 (за неделю)
router.get('/report/get-zakaz', reportVueZakazController.getTableReportData) // заявка на инструмент	раз в неделю каждый ЧТ в 12:00 (за неделю)
router.get('/report/get-end-part', reportVueBuchEndPartController.getTableReportData) // заявка на инструмент	раз в неделю каждый ЧТ в 12:00 (за неделю)

module.exports = router
