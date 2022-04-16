var express = require('express')();
const Message = require('./Model/messageModel')
const ws = require('ws');
const messages = require('./routes/messageRoute.js')
const chats = require('./routes/chatRoute.js')
const user = require('./routes/userRoute.js')
const server = express.listen(8080);
const messaging = new ws.WebSocketServer({ noServer: true });
const typing = new ws.WebSocketServer({ noServer: true });
const deleteUpdateMessage = new ws.WebSocketServer({ noServer: true });
const verifyToken = require("./utils/verifyToken.js")
const getInt = require('./utils/getInt.js')
const Mongoose = require('mongoose');

const User = require('./Model/user.js')

express.use(messages);
express.use(user);
express.use(chats)

let messagingWebsockets = {};
let typingWebsockets = {};
let deleteUpdateMessageWebSockets = {};




const log = (str) => console.log(str);

const addAndSendResponse = (socketType, data, bool, request, id) => {
    Message({
        message: data.message,
        from: request.userId,
        to: id,
        seen: bool
    }).save().then((res) => log(socketType.send(JSON.stringify(res)))).catch((err) => { log(err) });

}

const getRoom = (id1, id2) => {
    // create a unique room based on user's id
    if (id1 > id2) {
        return `${id1}-${id2}`
    }
    return `${id2}-${id1}`
}

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

     ws.on('message', (data) => {
        const _data = JSON.parse(data)
        log(messagingWebsockets[room])
        if (messagingWebsockets[room].length === 1) {
            if (messagingWebsockets[room][0].id === id1) {
                addAndSendResponse(messagingWebsockets[room][0], _data, true, request, id1)
            }
            else {
                addAndSendResponse(messagingWebsockets[room][0], _data, false, request, id1)
            }
        }
        else {
            for (let index = 0; index < messagingWebsockets[room].length; index++) {
                addAndSendResponse(messagingWebsockets[room][index], _data, true, request, id1)

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

typing.on('connection', function connection(ws, request) {
    console.log("Typing Connected")
    console.log(messaging.clients)

    const id1 = request.url.split('/')[2];
    const room = getRoom(parseInt(id1), parseInt(request.userId))
    ws.id = request.userId
    if (!typingWebsockets[room]) {
        typingWebsockets[room] = [ws];
    }
    else {
        typingWebsockets[room].push(ws)
    }

    ws.on('message', async function message(data) {
        console.log(`Received message ${data} from user `);
        const _data = JSON.parse(data)
        try {
            const user = await User.findOne({ _id: request.userId });
            _data.username = user.username;
            log(_data);

        } catch (error) {
            console.log(error);
        }

        for (let index = 0; index < typingWebsockets[room].length; index++) {

            log(typingWebsockets[room][index].id + id1)
            // only send typing response to only the other user in room
            if (typingWebsockets[room][index].id.toString() === id1.toString()) {
                typingWebsockets[room][index].send(JSON.stringify(_data));
            }
        }

    });

    ws.on('close', function () {

    })

});

deleteUpdateMessage.on('connection', function connection(ws, request) {


    const id1 = request.url.split('/')[2];
    const room = getRoom(parseInt(id1), parseInt(request.userId))
    ws.id = request.userId
    if (!deleteUpdateMessageWebSockets[room]) {
        deleteUpdateMessageWebSockets[room] = [ws];
    }
    else {
        deleteUpdateMessageWebSockets[room].push(ws)
    }
    ws.on('message', async function message(data) {
        const _data = JSON.parse(data)
        try {

            if (!_data.forUpdate) {
                log(_data)
                const id = Mongoose.Types.ObjectId(_data.messageId);
                const res = await Message.findOneAndRemove({ _id: id });
                log(res)
            }
            else {
                log("In update")
                await Message.findByIdAndUpdate(_data.messageId, { message: _data.newMessage })
            }

        } catch (error) {
            log(error);
        }
        for (let index = 0; index < deleteUpdateMessageWebSockets[room].length; index++) {
             
            // only send typing response to only the other user in room
            // if (deleteUpdateMessageWebSockets[room][index].id.toString() === id1.toString()) {
                deleteUpdateMessageWebSockets[room][index].send(JSON.stringify(_data));
            // }
        }
    });

    ws.on('close', function () {

    })

});



server.on('upgrade', function upgrade(request, socket, head) {
    const _verifyToken = verifyToken.authenticate;
    if (!_verifyToken(request)) {
        log("aborting...")
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }
    console.log("upgrade")
    console.log(request.headers.token)

    if (request.url.split('/')[1] === "typing") {
        typing.handleUpgrade(request, socket, head, function done(ws) {
            typing.emit('connection', ws, request);
        });
    }
    else if (request.url.split('/')[1] === "message") {
        messaging.handleUpgrade(request, socket, head, function done(ws) {
            messaging.emit('connection', ws, request);
        });
    }

    else if (request.url.split('/')[1] === "deleteUpdate") {
        deleteUpdateMessage.handleUpgrade(request, socket, head, function done(ws) {
            deleteUpdateMessage.emit('connection', ws, request);
        });
    }


});






// ws://0.0.0.0:8080/message/1

//623c117e982915cdd82afd26 username2
//623c117e982915cdd82afd27 username3
//623c117e982915cdd82afd25 username1
