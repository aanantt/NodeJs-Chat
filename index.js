var express = require('express')();
const messages = require('./routes/messageRoute.js')
const chats = require('./routes/chatRoute.js')
const user = require('./routes/userRoute.js')
const server = express.listen(8080);
const verifyToken = require("./utils/verifyToken.js")
const messagingWebsockets = require('./sockets/messageSocket.js')
const typingSockets = require('./sockets/typingSocket.js')
const deleteUpdateWebsockets = require('./sockets/deleteUpdateSocket.js')
const connectedUsersWebSockets = require('./sockets/connectedSocket.js')

express.use(messages);
express.use(user);
express.use(chats)



server.on('upgrade', function upgrade(request, socket, head) {
    const _verifyToken = verifyToken.authenticate;
    if (!_verifyToken(request)) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }

    if (request.url.split('/')[1] === "typing") {
        typingSockets.typing.handleUpgrade(request, socket, head, function done(ws) {
            typingSockets.typing.emit('connection', ws, request);
        });
    }
    else if (request.url.split('/')[1] === "message") {
        messagingWebsockets.messaging.handleUpgrade(request, socket, head, function done(ws) {
            messagingWebsockets.messaging.emit('connection', ws, request);
        });
    }

    else if (request.url.split('/')[1] === "deleteUpdate") {
        deleteUpdateWebsockets.deleteUpdateSocket.handleUpgrade(request, socket, head, function done(ws) {
            deleteUpdateWebsockets.deleteUpdateSocket.emit('connection', ws, request);
        });
    }

    else if (request.url.split('/')[1] === "connect") {
        connectedUsersWebSockets.connectedUsers.handleUpgrade(request, socket, head, function done(ws) {
            connectedUsersWebSockets.connectedUsers.emit('connection', ws, request);
        });
    }


});






// ws://0.0.0.0:8080/message/1

//623c117e982915cdd82afd26 username2
//623c117e982915cdd82afd27 username3
//623c117e982915cdd82afd25 username1
