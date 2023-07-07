'use strict'

const express = require('express');
const api = express.Router();
const userController = require('./user.controller')
const { ensureAuth, isAdmin } = require('../services/authenticated')

//TEST PARA PROBAR QUE LOS ARCHIVOS ESTEN BIEN CONECTADOS
api.get('/test', [ensureAuth], userController.test)

//RUTAS PARA TODO PUBLICO
api.post('/login', userController.login)
api.post('/register', userController.register)

//RUTAS PARA USUARIOS LOGGEADOS
api.put('/update/:id', [ensureAuth], userController.update)
api.delete('/delete/:id', [ensureAuth], userController.delete)

//RUTAS SOLO PARA ADMINS 
api.post('/save', [ensureAuth, isAdmin], userController.save);
api.put('/updateUser/:id',[ensureAuth, isAdmin], userController.updateUser)
api.delete('/deleteUser/:id',[ensureAuth, isAdmin], userController.deleteUser)

module.exports = api;