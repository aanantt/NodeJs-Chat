const app = require('express')();
const MessageController = require('../controllers/messageController.js')
const AuthenticationMiddleware = require('../utils/verifyToken.js')

app.get('/chats/:id', AuthenticationMiddleware.authenticationMiddleware, MessageController.GetMessages);

module.exports = app;