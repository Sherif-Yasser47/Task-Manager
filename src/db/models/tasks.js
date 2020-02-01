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
        default: false
    },
    dueDate: {
        type: Date
    },
    missed: {
        type: Boolean,
        default: false
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
    uploads: [Object]
}, {
    timestamps: true
})

TaskSchema.methods.findMissingStatus = async function () {
    if (Date.now() > this.dueDate.getTime() && this.completed === false) {
        this.missed = true
    }
    await this.save();
    return;
}

const Task = mongoose.model('Task', TaskSchema)

module.exports = Task;