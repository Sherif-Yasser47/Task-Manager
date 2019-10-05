const express = require('express');
const User = require('../db/models/users')

const router = express.Router();

//Create Users End-point
router.post('/users', async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            throw new Error('No data are inserted')
        }
        const createdUser = await User.create(req.body)
        await User.save()
        res.status(201).send(createdUser)
    } catch (error) {
        res.status(400).send({error: error.message})
    }
})

module.exports = router;