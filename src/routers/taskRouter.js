const express = require('express');
const Task = require('../db/models/tasks');
const List = require('../db/models/lists')
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const router = express.Router();

//Creating tasks End-Point.
router.post('/tasks', auth, async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            throw new Error('No data are inserted')
        }
        var list = await List.findOne({ name: req.body.listName, userID: req.user._id })
        if (!list) {
            throw new Error('list is not existed')
        }
        const createdTask = new Task({
            ...req.body,
            userID: req.user._id,
            userName: req.user.userName,
            listID: list._id
        })
        var taskDueDate = createdTask.dueDate = new Date()
        if (req.query.dueDate === 'today') {
            taskDueDate.setUTCHours(23,59,59,999)
        }else if (req.query.dueDate === 'tomorrow') {
            taskDueDate.setUTCDate(createdTask.dueDate.getUTCDate() + 1)
            taskDueDate.setUTCHours(23,59,59,999)
        }
        req.user.tasksNo += 1
        await createdTask.save()
        await req.user.save()
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

//Uploading files to task.
var fileUpload = multer({
    dest: 'uploads',
    limits: {
        fileSize: 5000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(pdf|docx|doc|txt)$/i)) {
            cb(new Error('Invalid file type'))
        }
        cb(undefined, true)
    }
})
router.post('/tasks/upload/:id', auth, fileUpload.single('file'), async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ error: 'No task id provided' })
    }
    if (!req.file) {
        return res.status(400).send({ error: 'No file selected' })
    }
    const task = await Task.findOne({_id: req.params.id, userID: req.user._id})
    if (!task) {
        return res.status(404).send({ error: 'No task found' })
    }
    task.uploads.push(req.file)
    await task.save()
    res.send({ message: 'Uploaded successfuly', file: req.file })
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//Get all user tasks.
router.get('/tasks', auth, async (req, res) => {
    var match = {};
    var sort = {};
    try {
        if (req.query.completed) {
            match.completed = req.query.completed === 'true'
        }
        if (req.query.sortBy) {
            var sortOrder = req.query.sortBy.split(':')[1]
            sort.createdAt = (sortOrder === 'asc') ? 1 : -1
        }
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        if (!req.user.tasks.length) {
            return res.status(404).send({ error: 'No tasks found' })
        }
        res.send(req.user.tasks)
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

router.get('/tasks/img/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userID: req.user._id })
        if (!task) {
            throw new Error('No task found')
        } else if (task.img === undefined || null) {
            throw new Error('No image found for this task')
        }
        res.set('Content-Type', 'image/png')
        res.send(task.img)
    } catch (error) {
        res.status(404).send({error: error.message})
    }
})

//Get task specified uploaded file.
router.get('/tasks/upload/:id', auth, async (req, res) => {
    if (!req.params.id || !req.query.fileName) {
        return res.status(400).send({ error: 'No task id or file name are provided' })
    }
    try {
        const task = await Task.findOne({_id: req.params.id, userID: req.user._id})
        if (!task) {
            throw new Error('No task found')
        }
        let desiredFile = task.uploads.find((upload) => {
            return upload.filename === req.query.fileName
        })
        if (!desiredFile) {
            throw new Error('No file found')
        }
        let filePath = path.join(__dirname, `../../uploads/${desiredFile.filename}`)
        res.set('Content-Type', desiredFile.mimetype)
        res.sendFile(filePath)
    } catch (error) {
        res.status(404).send({ error: error.message })
        console.log(error);
    }
})

//Update task End-Point.
router.patch('/tasks/:id', auth, async (req, res) => {
    let allowedUpdates = ['description', 'completed']
    var userUpdates = Object.keys(req.body)
    if (userUpdates.length === 0) {
        return res.status(400).send({ error: 'No update(s) are provided' })
    }
    let isAllowedUpdate = userUpdates.every((update) => allowedUpdates.includes(update))
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

//Deleting Task End-Point.
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        var _id = req.params.id
        const task = await Task.findOneAndDelete({ _id, userID: req.user._id })
        if (!task) {
            return res.status(404).send({ message: 'No task found by this ID' })
        }
        req.user.tasksNo -= 1
        await req.user.save()
        res.send({ message: 'deleted successfuly', deletedTask: task })
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
})

//delete Task img End-Point.
router.delete('/tasks/img/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userID: req.user._id })
        if (!task) {
            throw new Error('No task found')
        } else if (task.img === null || undefined) {
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