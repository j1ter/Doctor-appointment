import express from 'express';
import {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    logoutUser,
    refreshToken,
} from '../controllers/userController.js';
import { authUser } from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';
import { newConversation, getConversations } from '../controllers/conversationsController.js';
import { sendMessage, getMessages } from '../controllers/messageController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/logout', authUser, logoutUser);
userRouter.post('/refresh-token', refreshToken);

userRouter.get('/profile', authUser, getProfile);
userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile);
userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.get('/appointments', authUser, listAppointment);
userRouter.post('/cancel-appointment', authUser, cancelAppointment);

// Чат маршруты
userRouter.post('/conversations', authUser, newConversation);
userRouter.get('/conversations', authUser, getConversations);
userRouter.post('/messages', authUser, sendMessage);
userRouter.get('/messages/:conversationId', authUser, getMessages);

console.log('Registered user routes, including GET /api/user/profile');

export default userRouter;