import messageModel from '../models/messageModel.js';
import conversationModel from '../models/сonversationModel.js';
import mongoose from 'mongoose';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';

const sendMessage = async (req, res) => {
    const { conversationId, text, receiverId } = req.body;
    const io = req.app.get('io'); // Получаем io из app

    console.log('Received conversationId:', conversationId);
    console.log('Received receiverId:', receiverId);
    console.log('Received text:', text);

    try {
        // Проверяем авторизованного пользователя или доктора
        const sender = req.user || req.doctor;
        if (!sender) {
            return res.status(401).json({ success: false, message: 'No authenticated user or doctor found' });
        }

        // Проверяем валидность conversationId и receiverId
        if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ success: false, message: 'Invalid conversationId or receiverId' });
        }

        // Приводим к ObjectId
        const conversationObjectId = new mongoose.Types.ObjectId(conversationId);
        const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
        const senderObjectId = new mongoose.Types.ObjectId(sender._id);

        // Проверяем, что conversationId существует
        const conversation = await conversationModel.findById(conversationObjectId);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        // Проверяем, что sender и receiver являются участниками диалога
        const senderId = sender._id.toString();
        const members = conversation.members.map(member => member.toString());
        if (!members.includes(senderId) || !members.includes(receiverId)) {
            return res.status(403).json({ success: false, message: 'Not a member of this conversation' });
        }

        // Создаём новое сообщение
        const newMessage = new messageModel({
            conversationId: conversationObjectId,
            sender: senderObjectId,
            receiver: receiverObjectId,
            text,
        });

        const savedMessage = await newMessage.save();

        // Отправляем сообщение через Socket.IO
        io.to(conversationId).emit('new_message', {
            conversationId,
            sender: senderId,
            receiver: receiverId,
            text,
            createdAt: savedMessage.createdAt,
        });

        res.status(200).json(savedMessage);
    } catch (error) {
        console.log('Error in sendMessage:', error.message);
        res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;

        // Проверяем авторизованного пользователя или доктора
        const sender = req.user || req.doctor;
        if (!sender) {
            return res.status(401).json({ success: false, message: 'No authenticated user or doctor found' });
        }

        // Проверяем валидность conversationId
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ success: false, message: 'Invalid conversationId' });
        }

        // Приводим к ObjectId
        const conversationObjectId = new mongoose.Types.ObjectId(conversationId);

        // Проверяем, что conversationId существует
        const conversation = await conversationModel.findById(conversationObjectId);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        // Проверяем, что sender является участником диалога
        const members = conversation.members.map(member => member.toString());
        if (!members.includes(sender._id.toString())) {
            return res.status(403).json({ success: false, message: 'Not a member of this conversation' });
        }

        const messages = await messageModel.find({
            conversationId: conversationObjectId,
        });

        res.status(200).json(messages);
    } catch (error) {
        console.log('Error in getMessages:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
    }
};

export { sendMessage, getMessages };