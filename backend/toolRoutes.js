// routes/toolRoutes.js
module.exports = function(app) {
  const toolController = require('../controllers/toolController');

  app.route('/tools')
    .get(toolController.list_all_tools)
    .post(toolController.create_a_tool);

  app.route('/tools/:toolId')
    .get(toolController.read_a_tool)
    .put(toolController.update_a_tool)
    .delete(toolController.delete_a_tool);
};
