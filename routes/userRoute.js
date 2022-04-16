const app = require('express')();
const UserController = require('../controllers/userController.js')

app.get('/login', UserController.LogIn)

app.get("/signup", UserController.SignUp)

module.exports = app