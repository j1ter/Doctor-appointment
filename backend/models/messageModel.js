import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'conversation',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'senderModel',
        required: true,
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['user', 'doctor'], // Исправляем на реальные имена моделей
        default: 'user',
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'receiverModel',
        required: true,
    },
    receiverModel: {
        type: String,
        required: true,
        enum: ['user', 'doctor'], // Исправляем на реальные имена моделей
        default: 'user',
    },
    text: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const messageModel = mongoose.models.message || mongoose.model('message', messageSchema);

export default messageModel;