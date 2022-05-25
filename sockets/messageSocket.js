const ws = require('ws');
const messaging = new ws.WebSocketServer({ noServer: true });
const getInt = require('../utils/getInt.js')
const Message = require('../Model/messageModel')
const User = require('../Model/user.js')

const connectedUsers = require('./connectedSocket.js')


const log = (str) => console.log(str);

const sendResponse = async (res, id) => {
    log(res);
    if (connectedUsers.connectedUsersList[id]) {
        const user = await User.findOne({ _id: res.from }).lean()
        user.message = {
            message: res.message,
            from: res.from,
            to: res.to
        }
        const payload = {
            newChat: false,
            user: user

        }
        log(payload)
        connectedUsers.connectedUsersList[id].send(JSON.stringify(payload))
    }

}


const addMessage = async function (data, bool, request, id) {
    try {
        const response = await Message({
            message: data.message,
            from: request.userId,
            to: id,
            seen: bool
        }).save()

        return response;
    } catch (err) {
        log(err)
    }


}

const getRoom = (id1, id2) => {
    // create a unique room based on user's id
    if (id1 > id2) {
        return `${id1}-${id2}`
    }
    return `${id2}-${id1}`
}
const sendResponseInRoom = (socket, message) => {
    socket.send(JSON.stringify(message))
}
let messagingWebsockets = {};

messaging.on('connection', function connection(ws, request) {
    const id1 = request.url.split('/')[2];
    const room = getRoom(getInt(id1), getInt(request.userId))
    ws.id = request.userId
    if (!messagingWebsockets[room]) {
        messagingWebsockets[room] = [ws];
    }
    else {
        messagingWebsockets[room].push(ws)
    }

    ws.on('message', async (data) => {
        const _data = JSON.parse(data)
        if (messagingWebsockets[room].length === 1) {
            if (messagingWebsockets[room][0].id === id1) {
                const messageResponse = await addMessage(_data, true, request, id1)
                // sendResponse(messagingWebsockets[room][0], messageResponse,id1);
                await sendResponse(messageResponse, id1);
                sendResponseInRoom(messagingWebsockets[room][0], messageResponse)
            }
            else {
                const messageResponse = await addMessage(_data, false, request, id1)
                await sendResponse(messageResponse, id1);
                sendResponseInRoom(messagingWebsockets[room][0], messageResponse)
            }
        }
        else {
            const messageResponse = await addMessage(_data, true, request, id1)
            for (let index = 0; index < messagingWebsockets[room].length; index++) {
                log("USER IDs -------------" + messagingWebsockets[room][index].id);
                await sendResponse(messageResponse, messagingWebsockets[room][index].id);
                sendResponseInRoom(messagingWebsockets[room][index], messageResponse)
                // sendResponse(messagingWebsockets[room][index], messageResponse,messagingWebsockets[room][index].id);
            }
        }


    });

    ws.on('close', function () {
        for (let index = 0; index < messagingWebsockets[room].length; index++) {
            if (messagingWebsockets[room][index].id === request.userId) {
                messagingWebsockets[room].splice(index, 1)

            }
        }
    })

});

module.exports = { messaging, messagingWebsockets }