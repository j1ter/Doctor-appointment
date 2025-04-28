import messageModel from '../models/messageModel.js';

const sendMessage = async(req, res) => {
    const newMsg = new messageModel(req.body);
    try {
        const saveMsg = await newMsg.save();
        res.status(200).json(saveMsg);
    } catch (error) {
        res.status(500).json({message: "Error from sendMessage controller", error})
    }
};

const getMessage = async(req, res) => {
    try {
        const messages = await messageModel.find({
            conversationId: req.params.conversationId,
        });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({message: "Error from getMessage controller", error});
    }
};

export {sendMessage, getMessage};