const express = require('express');
const Task = require('../db/models/tasks');
const List = require('../db/models/lists');
const auth = require('../middleware/auth');

const router = express.Router();

//Creating Lists End-point.
router.post('/lists', auth, async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            throw new Error('No data are inserted')
        }
        const createdList = await List.create({
            ...req.body,
            userName: req.user.userName,
            userID: req.user._id
        })
        res.status(201).send({ createdList })
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
})

//Reading list by name End-Point.
router.get('/lists', auth, async (req, res) => {
    if (!req.query.name) {
        return res.status(400).send({ error: 'no list name provided in qs' })
    }
    try {
        const list = await List.findOne({ name: req.query.name, userID: req.user._id })
        if (!list) {
            throw new Error('list is not existed for user')
        }
        await list.populate({
            path: 'tasks',
            select: 'description'
        }).execPopulate()
        res.send({ list, tasksNo: list.tasks.length })
    } catch (error) {
        res.status(404).send({ error: error.message })
    }
})

//Reading list Tasks.
router.get('/lists/tasks', auth, async (req, res) => {
    if (!req.query.name) {
        return res.status(400).send({ error: 'no list name provided in qs' })
    }
    var match = {}
    try {
        if (req.query.completed) {
            match.completed = req.query.completed === 'true'
        }
        const list = await List.findOne({ name: req.query.name, userID: req.user._id })
        if (!list) {
            throw new Error('list is not existed for user')
        }
        await list.populate({
            path: 'tasks',
            match,
            select: 'description completed'
        }).execPopulate()
        res.send({ list, listTasks: list.tasks })
    } catch (error) {
        res.status(404).send({ error: error.message })
    }
})

//Deleting list End-Point.
router.delete('/lists/:id',auth, async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ error: 'No list id is provided' })
    }
    try {
        const deletedList = await List.findOneAndDelete({ _id: req.params.id, userID: req.user._id })
        if (!deletedList) {
            throw new Error('No list found by this id')
        }
        await Task.deleteMany({ listID: deletedList._id })
        res.send({ message: 'deleted successfuly', deletedList })
    } catch (error) {
        res.status(404).send({ error: error.message })
    }
})

module.exports = router;