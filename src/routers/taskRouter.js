const express = require('express');
const Task = require('../db/models/tasks');
const User = require('../db/models/users')
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

const router = express.Router();

//Creating tasks End-Point.
router.post('/tasks', auth, async (req, res) => {
    try {
        var createdTask;
        if (Object.keys(req.body).length === 0) {
            throw new Error('No data are inserted')
        }
        let arr = [...req.body];
        arr.forEach((task) => {
            task.userID = req.user._id,
                task.userName = req.user.userName
        })
        createdTask = await Task.insertMany(arr)
        res.status(201).send(createdTask)
    }
    catch (error) {
        res.status(400).send({ error: error.message })
    }
})

//User upload profile pic End-Point.
const upload = multer({
    limits: {
        fileSize: 5000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
            cb(new Error('Invalid file type'))
        }
        cb(undefined, true)
    }
})
router.post('/tasks/img/:id', auth, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: 'No image selected' })
    }
    const task = await Task.findOne({ _id: req.params.id, userID: req.user._id })
    if (!task) {
        return res.status(404).send({ error: 'No task found' })
    }
    const imgbuffer = req.file.buffer
    const output = await sharp(imgbuffer).png().resize(200, 200).toBuffer()
    task.img = output
    await task.save()
    res.set('Content-Type', 'image/png')
    res.send(task.img)
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//Reading multiple tasks End-Point.
router.get('/tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ userID: req.user._id })
        if (!tasks.length) {
            return res.status(404).send({ error: 'No tasks found' })
        }
        res.send(tasks)
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
})

//Reading individual task by ID.
router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ userID: req.user._id, _id: req.params.id })
        if (!task) {
            return res.status(404).send({ error: 'No task found' })
        }
        res.send(task)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

//Update task End-Point.
router.patch('/tasks/:id', auth, async (req, res) => {
    let allowedUpdates = ['description', 'completed']
    var userUpdates = Object.keys(req.body)
    if (userUpdates.length === 0) {
        return res.status(400).send({ error: 'No update(s) are provided' })
    }
    let isAllowedUpdate = allowedUpdates.every((update) => allowedUpdates.includes(update))
    if (isAllowedUpdate === false) {
        return res.status(404).send({ error: 'one or more fields are not existed to update' })
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, userID: req.user._id })
        if (!task) {
            throw new Error('No task Found')
        }
        userUpdates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(404).send({ error: error.message })
    }
})

//delete Task img End-Point.
router.delete('/tasks/img/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userID: req.user._id })
        if (!task) {
            throw new Error('No task found')
        }else if (task.img === null || undefined) {
            throw new Error('No image to be deleted')
        }
        task.img = null
        await task.save()
        res.send({ message: 'Task image is deleted successfuly' })
    } catch (error) {
        res.status(404).send({ error: error.message })
    }
})

module.exports = router;