import conversationModel from '../models/сonversationModel.js';
import mongoose from 'mongoose';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';

const newConversation = async (req, res) => {
    const { senderId, receiverId } = req.body;

    console.log('Received senderId:', senderId);
    console.log('Received receiverId:', receiverId);

    try {
        // Проверяем авторизованного пользователя или доктора
        const currentUserId = req.user?._id?.toString() || req.doctor?._id?.toString();
        if (!currentUserId) {
            return res.status(401).json({ success: false, message: 'No authenticated user or doctor found' });
        }
        if (senderId !== currentUserId) {
            return res.status(403).json({ success: false, message: 'Sender ID does not match authenticated user or doctor' });
        }

        // Проверяем, что senderId и receiverId являются валидными ObjectId
        const isSenderValid = mongoose.Types.ObjectId.isValid(senderId);
        const isReceiverValid = mongoose.Types.ObjectId.isValid(receiverId);
        console.log('Is senderId valid?', isSenderValid);
        console.log('Is receiverId valid?', isReceiverValid);

        if (!isSenderValid || !isReceiverValid) {
            return res.status(400).json({ success: false, message: 'Invalid senderId or receiverId' });
        }

        // Приводим к ObjectId с использованием 'new'
        const senderObjectId = new mongoose.Types.ObjectId(senderId);
        const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

        // Проверяем, что receiverId существует
        const receiver = await userModel.findById(receiverObjectId) || await doctorModel.findById(receiverObjectId);
        if (!receiver) {
            return res.status(404).json({ success: false, message: 'Receiver not found' });
        }

        // Проверяем, не существует ли уже диалог между senderId и receiverId
        const existingConversation = await conversationModel.findOne({
            members: { $all: [senderObjectId, receiverObjectId] },
        });

        if (existingConversation) {
            return res.status(200).json(existingConversation);
        }

        // Создаём новый диалог
        const newConversation = new conversationModel({
            members: [senderObjectId, receiverObjectId],
        });

        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
    } catch (error) {
        console.log('Error in newConversation:', error.message);
        res.status(500).json({ success: false, message: 'Error creating conversation', error: error.message });
    }
};

const getConversation = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid user or doctor ID' });
        }

        const conversations = await conversationModel.find({
            members: { $in: [new mongoose.Types.ObjectId(id)] },
        });
        res.status(200).json(conversations);
    } catch (error) {
        console.log('Error in getConversation:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching conversations', error: error.message });
    }
};

export { newConversation, getConversation };