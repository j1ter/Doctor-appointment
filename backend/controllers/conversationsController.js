import conversationModel from '../models/conversationModel.js';
import mongoose from 'mongoose';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';

const newConversation = async (req, res) => {
    const { receiverId } = req.body;

    try {
        const sender = req.doctor || req.user;
        if (!sender) {
            return res.status(401).json({ success: false, message: 'No authenticated user or doctor found' });
        }

        const senderId = sender._id.toString();
        const senderModel = req.doctor ? 'doctor' : 'user';
        const isReceiverValid = mongoose.Types.ObjectId.isValid(receiverId);
        if (!isReceiverValid) {
            return res.status(400).json({ success: false, message: 'Invalid receiverId' });
        }

        const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
        const receiver = await userModel.findById(receiverObjectId) || await doctorModel.findById(receiverObjectId);
        if (!receiver) {
            return res.status(404).json({ success: false, message: 'Receiver not found' });
        }

        const receiverModel = (await userModel.findById(receiverObjectId)) ? 'user' : 'doctor';

        const existingConversation = await conversationModel.findOne({
            members: { $all: [senderId, receiverId] },
        }).lean();

        if (existingConversation) {
            return res.status(200).json(existingConversation);
        }

        const newConversation = new conversationModel({
            members: [senderId, receiverId],
            membersModel: [senderModel, receiverModel],
            messages: [],
        });

        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
    } catch (error) {
        console.log('Error in newConversation:', error.message);
        res.status(500).json({ success: false, message: 'Error creating conversation' });
    }
};

const getConversations = async (req, res) => {
    try {
        const sender = req.doctor || req.user;
        if (!sender) {
            return res.status(401).json({ success: false, message: 'No authenticated user or doctor found' });
        }

        const senderId = sender._id.toString();
        if (!mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(400).json({ success: false, message: 'Invalid sender ID' });
        }

        const conversations = await conversationModel
            .find({ members: senderId })
            .populate({
                path: 'members',
                select: 'name email image _id', // Добавляем image и _id
            })
            .populate({
                path: 'messages',
                populate: {
                    path: 'sender receiver',
                    select: 'name email image _id', // Добавляем image и _id
                },
            })
            .lean();

        console.log('Populated conversations:', conversations);

        const formattedConversations = conversations
            .filter(conv => conv.members && conv.members.length > 0)
            .map(conv => {
                const otherMember = conv.members.find(m => m && m._id && m._id.toString() !== senderId.toString());
                const userData = otherMember || { name: 'Unknown', email: 'N/A', image: '' };
                return {
                    _id: conv._id,
                    userData: userData,
                    lastMessage: Array.isArray(conv.messages) && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null,
                    messages: Array.isArray(conv.messages) ? conv.messages : [],
                };
            });

        res.status(200).json({ success: true, conversations: formattedConversations });
    } catch (error) {
        console.log('Error in getConversations:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching conversations', error: error.message });
    }
};

export { newConversation, getConversations };

// import conversationModel from '../models/conversationModel.js';
// import mongoose from 'mongoose';
// import userModel from '../models/userModel.js';
// import doctorModel from '../models/doctorModel.js';

// const newConversation = async (req, res) => {
//     const { receiverId } = req.body;

//     try {
//         const sender = req.doctor || req.user;
//         if (!sender) {
//             return res.status(401).json({ success: false, message: 'No authenticated user or doctor found' });
//         }

//         const senderId = sender._id.toString();
//         const senderModel = req.doctor ? 'doctor' : 'user';
//         const isReceiverValid = mongoose.Types.ObjectId.isValid(receiverId);
//         if (!isReceiverValid) {
//             return res.status(400).json({ success: false, message: 'Invalid receiverId' });
//         }

//         const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
//         const receiver = await userModel.findById(receiverObjectId) || await doctorModel.findById(receiverObjectId);
//         if (!receiver) {
//             return res.status(404).json({ success: false, message: 'Receiver not found' });
//         }

//         const receiverModel = (await userModel.findById(receiverObjectId)) ? 'user' : 'doctor';

//         const existingConversation = await conversationModel.findOne({
//             members: { $all: [senderId, receiverId] },
//         }).lean();

//         if (existingConversation) {
//             return res.status(200).json(existingConversation);
//         }

//         const newConversation = new conversationModel({
//             members: [senderId, receiverId],
//             membersModel: [senderModel, receiverModel],
//             messages: [],
//         });

//         const savedConversation = await newConversation.save();
//         res.status(200).json(savedConversation);
//     } catch (error) {
//         console.log('Error in newConversation:', error.message);
//         res.status(500).json({ success: false, message: 'Error creating conversation' });
//     }
// };

// const getConversations = async (req, res) => {
//     try {
//         const sender = req.doctor || req.user;
//         if (!sender) {
//             return res.status(401).json({ success: false, message: 'No authenticated user or doctor found' });
//         }

//         const senderId = sender._id.toString();
//         if (!mongoose.Types.ObjectId.isValid(senderId)) {
//             return res.status(400).json({ success: false, message: 'Invalid sender ID' });
//         }

//         const conversations = await conversationModel
//             .find({ members: senderId })
//             .populate({
//                 path: 'members',
//                 select: 'name email -_id',
//             })
//             .populate({
//                 path: 'messages',
//                 populate: {
//                     path: 'sender receiver',
//                     select: 'name email -_id',
//                 },
//             })
//             .lean();

//         console.log('Populated conversations:', conversations); // Логируем для отладки

//         const formattedConversations = conversations
//             .filter(conv => conv.members && conv.members.length > 0)
//             .map(conv => {
//                 const otherMember = conv.members.find(m => m && m._id && m._id.toString() !== senderId.toString());
//                 const userData = otherMember || { name: 'Unknown', email: 'N/A' };
//                 return {
//                     _id: conv._id,
//                     userData: userData,
//                     lastMessage: Array.isArray(conv.messages) && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null,
//                     messages: Array.isArray(conv.messages) ? conv.messages : [],
//                 };
//             });

//         res.status(200).json({ success: true, conversations: formattedConversations });
//     } catch (error) {
//         console.log('Error in getConversations:', error.message);
//         res.status(500).json({ success: false, message: 'Error fetching conversations', error: error.message });
//     }
// };

// export { newConversation, getConversations };