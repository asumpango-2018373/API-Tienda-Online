'use strict'

const User = require('./user.model');
const Facture = require('../facture/facture.model')
const infoUser = '-_id username phone'
const infoProduct = '-_id name price'
const infoFacture = '-_id -products._id'
const {validateData, encrypt, checkPassword} = require('../utils/validate');
const { createToken } = require('../services/jwt')
 
exports.test = (req, res)=>{
    return res.send({message: 'Text function is running'})
}

exports.register = async(req, res)=>{
    try{
        let data = req.body;
        data.totalCart = 0
        let params = {
            password: data.password
        }
        let existUser = await User.findOne({username: data.username})
        if(existUser) return res.status(400).send({message: 'User already exist'})
        let validate = validateData(params)
        if(validate) return res.status(400).send(validate)
        data.role = 'CLIENT'
        data.password = await encrypt(data.password)
        let user = new User(data);
        await user.save();
        return res.send({message: 'Account created sucessfully'})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error creating account'})
    }
}

exports.save = async(req, res)=>{
    try{
        let data = req.body;
        data.tatalCart = 0
        let params = {
            password: data.password,
            role: data.role
        }
        let existUser = await User.findOne({username: data.username})
        if(existUser) return res.status(400).send({message: 'User already exist'})
        let validate = validateData(params)
        if(validate) return res.status(400).send(validate)
        data.password = await encrypt(data.password)
        let user = new User(data);
        await user.save();
        return res.send({message: 'Account created sucessfully'});
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error saving user'})
    }
}

exports.login = async(req, res)=>{
    try{
        let data = req.body;
        let credentials = {
            username: data.username,
            password: data.password
        }
        let msg = validateData(credentials);
        if(msg) return res.status(400).send(msg)
        let user = await User.findOne({username: data.username});
        if(user && await checkPassword(data.password, user.password)){
            let token = await createToken(user)
            let myFactures = await Facture.find({user: user._id}).populate('user', infoUser).populate('products.product', infoProduct).select(infoFacture)   
            return res.send({message: 'User logged sucessfully', token, myFactures})
        }   
        return res.status(401).send({message: 'Invalid credentials'});
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error login user'})
    }
}

exports.update = async (req, res) => {
    try{
        let data = req.body;
        let userToken = req.user.sub
        if(data.password) return res.send({message: 'Cant update password'}) 
        if(data.role) return res.send({message: 'Cant update role'})
        let userId = req.params.id;
        if(userId !== userToken) return res.send({message: 'You cant update other users'})
        let updateUser = await User.findOneAndUpdate(
            { _id: userId },
            data, 
            { new: true });
        if (!updateUser) return res.status(404).send({ message: 'User not afound and update' });
        return res.send({ updateUser }); 
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error updating user'})
    }
}

exports.delete = async(req, res)=>{
    try{
        let userId = req.params.id;
        let userToken = req.user.sub;
        let existUser = await User.findOne({_id: userId})
        if(!existUser) return res.send({message: 'User does not exist'})

        if(userId !== userToken) return res.send({message: 'You cant delete other users'})

        await User.findOneAndDelete({_id: userId})
        return res.send({message: 'Your user has been deleted'})    
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error eleting user'})
    }
}

exports.updateUser = async(req, res)=>{
    try{
        let data = req.body;
        let userId = req.params.id
        let userToken = req.user.sub
        let existUserId = await User.findOne({_id: userId})
        if(data.password) return res.send({message: 'Could not update passwords'})
        if(data.role && (userId === userToken)) return res.send({message: 'You cant update role'})
        if((existUserId.role === 'ADMIN') && (userId !== userToken)) return res.send({message: 'You cant edit other admins'})
        let updateUser = await User.findOneAndUpdate(
            { _id: userId },
            data, 
            { new: true });
        if (!updateUser) return res.status(404).send({ message: 'User not afound and update' });
        return res.send({ updateUser }); 
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error to update a user'})
    }
}

exports.deleteUser = async(req, res)=>{
    try{
        let userId = req.params.id
        let userToken = req.user.sub
        let existUserId = await User.findOne({_id: userId})
        if((existUserId.role == 'ADMIN') && (userToken !== userId)) return res.send({message: 'Could not deleting an admin'})
        await User.findOneAndDelete({_id: userId})
        res.send({message: 'User deleting succesfully'})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error deleting user'})
    }
}