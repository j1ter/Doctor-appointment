import express from 'express';
import { getConversation, newConversation } from '../controllers/conversationsController.js';

const conversationsRouter = express.Router();

conversationsRouter.post("/", newConversation);
conversationsRouter.get("/:userId", getConversation)

export default conversationsRouter;