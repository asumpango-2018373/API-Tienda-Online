'use strict'

const express = require('express') 
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const app = express();
const port = process.env.PORT || 3200;

//ROUTES
const userRoutes = require('../src/user/user.routes');
const categoryRoutes = require('../src/category/category.routes');
const productRoutes = require('../src/product/product.routes');
const categoryController = require('../src/category/category.controller');
const factureRoutes = require('../src/facture/facture.routes')

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use('/user', userRoutes);
app.use('/category', categoryRoutes);
app.use('/product', productRoutes);
app.use('/facture', factureRoutes)

exports.initServer = ()=>{
    categoryController.defaultCategory()
    app.listen(port)
    console.log(`Server http running in port ${port}`);
}