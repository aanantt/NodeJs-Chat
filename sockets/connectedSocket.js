const ws = require('ws');
const connectedUsers = new ws.WebSocketServer({ noServer: true });

connectedUsersList = {}


connectedUsers.on('connection', function connection(ws, request) {
    const id = request.userId;
    connectedUsersList[id] = ws
     ws.on('message', (data) => {

    });

    ws.on('close', function () {
        delete connectedUsersList[id]
    })

});

module.exports = {
    connectedUsers, connectedUsersList
}