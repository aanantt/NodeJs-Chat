const ws = require('ws');
const typing = new ws.WebSocketServer({ noServer: true });
const getInt = require('../utils/getInt.js')
const User = require('../Model/user.js')


let typingWebsockets = {};

const getRoom = (id1, id2) => {
    // create a unique room based on user's id
    if (id1 > id2) {
        return `${id1}-${id2}`
    }
    return `${id2}-${id1}`
}


typing.on('connection', function connection(ws, request) {

    const id1 = request.url.split('/')[2];
    const room = getRoom(getInt(id1), getInt(request.userId))
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
            console.log(_data);

        } catch (error) {
            console.log(error);
        }

        for (let index = 0; index < typingWebsockets[room].length; index++) {

            console.log(typingWebsockets[room][index].id + id1)
            // only send typing response to only the other user in room
            if (typingWebsockets[room][index].id.toString() === id1.toString()) {
                typingWebsockets[room][index].send(JSON.stringify(_data));
            }
        }

    });

    ws.on('close', function () {

    })

});

module.exports = { typing, typingWebsockets }