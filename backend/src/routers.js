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
const reportBuchWeekController = require('./controllers/tool/reports/b_buch_week')
const reportBuchEndOpController = require('./controllers/tool/reports/b_buch_end_op')
const reportBuchMonthController = require('./controllers/tool/reports/b_buch_month')
const reportZakazController = require('./controllers/tool/reports/b_zayav_Instr')

// Аутентификация
router.post('/login', loginController.login)
router.post('/check-login', loginController.checkLogin)
router.get('/database-info', loginController.getDatabaseInfo)

// Tools
router
  .route('/tools')
  .get(nomController.getTools) // GET ALL
  .post(nomController.getTools) // POST ALL

router
  .route('/tool/:id')
  .get(nomController.getToolById) // 1 элемент
  .put(nomController.editTool)
  .delete(nomController.deleteTool)

router.post('/tool', nomController.addTool)

// Params
router
  .route('/tools-params/:parent_id')
  .get(paramController.getFilterParamsParentId)

router
  .route('/tools-params')
  .get(paramController.getToolParams)
  .post(paramController.addToolParam)

router
  .route('/tools-params/:id')
  .put(paramController.updateToolParam)
  .delete(paramController.deleteToolParam)

router.get('/tools-params-name/:id', paramController.getToolNameId)

// Tree
router
  .route('/tools-tree')
  .get(treeController.getToolsTree)
  .post(treeController.addBranch)
  .put(treeController.updateFolderTree)

router.delete('/tools-tree/:id', treeController.dellFolderTree)

// Issue
router.get('/detail/id', issueController.findDetailProduction)
router.get('/operators/fio', issueController.getFioOperators)
router.post('/issue', issueController.issueTool)
router.get('/cnc', issueController.getCncData)

// History
router.route('/history/:id').get(historyController.getToolHistoryId)

router.route('/history').get(historyController.getToolHistory)

router.get('/history-part', historyController.getToolHistoryByPartId)

// Damaged
router.get('/damaged-history', damagedController.getDamaged)
router.post('/tool-history-damaged', damagedController.addToolHistoryDamaged)

// Sklad
router.post('/sklad/update', skladController.updateToolInventory)

// Reports
router.get('/report/genBuchWeek', reportBuchWeekController.genBuchWeek)
router.get('/report/genBuchEndOp', reportBuchEndOpController.checkStatusChanges)
router.get('/report/genBuchMonth', reportBuchMonthController.genBuchMonth)
router.get('/report/genZayavInstr', reportZakazController.genZayavInstr)

module.exports = router
