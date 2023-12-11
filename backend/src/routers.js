const express = require('express')
const router = express.Router()

const loginController = require('./controllers/login')
const toolController = require('./controllers/tool')
const treeController = require('./controllers/tool_tree')
const filterController = require('./controllers/tool_filter')

// Authentication Routes
router.post('/validate-user', loginController.validateUser)
router.get('/database-info', loginController.getDatabaseInfo)

router
  .route('/tool')
  .get(toolController.getToolsWithInventoryInfo)
  .post(toolController.addTool)

router
  .route('/tool/:id')
  .put(toolController.editTool)
  .delete(toolController.deleteTool)

router.get('/tools', filterController.getTools)

router.post('/add-to-warehouse/:id', toolController.addToWarehouse)
router.get('/tool-library', toolController.getLibrary)
router.get('/unique-tool-specs', toolController.getUniqueToolSpecs)

router.get('/tools-params', filterController.getToolParams)

// Добавление и удаление материалов, типов и групп
router.post('/add-material', toolController.addMaterial)
router.post('/add-type', toolController.addType)
router.post('/add-group', toolController.addGroup)
router.delete('/material/:id', toolController.deleteMaterial)
router.delete('/type/:id', toolController.deleteType)
router.delete('/group/:id', toolController.deleteGroup)

router.post('/tools-tree', treeController.addBranch)

// Tree Routes
router.get('/tools-tree', treeController.getToolsTree)

module.exports = router
