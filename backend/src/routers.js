const express = require('express');
const router = express.Router();
const controllers = require('./tool/controllers');

router.get('/tools', controllers.getTools);

router.delete('/delete-tool/:id', controllers.deleteTool);

router.put('/edit-tool/:id', controllers.editTool);

router.post('/add-tool', controllers.addTool);

router.post('/add-material', controllers.addMaterial);
router.post('/add-type', controllers.addType);
router.post('/add-group', controllers.addGroup);

module.exports = router;
