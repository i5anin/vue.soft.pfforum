const express = require('express')
const router = express.Router()

const loginController = require('./controllers/login/b_login')
const nomController = require('./controllers/tool/main/b_nom')
const paramController = require('./controllers/tool/main/b_param')
const treeController = require('./controllers/tool/main/b_tree')
const skladController = require('./controllers/tool/b_sklad')
const historyController = require('./controllers/tool/b_history_issue')
const damagedController = require('./controllers/tool/b_history_damaged')
const issueController = require('./controllers/tool/b_issue')

const reportBuchWeekController = require('./controllers/tool/reports/email/b_buch_week')
const reportBuchEndOpController = require('./controllers/tool/reports/email/b_buch_end_op')
const reportBuchMonthController = require('./controllers/tool/reports/email/b_buch_month')
const reportZakazController = require('./controllers/tool/reports/email/b_order_Instr')
const reportVueZakazController = require('./controllers/tool/reports/vue/b_order_Instr')

const excelZakazController = require('./controllers/tool/reports/excel/b_order_Instr')

// Маршруты для аутентификации
router.post('/login', loginController.login)
router.post('/check-login', loginController.checkLogin)

router.get('/database-info', loginController.getDatabaseInfo)
// nom
router.get('/tool/:id', nomController.getToolById) //1 элемент
router.get('/tools', nomController.getTools) //GET ALL
router.post('/tools', nomController.getTools) //POST ALL
router.post('/tool', nomController.addTool)
router.put('/tool/:id', nomController.editTool)
router.delete('/tool/:id', nomController.deleteTool)
router.get('/filter-params/:parent_id', nomController.getFilterParamsByParentId)

// param
router.get('/tools-params', paramController.getToolParams)
router.get('/tools-params/:id', paramController.getToolParamsParentId)
router.post('/tools-params', paramController.addToolParam)
router.put('/tools-params/:id', paramController.updateToolParam)
router.delete('/tools-params/:id', paramController.deleteToolParam)
router.get('/tools-params-name/:id', paramController.getToolNameId)

// tree
router.get('/tools-tree', treeController.getToolsTree)
router.post('/tools-tree', treeController.addBranch)
router.put('/tools-tree', treeController.updateFolderTree)
router.delete('/tools-tree/:id', treeController.dellFolderTree)

// issue
router.get('/detail/id', issueController.findDetailProduction)
router.get('/operators/fio', issueController.getFioOperators)
router.post('/issue', issueController.issueTool)
router.post('/issues', issueController.issueTools)
router.get('/cnc', issueController.getCncData)

// history
router.get('/history/:id', historyController.getToolHistoryId)
router.get('/history', historyController.getToolHistory)
router.get('/history-part', historyController.getToolHistoryByPartId)
router.get('/history-part-old', historyController.getToolHistoryByPartOld)

// damaged
router.get('/damaged-history', damagedController.getDamaged)
router.post('/tool-history-damaged', damagedController.addToolHistoryDamaged)

// sklad
router.post('/sklad/update', skladController.updateToolInventory)

// email report
router.get('/report/genBuchWeek', reportBuchWeekController.genBuchWeek) // бухгалтерию исключен сломанный	раз в неделю каждый ПТ в 12:00 (за неделю)
router.get('/report/genBuchEndOp', reportBuchEndOpController.checkStatusChanges) // бухгалтерию	по завершению операции
router.get('/report/genBuchMonth', reportBuchMonthController.genBuchMonth) // бухгалтерию журнал уничтоженого	раз в месяц каждый ПТ в 12:00 (за месяц)

router.get('/report/genZayavInstr', reportZakazController.genZayavInstr) // заявка на инструмент	раз в неделю каждый ЧТ в 12:00 (за неделю)

//vue
router.get('/report/getZakaz', reportVueZakazController.getTableReportData) // заявка на инструмент	раз в неделю каждый ЧТ в 12:00 (за неделю)

// excel report
router.get(
  '/report/genZayavInstrExcel',
  excelZakazController.createExcelFileStream
) // заявка на инструмент	раз в неделю каждый ЧТ в 12:00 (за неделю)

module.exports = router
