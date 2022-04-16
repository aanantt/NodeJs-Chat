const User = require('../Model/user.js')
const jwt = require('jsonwebtoken');

const avatar = require("../utils/randomAvatar.js")

exports.LogIn = (req, res, next) => {
    const { username, password } = req.query
    var token = "";
    User.findOne({ username: username, password: password }).then((user) => {
        token = jwt.sign({ id: user._id }, "secret")
        res.status(200).send({ token: token })
    }).catch((err) => console.log(err))
}

exports.SignUp = (req, res, next) => {
    const { username, password } = req.query
    //always store password's hash not raw password
    User({ username: username, password: password,profile: avatar()}).save().then((_res) => res.status(200).send(_res)).catch((err) => res.status(500).send(err))
}