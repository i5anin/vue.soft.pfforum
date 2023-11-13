const express = require('express');
const routers = express.Router();
const controllers = require('./controllers/tool');
const login = require('./controllers/login');
const { validateUser, getDatabaseInfo } = require('./controllers/login')

routers.get('/tools', controllers.getTools);

routers.get('/tool-library', controllers.getLibrary);
routers.get('/tool-spec', controllers.getToolNomSpec);

routers.post('/tool', controllers.addTool);

routers.delete('/tool/:id', controllers.deleteTool);
routers.put('/tool/:id', controllers.editTool);


routers.post('/add-material', controllers.addMaterial);
routers.post('/add-type', controllers.addType);
routers.post('/add-group', controllers.addGroup);

routers.post('/validate-user', login.validateUser);

routers.post('/validate-user', validateUser);
routers.get('/database-info', getDatabaseInfo);


module.exports = routers;
