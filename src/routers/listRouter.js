const express = require('express');
const Task = require('../db/models/tasks');
const List = require('../db/models/lists')
const auth = require('../middleware/auth');

const router = express.Router();

//Creating Lists End-point.
router.post('/lists', auth, async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            throw new Error('No data are inserted')
        }
        await List.checkDuplicateList(req.body.name)
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

module.exports = router;