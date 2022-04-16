const app = require('express')();
const ChatControlller = require('../controllers/chatController.js')
const AuthenticationMiddleware = require('../utils/verifyToken.js')


app.get('/allChats', ChatControlller.AllChats);

app.get('/myChats', AuthenticationMiddleware.authenticationMiddleware, ChatControlller.MyChats);

app.get('/addChat/:userId', AuthenticationMiddleware.authenticationMiddleware, ChatControlller.AddChat);

module.exports = app;