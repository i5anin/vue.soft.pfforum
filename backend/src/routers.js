const express = require('express')
const routers = express.Router()
const controllers = require('./controllers/tool')
const treeControllers = require('./controllers/tool_tree')
const filterControllers = require('./controllers/tool_filter')

const login = require('./controllers/login')
const { validateUser, getDatabaseInfo } = require('./controllers/login')

// Маршруты аутентификации
routers.post('/validate-user', login.validateUser)
routers.get('/database-info', getDatabaseInfo)

routers.get('/tools', filterControllers.getTools)
routers.get('/tool-library', controllers.getLibrary)
routers.get('/tool-spec', controllers.getToolNomSpec)
routers.get('/unique-tool-specs', controllers.getUniqueToolSpecs)

// Инвентаризация и управление инструментами
routers.get('/tools-inventory', controllers.getToolsWithInventoryInfo)
routers.post('/tool', controllers.addTool)
routers.put('/tool/:id', controllers.editTool)
routers.delete('/tool/:id', controllers.deleteTool)

// СКЛАД Добавление инструмента на склад с параметрами zakaz, norma, kolvo_sklad
routers.post('/add-to-warehouse/:id', controllers.addToWarehouse)

// FIXME: DELETE
// РЕСУРСЫ Дополнительные ресурсы, связанные с инструментами
routers.post('/add-material', controllers.addMaterial)
routers.post('/add-type', controllers.addType)
routers.post('/add-group', controllers.addGroup)
routers.delete('/material/:id', controllers.deleteMaterial)
routers.delete('/type/:id', controllers.deleteType)
routers.delete('/group/:id', controllers.deleteGroup)

// Маршрут для получения параметров инструментов
routers.get('/tools-params', filterControllers.getToolParams)

routers.get('/tools-tree', treeControllers.getToolsTree)

module.exports = routers
