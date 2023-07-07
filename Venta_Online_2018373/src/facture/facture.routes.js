'use strict'

const express = require('express')
const api = express.Router()
const factureController = require('./facture.controller')
const { ensureAuth, isAdmin} = require('../services/authenticated')

//RUTAS PARA ADMINS
api.get('/getFactures/:id', [ensureAuth, isAdmin], factureController.getFactures)
api.get('/products/:id', [ensureAuth, isAdmin], factureController.factureProducts)
api.put('/update/:id', [ensureAuth, isAdmin], factureController.update)
api.put('/deleteProduct/:id', [ensureAuth, isAdmin], factureController.deleteProduct)
api.get('/printFacture/:id',[ensureAuth, isAdmin], factureController.printFacture);

module.exports = api;