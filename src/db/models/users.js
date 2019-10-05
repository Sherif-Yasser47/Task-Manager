const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    age: {
        type: Number,
        required: true,
        validate: (value) => {
            if (value <= 0) {
                throw new Error('Age must be positive')
            }
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate: (value) => {
            if (!validator.isEmail(value)) {
                throw new Error('E-mail is not valid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        lowercase: true
    },
    phone: {
        type: Number,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    profilepic: {
        type: Buffer
    }   
},{
    timestamps: true
})

const User = mongoose.model('User', UserSchema)

module.exports = User;