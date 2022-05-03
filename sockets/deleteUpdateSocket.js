const ws = require('ws');
const deleteUpdateSocket = new ws.WebSocketServer({ noServer: true });
const getInt = require('../utils/getInt.js')
const User = require('../Model/user.js')
const Message = require('../Model/messageModel')
const Mongoose = require('mongoose')

let deleteUpdateMessageWebSockets = {};

const getRoom = (id1, id2) => {
    // create a unique room based on user's id
    if (id1 > id2) {
        return `${id1}-${id2}`
    }
    return `${id2}-${id1}`
}
deleteUpdateSocket.on('connection', function connection(ws, request) {

    const id1 = request.url.split('/')[2];
    const room = getRoom(getInt(id1), getInt(request.userId))
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
                const id = Mongoose.Types.ObjectId(_data.messageId);
                const res = await Message.findOneAndRemove({ _id: id });
            }
            else {
                await Message.findByIdAndUpdate(_data.messageId, { message: _data.newMessage })
            }

        } catch (error) {
            console.log(error);
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


module.exports = {
    deleteUpdateSocket, deleteUpdateMessageWebSockets
}
