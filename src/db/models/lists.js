const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const listSchema = new Schema({
    name: {
        type: String,
        required: true,
        default: 'Unnamed',
        trim: true,
        lowercase: true,
        validate: (value) => {
            if (validator.isInt(value) || validator.isDecimal(value)) {
                throw new Error('name must be string')
            }
        }
    },
    userName: {
        type: String,
        required: true,
        ref: 'User'
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
},{
    timestamps: true,
})

listSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'listID',
})

const List = mongoose.model('List', listSchema)

module.exports = List;