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

const User = Schema({
    username: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    profile: {
        type: String,
    }
}, { timestamps: true })

module.exports = mongoose.model("User", User);