const jwt = require('jsonwebtoken');
const User = require('../db/models/users');

const auth = async (req, res, next) => {
    try {
        let token
        if (req.query.accesstoken) {
            token = req.query.accesstoken
        } else {
            token = req.header('Authorization').replace('Bearer ', '')
        }
        var decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if (!user) {
            throw new Error()
        }
        req.user = user
        req.token = token
        next();
    } catch (error) {
        res.status(401).send({ error: 'please authenticate properly' })
    }
}

module.exports = auth;