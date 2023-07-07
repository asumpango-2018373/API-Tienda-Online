'use strict'

const PDFDocument = require('pdfkit');
const fs = require('fs');
const User = require('../user/user.model')
const Facture = require('./facture.model')
const Product = require('../product/product.model')
const infoUser = '-_id username phone'
const infoProduct = '-_id name price'
const infoFacture = '-_id -products._id'
const {validateData} = require('../utils/validate')

exports.buy = async(req, res)=>{
    try{
        let userId = req.user.sub
        let user = await User.findOne({_id: userId})
        let cart = user.cart
        for(let productCart of cart){
            let existStock = await Product.findOne({_id: productCart.product})
            if(existStock.stock < productCart.amount) return res.send({message:  productCart.product +': no stock found for this product'})
        }
        for(let productCart of cart){
            let product = await Product.findOne({_id: productCart.product})
            let stock = product.stock - productCart.amount
            let updateStock = await Product.findOneAndUpdate({_id: productCart.product},{stock: stock})
        }
        let data = req.body
        let params = {
            user: userId,
            NIT: data.NIT,
            products: user.cart,
            date: Date.now(),
            total: user.totalCart
        }
        let facture = new Facture(params)
        let newFacture = await facture.save()
        //EN ESTA VARIABLE CUANDO QUERIA POPULAR ME DABA UN ERROR CUANDO SEPARABA CADA POPULATE CON ENTER'S
        //PERO COLOCANDOLO TOOD EN LA MISMA LINEA SE QUITABA EL ERROR
        let myFacture = await Facture.findById({_id: newFacture._id}).populate('user', infoUser).populate('products.product', infoProduct).select(infoFacture)
        let totalCart = 0, cartVacio = []
        await User.findOneAndUpdate({_id: userId},{ totalCart: totalCart, cart: cartVacio },{new: true})

        return res.send({message:'Thank for you purchase', myFacture: myFacture})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error buying'})
    }
}

exports.getFactures = async(req, res)=>{
    try{
        let userId = req.params.id;
        let myFactures = await Facture.find({user: userId}).populate('user', infoUser).populate('products.product', infoProduct).select(infoFacture)
        if(!myFactures) return res.send({message: 'User not found or you not having factures'})
        return res.send({message: 'Your factures', myFactures: myFactures})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting factures'})
    }
}

exports.factureProducts = async(req, res)=>{
    try{
        
        let factureId = req.params.id
        let facture = await Facture.findOne({_id: factureId}).populate('products.product', '-stock -sales').select('-user -NIT -date -products._id')
            console.log(facture.products)
        return res.send({message: facture})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error searching products of the facture'})
    }
}

exports.update = async(req, res)=>{
    try{
        let factureId = req.params.id
        let data = req.body
        let amount = 0
        let total = 0
        let params = {
            password: data.product,
            role: data.amount
        }
        let validate = validateData(params)
        if(validate) return res.status(400).send(validate)
        let facture = await Facture.findOne({_id: factureId, "products.product": data.product})
        if(!facture) return res.send({message: 'The product is not on the invoice'}) 
        let product = await Product.findOne({_id: data.product})
        for(let product of facture.products){
            if(product.product == data.product) amount = product.amount
        }
        //VALIDACION DE STOCK
        if(data.amount > amount) total = product.stock - (data.amount - amount)
        if(data.amount < amount) total = product.stock + (amount - data.amount)
        if(data.amount == amount) total = product.stock
        let updateFacture = await Facture.findOneAndUpdate(
            {_id: factureId},
            {$set: {products: {amount: data.amount, product: data.product}}},
            {new: true}
        )
        let updateStock = await Product.findOneAndUpdate(
            {_id: data.product},
            {stock: total},
            {new: true}
        ).select('stock')
        return res.send({message: updateFacture, updateStock})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error updating facture'})
    }
}

exports.deleteProduct = async(req, res)=>{
    try{ 
        let factureId = req.params.id
        let productId = req.body.product
        let amount = 0
        let total = 0
        let facture = await Facture.findOne({_id: factureId, "products.product": productId},{new: true})
        if(!facture) return res.send({message: 'The product or facture not found'}) 
        let product = await Product.findOne({_id: productId})
        let newFacture = await Facture.findById({_id: factureId})
        for(let product of newFacture.products){
            if(product.product == productId) amount = product.amount
        }
        total = product.stock + amount
        await Facture.updateOne(
            {_id: factureId},
            {$pull: { products: {product: productId}}},
        )
        let stock = await Product.findOneAndUpdate(
            {_id: productId},
            {stock: total},
            {new: true}
        ).select('stock')
        return res.send({message:'Product removing succesfully'})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error removing the product from the facture'})
    }
}


exports.printFacture = async(req, res)=>{
    try{
        let facturaId = req.params.id
        let facture = await Facture.findOne({_id: facturaId})
        let user = await User.findOne({_id: facture.user})

        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };
        const date = facture.date.toLocaleString('es-ES', options);
        const doc = new PDFDocument()
        doc.pipe(fs.createWriteStream(`factures/Factura-${facture._id}.pdf`))

        doc.fontSize(25).text(`Factura`, { align: 'center' });
        doc.fontSize(18).text(`Usuario: ${user.name + ' ' +user.surname}`);
        doc.fontSize(18).text(`NIT: ${facture.NIT}`);
        doc.fontSize(18).text(`Fecha: ${date}`);
        doc.moveDown();
        doc.fontSize(18).text('Productos:');

        for(let productFacture of facture.products){
            let product = await Product.findOne({_id: productFacture.product})

            doc.fontSize(14).text(`- ${product.name} Q.${product.price}.00`);

        }
        doc.moveDown();
        doc.fontSize(18).text(`Total: ${facture.total}`);
        doc.end();
        return res.send({message: 'Your facture is printing', facture})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error print facture'})
    }
}