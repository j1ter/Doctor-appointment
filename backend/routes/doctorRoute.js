import express from 'express';
import {
    doctorList,
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile,
    logoutDoctor,
    refreshTokenDoctor,
} from '../controllers/doctorController.js';
import authDoctor from '../middlewares/authDoctor.js';
import { newConversation, getConversations } from '../controllers/conversationsController.js';
import { sendMessage, getMessages } from '../controllers/messageController.js';

const doctorRouter = express.Router();

doctorRouter.get('/list', doctorList);
doctorRouter.post('/login', loginDoctor);
doctorRouter.post('/logout', logoutDoctor);
doctorRouter.post('/refresh-token', refreshTokenDoctor);
doctorRouter.get('/appointments', authDoctor, appointmentsDoctor);
doctorRouter.post('/complete-appointment', authDoctor, appointmentComplete);
doctorRouter.post('/cancel-appointment', authDoctor, appointmentCancel);
doctorRouter.get('/dashboard', authDoctor, doctorDashboard);
doctorRouter.get('/profile', authDoctor, doctorProfile);
doctorRouter.post('/update-profile', authDoctor, updateDoctorProfile);

// Чат маршруты
doctorRouter.post('/conversations', authDoctor, newConversation);
doctorRouter.get('/conversations', authDoctor, getConversations);
doctorRouter.post('/messages', authDoctor, sendMessage);
doctorRouter.get('/messages/:conversationId', authDoctor, getMessages);

export default doctorRouter;