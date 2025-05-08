import express from 'express';
import { getConversation, newConversation } from '../controllers/conversationsController.js';
import {authUser} from '../middlewares/authUser.js';
import authDoctor from '../middlewares/authDoctor.js';

const conversationsRouter = express.Router();

conversationsRouter.post('/', authUser, newConversation);
conversationsRouter.post('/', authDoctor, newConversation);
conversationsRouter.get('/:userId', authUser, getConversation);
conversationsRouter.get('/:userId', authDoctor, getConversation);

export default conversationsRouter;