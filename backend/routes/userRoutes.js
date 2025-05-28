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
    getUserMedicalRecords,
    changePassword, // Новый маршрут
    verifyCode, // Новый маршрут
    getAllArticles,
    getArticleById,
    searchArticles
    

} from '../controllers/userController.js';
import {
    createComment, // New
    getCommentsByArticle, // New
    updateComment, // New
    deleteOwnComment // New
} from '../controllers/commentController.js';
import { authUser } from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';
import { newConversation, getConversations } from '../controllers/conversationsController.js';
import { sendMessage, getMessages } from '../controllers/messageController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser); // Новый маршрут
userRouter.post('/login', loginUser);
userRouter.post('/logout', authUser, logoutUser);
userRouter.post('/refresh-token', refreshToken);
userRouter.post('/verify-code', verifyCode); // Новый маршрут для проверки кода
// hello
userRouter.get('/profile', authUser, getProfile);
userRouter.post('/update-profile', authUser, upload.single('image'), updateProfile);
userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.get('/appointments', authUser, listAppointment);
userRouter.post('/cancel-appointment', authUser, cancelAppointment);
userRouter.post('/change-password', authUser, changePassword); // Новый маршрут для смены пароля

// Чат маршруты
userRouter.post('/conversations', authUser, newConversation);
userRouter.get('/conversations', authUser, getConversations);
userRouter.post('/messages', authUser, sendMessage);
userRouter.get('/messages/:conversationId', authUser, getMessages);

// Новый маршрут для получения медицинских записей пользователя
userRouter.get('/medical-records', authUser, getUserMedicalRecords);

// New article and comment routes
userRouter.get('/articles', getAllArticles); // Public
userRouter.get('/articles/:id', getArticleById); // Public
userRouter.get('/articles/search/:query', searchArticles); // Public
userRouter.post('/comments', authUser, createComment);
userRouter.get('/comments/:articleId', getCommentsByArticle); // Public
userRouter.put('/comments/:id', authUser, updateComment);
userRouter.delete('/comments/:id', authUser, deleteOwnComment);

console.log('Registered user routes, including GET /api/user/profile');

export default userRouter;