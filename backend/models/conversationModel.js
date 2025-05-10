import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'membersModel',
            required: true,
        },
    ],
    membersModel: [
        {
            type: String,
            required: true,
            enum: ['user', 'doctor'], // Исправляем на реальные имена моделей
        },
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'message', // Исправляем на 'message' (регистр)
        },
    ],
}, { timestamps: true });

const conversationModel = mongoose.models.conversation || mongoose.model('conversation', conversationSchema);

export default conversationModel;