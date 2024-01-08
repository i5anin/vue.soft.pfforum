const express = require('express')
const router = express.Router()

const loginController = require('./controllers/b_login')
const nomController = require('./controllers/b_tool_nom')
const paramController = require('./controllers/b_tool_param')
const treeController = require('./controllers/b_tool_tree')
const skladController = require('./controllers/b_tool_sklad')
const operController = require('./controllers/b_tool_oper')

// Маршруты для аутентификации
router.post('/validate-user', loginController.validateUser)
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

// Маршруты для дерева инструментов
router.get('/tools-tree', treeController.getToolsTree)
router.post('/tools-tree', treeController.addBranch)
router.put('/tools-tree', treeController.updateFolderTree)
router.delete('/tools-tree/:id', treeController.dellFolderTree)

router.get('/tools-statuses', treeController.countNomenclatureStatuses)

router.get('/detail/names', operController.getDetailNames)
router.get('/detail/descriptions', operController.getDetailDescriptions)
router.get('/detail/no', operController.getDetailNo)
router.get('/detail/types', operController.getDetailType)

// router.get('/detail/fio', operController.getDetailfio)
// router.get('/detail', operController.getDetail)

router.get('/sklad', skladController.getToolHistory)
// router.post('/sklad', skladController.addSkladItem)
// router.put('/sklad/:id', skladController.updateSkladItem)
// router.delete('/sklad/:id', skladController.deleteSkladItem)

module.exports = router
