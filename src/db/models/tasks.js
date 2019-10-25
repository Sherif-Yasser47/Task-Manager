const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    description: {
        type: String,
        required: true,
        validate: (value) => {
            if (validator.isInt(value) || validator.isDecimal(value)) {
                throw new Error('Description must be string')
            }
        }
    },
    listID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'List'
    },
    listName: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        required: true
    },
    dueDate: {
        type: Date
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
    img: {
        type: Buffer
    },
    uploads: [{
        upload: {
            type: Buffer
        }
    }]
}, {
    timestamps: true
})

const Task = mongoose.model('Task', TaskSchema)

module.exports = Task;