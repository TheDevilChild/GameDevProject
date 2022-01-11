const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    chatMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    chatMessages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }]
})

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;

