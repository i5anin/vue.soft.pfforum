const express = require('express');
const routers = express.Router();
const controllers = require('./controllers/tool');
const login = require('./controllers/login');

routers.get('/tools', controllers.getTools);
routers.get('/tool-library', controllers.getLibrary);

routers.post('/tool', controllers.addTool);

routers.delete('/tool/:id', controllers.deleteTool);
routers.put('/tool/:id', controllers.editTool);


routers.post('/add-material', controllers.addMaterial);
routers.post('/add-type', controllers.addType);
routers.post('/add-group', controllers.addGroup);

routers.post('/validate-user', login.validateUser);

module.exports = routers;
