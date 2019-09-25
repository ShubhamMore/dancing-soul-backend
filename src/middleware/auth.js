const jwt = require('jsonwebtoken')
const User = require('../model/user.model')

const auth = async (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth