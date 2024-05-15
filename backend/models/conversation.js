const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    messages: [{
        text: String,
        timestamp: { type: Date, default: Date.now }
    }]
});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;