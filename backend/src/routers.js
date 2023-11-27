const express = require('express');
const routers = express.Router();
const controllers = require('./controllers/tool');
const login = require('./controllers/login');
const { validateUser, getDatabaseInfo } = require('./controllers/login');

// Маршруты аутентификации
routers.post('/validate-user', login.validateUser);
routers.get('/database-info', getDatabaseInfo);

// login, pass ---> access_token, refresh_token.
// access_token 1 раз в 5 минут обновляется.
// refresh_token 1 раз в 24 часа.
// get|post 'user/auth' - авторизация.
// post 'user/registration' - добавить пользователя в бд.

// owner - 1
// head - 2
// hr - 3
// Инструментальные маршруты
// Основные сведения об инструменте
routers.get('/tools', controllers.getTools);
routers.get('/tool-library', controllers.getLibrary);
routers.get('/tool-spec', controllers.getToolNomSpec);
routers.get('/unique-tool-specs', controllers.getUniqueToolSpecs);

// Инвентаризация и управление инструментами
routers.get('/tools-inventory', controllers.getToolsWithInventoryInfo);
routers.post('/tool', controllers.addTool);
routers.put('/tool/:id', controllers.editTool);
routers.delete('/tool/:id', controllers.deleteTool);

// Добавление инструмента на склад с параметрами zakaz, norma, kolvo_sklad
routers.post('/add-to-warehouse/:id', controllers.addToWarehouse);

// Дополнительные ресурсы, связанные с инструментами
routers.post('/add-material', controllers.addMaterial);
routers.post('/add-type', controllers.addType);
routers.post('/add-group', controllers.addGroup);
routers.delete('/material/:id', controllers.deleteMaterial);
routers.delete('/type/:id', controllers.deleteType);
routers.delete('/group/:id', controllers.deleteGroup);

module.exports = routers;
