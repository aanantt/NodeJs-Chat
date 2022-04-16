const mongoose = require('mongoose');


mongoose.connect('mongodb://localhost:27017/admin',
    {
        useNewUrlParser: true,

        useUnifiedTopology: true
    }
);


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log("opened");
});


const Schema = mongoose.Schema;

const Message = new mongoose.Schema({
    message: String,
    from: String,
    to: String,
    seen: Boolean,
    messageType: Number,
}, { timestamps: true });

module.exports = mongoose.model("Message", Message);