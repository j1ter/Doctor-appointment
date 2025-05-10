import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    members: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
    },
}, { timestamps: true });

const conversationModel = mongoose.models.conversation || mongoose.model('conversation', conversationSchema);

export default conversationModel;