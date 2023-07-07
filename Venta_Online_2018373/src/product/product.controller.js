'use strict'

const Product = require('../product/product.model')
const Category = require('../category/category.model')
const User = require('../user/user.model')
const { find } = require('../product/product.model')

exports.addProduct = async(req, res)=>{
    try{
        let data = req.body
        let productExist = await Product.findOne({name: data.name})
        if(productExist) return res.status(400).send({message: 'Product already created'})
        let categoryExist = await Category.findOne({_id: data.category})
        if(!categoryExist) return res.status(404).send({message: 'Category not found'})
        let product = new Product(data)
        await product.save()
        return res.send({message: 'Product saved succesfully'})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error saving product'})
    }
}

exports.addProductCart = async(req, res)=>{
    try{
        let userId = req.user.sub
        let productId = req.params.id
        let amountProduct = 0
        let total = 0
        let product = await Product.findOne({_id: productId})
        let user = await User.findOne({_id: userId})
        let totalCart = user.totalCart

        if(!product) return res.status(404).send({message: 'Product not found'}) 
        let existProductCart = await User.findOne({_id: userId,"cart.product": productId});
        if(existProductCart){
            let cart = existProductCart.cart
            for(let productCart of cart){
                if(productCart.product = productId){         
                    amountProduct = productCart.amount
                }
            }
            amountProduct = amountProduct + 1
            let updateCart =  await User.updateOne(
                { _id: userId, 'cart.product': productId },
                { $set: { 'cart.$.amount': amountProduct } },
            )
            total = totalCart + product.price
            let updateUser = await User.findOneAndUpdate({_id: userId},{totalCart: total})
            let cartNew = updateUser.cart
            if(!updateCart) return res.status(400).send({message: 'Could not save the product in the cart'})
            return res.send({message: 'Product saved in the cart succesfully', cartNew})
        }
        let cart = await User.updateOne(
            {_id: userId},
            {$push: {cart: {product: productId, amount: 1}}},
        )
        total = totalCart + product.price
        await User.findOneAndUpdate({_id: userId},{totalCart: total})
        if(!cart) return res.status(400).send({message: 'Coul not save the product in the cart'})
        return res.send({message: 'Product saved succesfully in the cart'})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error adding a product in the cart'})
    }
}

exports.getProducts = async(req, res)=>{
    try{
        let products = await Product.find().populate('category')
        res.send({message: products})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting products'})
    }
}

exports.getProductCategory = async(req, res)=>{
    try{
        let category = req.params.id
        let existCategory = await Category.findOne({_id: category})
        if(!existCategory) return res.status(404).send({message: 'Category not found'})
        let products = await Product.find({category: category})
        return res.send({message: products})        
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting products by category'})
    }
}

exports.getProduct = async(req,res)=>{
    try{
        let productId = req.params.id
        let productExist = await Product.findOne({_id: productId})
        if(!productExist) return res.status(404).send({message: 'Product not found'})
        res.send({message: productExist})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting products'})
    }
}

exports.getProductByName = async(req, res)=>{
    try{
        let data = req.body
        let existProduct = await Product.findOne({name: data.name})
        if(!existProduct) return res.status(404).send({message: 'Product not found'})
        return res.send({message: existProduct})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting products by name'})
    }
}

exports.update = async(req, res)=>{
    try{
        let productId = req.params.id
        let data = req.body
        let productExist = await Product.findOne({name: data.name, price: data.price, stock: data.stock, sales: data.sales, category: data.category})
        if(productExist) return res.status(400).send({message: 'Product already created'})
        let categoryExist = await Category.findOne({_id: data.category})
        if(!categoryExist) return res.status(404).send({message: 'Category not found'})
        let updatedProduct = await Product.findOneAndUpdate(
            {_id: productId},
            data,
            {new: true}
        ).populate('category')
        if(!updatedProduct) return res.status(400).send({message: 'Could not updating product'})
        return res.send({message: updatedProduct})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error updating product'})
    }
}

exports.soldOutProduct = async(req, res)=>{
    try{
        let product = await Product.find({stock: 0}).populate('category')
        res.send({message: product})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Erro getting products sold out'})
    }
}

exports.bestSeller = async(req, res)=>{
    try{
        let products = await Product.find().sort({sales: -1})
        res.send({message: products})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting products best sellers'})
    }
}

exports.delete = async(req, res)=>{
    try{
        let productId = req.params.id
        let deleteProduct = await Product.findOneAndDelete({_id: productId})
        if(!deleteProduct) return  res.status(404).send({message:'Product not found'})
        return res.send({message: 'Product deleted succesfully'})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error deleting product'})
    }
}