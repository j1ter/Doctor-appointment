import conversationModel from '../models/сonversationModel.js';

const newConversation = async (req, res) => {
    const newConv = new conversationModel({
        members: [req.body.senderId, req.body.receiverId],
    });

    try {
        const savedConv = await newConv.save();
        res.status(200).json(savedConv);
    } catch (error) {
        res.status(500).json({message: "Error from newConversation Controller", error})
    }
}

const getConversation = async (req, res) => {
    try {
        const convs = await conversationModel.find({
            members: { $in: [req.params.userId] },
        });
        res.status(200).json(convs);
    } catch (error) {
        res.status(500).json({message: "Error from getConversation controller", error});
    }
}

export {newConversation, getConversation};