const User = require('../Model/user.js')
const Chat = require('../Model/chatModel.js')
const Message = require('../Model/messageModel.js')
const connectedUsers = require('../sockets/connectedSocket.js')

exports.AllChats = async (req, res, next) => {
    let users;
    try {
        users = await User.find({});
    } catch (error) {
        users = [];
        next(err)

    }
    res.status(200).send(users);
}

exports.MyChats = async (req, res, next) => {
    try {
        var _chats = await Chat.find({ user: req.userId }).populate("chats").lean()
        if (_chats.length > 0) {
            console.log(_chats)

            for (let index = 0; index < _chats[0].chats.length; index++) {
                console.log(_chats[0].chats[index])
                let msg = await Message.findOne().or([{ to: req.userId, from: _chats[0].chats[index]._id }, { from: req.userId, to: _chats[0].chats[index]._id }]).sort({ field: 'asc', _id: -1 })
                _chats[0].chats[index].message = msg
            }

            res.status(200).json(_chats);
        }
        else {
            res.status(200).json(_chats);
        }


    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
}

exports.AddChat = async (req, res, next) => {
    console.log("USERID")
    console.log(req.params.userId)
    try {
        const _res = await Chat.findOneAndUpdate({ user: req.userId }, {
            "$addToSet": {
                chats: [
                    req.params.userId
                ]
            },

        }
        );
        const _res1 = await Chat.findOneAndUpdate({ user: req.params.userId }, {
            "$addToSet": {
                chats: [
                    req.userId
                ]
            },

        }
        );
        if (_res === null) {
            await Chat({
                user: req.userId,
                chats: [
                    req.params.userId
                ]
            }).save();
        }
        if (_res1 === null) {
            await Chat({
                user: req.params.userId,
                chats: [
                    req.userId
                ]
            }).save();
        }
        console.log("CONNECTED USERS :- ")
        console.log(connectedUsers.connectedUsersList)
        const user = await User.findOne({ _id: req.params.userId }).lean()
        user.message = {
            message: "New Message",
            from: req.userId,
            to: req.params.userId
        }
        const payload = {
            newChat: true,
            user: user

        }
        if (connectedUsers.connectedUsersList[req.userId]) {
            connectedUsers.connectedUsersList[req.userId].send(JSON.stringify(payload));
        }
        if (connectedUsers.connectedUsersList[req.params.userId]) {
            connectedUsers.connectedUsersList[req.params.userId].send(JSON.stringify(payload));
        }

        res.status(200).send()

    } catch (error) {
        console.log(error)
        res.status(500).send({ err: "error" })
    }

}