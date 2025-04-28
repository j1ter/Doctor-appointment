import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    members: {
        type: [String],
    }
}, {timestamps: true});

const conversationModel = mongoose.models.conversation || mongoose.model('conversation', conversationSchema);

export default conversationModel;
