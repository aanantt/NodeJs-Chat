const Chat = require('../Model/messageModel.js')

exports.GetMessages = async (req, res, next) => {
    const userId = req.params.id;
    let chats;
    try {
        console.log(userId)
        console.log(req.userId);
        chats = await Chat.find({
            $or: [
                { from: userId, to: req.userId }, { to: userId, from: req.userId }
            ], $and: [{ seen: false }]
        });
        console.log("here")
        console.log(chats)
        await Chat.updateMany({
            $or: [
                { from: userId, to: req.userId }
            ], $and: [{ seen: false }]
        }, { "$set": { seen: true } })
        res.status(200).send(chats)
    } catch (error) {
        res.status(500).send({ error: error })
    }

}