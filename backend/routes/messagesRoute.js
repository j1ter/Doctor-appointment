import express from 'express';
import { getMessage, sendMessage } from '../controllers/messageController.js';
import {authUser} from '../middlewares/authUser.js';
import authDoctor from '../middlewares/authDoctor.js';

const messageRouter = express.Router();

messageRouter.post("/", authUser, sendMessage);
messageRouter.post("/", authDoctor, sendMessage);
messageRouter.get("/:conversationId", authUser, getMessage);
messageRouter.get("/:conversationId", authDoctor, getMessage);

export default messageRouter;