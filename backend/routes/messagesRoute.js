import express from 'express';
import { getMessage, sendMessage } from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.post("/", sendMessage);
messageRouter.get("/:conversationId", getMessage)

export default messageRouter;