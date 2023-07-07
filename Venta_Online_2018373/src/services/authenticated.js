'use strict'

//Archivo para verificar si el token es valido (expirado, valido)

const jwt = require('jsonwebtoken');
const { findOne } = require('../user/user.model');
const User = require('../user/user.model')

//funcion middleware (barrera logica)
exports.ensureAuth = (req, res, next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({message: 'Doesnt contain header "AUTHORIZATION"'})
    }else{ 
        try{
            //obetener el token
            let token = req.headers.authorization.replace(/['"]+/g, '');
            //Decodificar el token 
            var payload = jwt.decode(token, `${process.env.SECRET_KEY}`)
            //validar que no haya aspirado 
            if(Math.floor(Date.now)/1000 >= payload.exp){
                return res.status(401).send({message: 'Expired token'})
            }
        }catch(err){
            console.error(err)
            return res.status(400).send({message: 'Invalid token'})
        }
        req.user = payload;
        next()
    }
}

exports.isAdmin = async(req, res, next)=>{
    try{
        let user = req.user;
        if(user.role  !== 'ADMIN') return res.status(403).send({message:'Unauthorized user '})
        next()
    }catch(err){
        console.error(err)
        return res.status(403).send({message: 'Unauthorized user'})
    }
}