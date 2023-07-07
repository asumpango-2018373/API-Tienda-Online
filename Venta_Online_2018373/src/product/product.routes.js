'use strict'

const express = require('express');
const api = express.Router();
const productController = require('./product.controller');
const factureController = require('../facture/facture.controller')
const { ensureAuth, isAdmin } = require('../services/authenticated')

//RUTAS PARA USUARIOS LOGGEADOS
api.put('/addProductCart/:id',[ensureAuth], productController.addProductCart)
api.post('/buy',[ensureAuth], factureController.buy) //ruta para que el usuario cree un carrito de compras

//RUTAS SOLO PARA ADMINS
api.post('/add',[ensureAuth, isAdmin], productController.addProduct)
api.get('/out',[ensureAuth, isAdmin], productController.soldOutProduct)
api.get('/bestSeller',[ensureAuth, isAdmin], productController.bestSeller)
api.put('/update/:id',[ensureAuth, isAdmin], productController.update)
api.delete('/delete/:id',[ensureAuth, isAdmin], productController.delete)

//RUTAS PARA TODO PUBLICO
api.get('/getProduct', productController.getProductByName)
api.get('/getProducts', productController.getProducts)
api.get('/get/:id', productController.getProduct)
api.get('/getProducts/:id', productController.getProductCategory)

module.exports = api;