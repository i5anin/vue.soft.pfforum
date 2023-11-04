const express = require('express');
const routers = express.Router();
const controllers = require('./controllers/tool');

routers.get('/tools', controllers.getTools);

routers.delete('/delete-tool/:id', controllers.deleteTool);

routers.put('/edit-tool/:id', controllers.editTool);

routers.post('/add-tool', controllers.addTool);

routers.post('/add-material', controllers.addMaterial);
routers.post('/add-type', controllers.addType);
routers.post('/add-group', controllers.addGroup);

module.exports = routers;
