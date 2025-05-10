import express from 'express';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import { newConversation, getConversation } from '../controllers/conversationsController.js';

const conversationsRouter = express.Router();

// Middleware для проверки авторизации (пользователь или доктор)
const authMiddleware = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({ success: false, message: 'Unauthorized - No access token provided' });
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        console.log('Decoded token:', decoded);

        if (decoded.userId) {
            const user = await userModel.findById(decoded.userId).select('-password');
            if (!user) {
                return res.status(401).json({ success: false, message: 'User not found' });
            }
            req.user = user;
        } else if (decoded.docId) {
            const doctor = await doctorModel.findById(decoded.docId).select('-password');
            if (!doctor) {
                return res.status(401).json({ success: false, message: 'Doctor not found' });
            }
            req.doctor = doctor;
        } else {
            return res.status(401).json({ success: false, message: 'Invalid token format' });
        }

        next();
    } catch (error) {
        console.log('Error in authMiddleware:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Unauthorized - Access token expired' });
        }
        return res.status(401).json({ success: false, message: 'Unauthorized - Invalid access token' });
    }
};

// Создание нового диалога
conversationsRouter.post('/', authMiddleware, newConversation);

// Получение диалогов пользователя или доктора
conversationsRouter.get('/:id', authMiddleware, getConversation);

export default conversationsRouter;