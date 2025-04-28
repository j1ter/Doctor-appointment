import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: {type: String},
    sender: {type: String},
    text: {type: String},
    
}, {timestamps: true});

const messageModel = mongoose.models.message || mongoose.model('message', messageSchema);

export default messageModel;