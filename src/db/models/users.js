const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const userSchema = new Schema({
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
        type: String,
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

userSchema.methods.toJSON = function () {
    const user = this.toObject()
    delete user.password
    delete user.tokens

    return user;
}

//Checking email validity.
userSchema.statics.checkEmailValidity = async function (email) {
    const existingUser = await this.findOne({ email })
    if (existingUser) {
        return { error: 'Email is already taken' }
    }
    return{};
}

//Generating Authentication tokens for users.
userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({_id: this._id.toString()}, process.env.JWT_SECRET_KEY)
    this.tokens.push({ token })
    await this.save()

    return token
}

//Finding User by Credentials
userSchema.statics.findByCredentials = async function (email, password) {
    const user = await User.findOne({})
}

//Hashing user password before saving.
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User;