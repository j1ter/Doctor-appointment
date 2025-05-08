import messageModel from '../models/messageModel.js';

const sendMessage = async (req, res) => {
  const newMsg = new messageModel({
    conversationId: req.body.conversationId,
    sender: req.user?._id || req.doctor?._id,
    text: req.body.text,
  });
  try {
    const saveMsg = await newMsg.save();
    const io = req.app.get('io');
    io.to(saveMsg.conversationId).emit('new_message', saveMsg);
    res.status(200).json(saveMsg);
  } catch (error) {
    res.status(500).json({ message: 'Error from sendMessage controller', error });
  }
};

const getMessage = async (req, res) => {
  try {
    const messages = await messageModel.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error from getMessage controller', error });
  }
};

export { sendMessage, getMessage };