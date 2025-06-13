import messageModel from '../models/messageModel.js';
import conversationModel from '../models/conversationModel.js';
import mongoose from 'mongoose';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';

const sendMessage = async (req, res) => {
    const { conversationId, text, receiverId } = req.body;
    const io = req.app.get('io');

    try {
        const sender = req.doctor || req.user;
        if (!sender) {
            return res.status(401).json({ success: false, message: 'No authenticated user or doctor found' });
        }

        if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ success: false, message: 'Invalid conversationId or receiverId' });
        }

        const conversationObjectId = new mongoose.Types.ObjectId(conversationId);
        const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
        const senderObjectId = sender._id;
        const senderModel = req.doctor ? 'doctor' : 'user';
        const receiver = await userModel.findById(receiverObjectId).select('name email image _id') || await doctorModel.findById(receiverObjectId).select('name email image _id');
        if (!receiver) {
            return res.status(404).json({ success: false, message: 'Receiver not found' });
        }
        const receiverModel = (await userModel.findById(receiverObjectId)) ? 'user' : 'doctor';

        const conversation = await conversationModel.findById(conversationObjectId);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        const members = conversation.members.map(m => m.toString());
        if (!members.includes(sender._id.toString()) || !members.includes(receiverId)) {
            return res.status(403).json({ success: false, message: 'Not a member of this conversation' });
        }

        const newMessage = new messageModel({
            conversationId: conversationObjectId,
            sender: senderObjectId,
            senderModel,
            receiver: receiverObjectId,
            receiverModel,
            text,
        });

        const savedMessage = await newMessage.save();

        await conversationModel.findByIdAndUpdate(
            conversationObjectId,
            { $push: { messages: savedMessage._id } },
            { new: true }
        );

        // Получаем обновлённые сообщения для отправки
        const updatedMessages = await messageModel.find({ conversationId: conversationObjectId })
            .populate('sender receiver', 'name email image _id');

        io.to(conversationId.toString()).emit('new_message', {
            conversationId: conversationId.toString(),
            sender: sender._id.toString(),
            senderName: sender.name,
            senderEmail: sender.email,
            senderImage: sender.image || '',
            receiver: receiverId,
            receiverName: receiver.name,
            receiverEmail: receiver.email,
            receiverImage: receiver.image || '',
            text,
            createdAt: savedMessage.createdAt,
            messages: updatedMessages, // Отправляем полный список сообщений
        });

        res.status(200).json({ success: true, message: 'Message sent successfully', messages: updatedMessages });
    } catch (error) {
        console.log('Error in sendMessage:', error.message);
        res.status(500).json({ success: false, message: 'Error sending message' });
    }
};

const getMessages = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const sender = req.doctor || req.user;

        if (!sender) {
            return res.status(401).json({ success: false, message: 'No authenticated user or doctor found' });
        }

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ success: false, message: 'Invalid conversationId' });
        }

        const conversationObjectId = new mongoose.Types.ObjectId(conversationId);
        const conversation = await conversationModel.findById(conversationObjectId);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        if (!conversation.members.includes(sender._id)) {
            return res.status(403).json({ success: false, message: 'Not a member of this conversation' });
        }

        const messages = await messageModel.find({ conversationId: conversationObjectId })
            .populate('sender receiver', 'name email image _id');
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.log('Error in getMessages:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching messages' });
    }
};

export { sendMessage, getMessages };