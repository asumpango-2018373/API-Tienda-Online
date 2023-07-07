'use strict'

const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    cart: [{
        product:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            require: true
        },
        amount:{
            type: Number,
            require: true,
        }
    }],
    totalCart: {
        type: Number,
        require: true
    },
    role: {
        type: String,
        required: true,
        uppercase: true
    }
});
 
module.exports = mongoose.model('User', userSchema);