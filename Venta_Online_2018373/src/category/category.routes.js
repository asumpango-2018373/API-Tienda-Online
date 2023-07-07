'use strict'

const express = require('express');
const api = express.Router();
const categoryController = require('./category.controller');
const { ensureAuth, isAdmin } = require('../services/authenticated')

//RUTA PARA TODO PUBLICO
api.get('/get', categoryController.getCategories);
api.get('/get/:id', categoryController.getCategory);

//RUTAS SOLO PARA ADMINS
api.post('/add', [ensureAuth, isAdmin], categoryController.addCategory);
api.put('/update/:id', [ensureAuth, isAdmin], categoryController.updateCategory);
api.delete('/delete/:id', [ensureAuth, isAdmin], categoryController.deleteCategory);


module.exports = api;