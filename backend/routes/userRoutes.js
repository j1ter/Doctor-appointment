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
    getUserMedicalRecords
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
// hello
userRouter.get('/profile', authUser, getProfile);
userRouter.post('/update-profile', authUser, upload.single('image'), updateProfile);
userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.get('/appointments', authUser, listAppointment);
userRouter.post('/cancel-appointment', authUser, cancelAppointment);

// Чат маршруты
userRouter.post('/conversations', authUser, newConversation);
userRouter.get('/conversations', authUser, getConversations);
userRouter.post('/messages', authUser, sendMessage);
userRouter.get('/messages/:conversationId', authUser, getMessages);

// Новый маршрут для получения медицинских записей пользователя
userRouter.get('/medical-records', authUser, getUserMedicalRecords);

console.log('Registered user routes, including GET /api/user/profile');

export default userRouter;