const express = require('express');
const User = require('../db/models/users')
const auth = require('../middleware/auth');
const router = express.Router();

//Create Users End-point
router.post('/users', async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            throw new Error('No data are inserted')
        }
        await User.checkEmailValidity(req.body.email)
        const createdUser = await User.create(req.body)
        const token = await createdUser.generateAuthToken()
        res.status(201).send({ createdUser, token })
    } catch (error) {
        res.status(400).send({error: error.message})
    }
})

//User Login End-Point
router.post('/users/login', async (req, res) => {
    if (!req.body.email || !req.body.password) {
       return res.status(400).send({ error: 'Email & Password are required' })
    }
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(404).send({error: error.message})
    }
})

//User logout End-Point.
router.post('/users/logout', auth, (req, res) => {
    try {
        let tokenIndex = req.user.tokens.indexOf(req.token)
        req.user.tokens.splice(tokenIndex, 1)
        req.user.save()
        res.send({ message: 'Logged out successfuly. Auth token is now expired' })
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

//User Logout form all devices End-Point.
router.post('/users/logoutAll', auth, (req, res) => {
    try {
        req.user.tokens = []
        req.user.save()
        res.send({ message: 'Logged out successfuly. All auth tokens are now expired' })
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

//Read User Profile End-Point.
router.get('/users/profile', auth, (req, res) => {
    try {
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error.message)
        console.log(error)  
    }
})

module.exports = router;