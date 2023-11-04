const db = require('./db');
const Joi = require('joi');

// ... остальные контроллеры ...

exports.editTool = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, group_id, mat_id, type_id, kolvo_sklad, norma, zakaz, rad } = req.body;

    // Проверка данных с помощью Joi
    const schema = Joi.object({
      name: Joi.string().required(),
      group_id: Joi.number().required(),
      mat_id: Joi.number().required(),
      type_id: Joi.number().required(),
      kolvo_sklad: Joi.number().required(),
      norma: Joi.number().required(),
      zakaz: Joi.number().required(),
      rad: Joi.number().required()
    });
    const { error } = schema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    const result = await db.one(
      'UPDATE dbo.nom SET name=$1, group_id=$2, mat_id=$3, type_id=$4, kolvo_sklad=$5, norma=$6, zakaz=$7, rad=$8 WHERE id=$9 RETURNING *',
      [name, group_id, mat_id, type_id, kolvo_sklad, norma, zakaz, rad, id]
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.addMaterial = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).send('Bad Request: Missing name field');

    const result = await db.one(
      'INSERT INTO dbo.mat_id (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.addType = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).send('Bad Request: Missing name field');

    const result = await db.one(
      'INSERT INTO dbo.type_id (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.addGroup = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).send('Bad Request: Missing name field');

    const result = await db.one(
      'INSERT INTO dbo.group_id (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};
