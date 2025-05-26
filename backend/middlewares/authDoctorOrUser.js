import jwt from 'jsonwebtoken';
import doctorModel from '../models/doctorModel.js';
import userModel from '../models/userModel.js';
import MedicalRecord from '../models/medicalRecordModel.js';

const authDoctorOrUser = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized - No access token provided' });
        }

        // Проверяем, является ли токен докторским
        try {
            const decodedDoctor = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const doctor = await doctorModel.findById(decodedDoctor.docId);
            if (doctor) {
                req.doctor = doctor; // Присваиваем доктора
                req.isDoctor = true;
                return next(); // Доктор имеет доступ ко всем файлам
            }
        } catch (doctorError) {
            // Если не доктор, проверяем пользователя
        }

        // Проверяем, является ли токен пользовательским
        const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await userModel.findById(decodedUser.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user; // Присваиваем пользователя
        req.isDoctor = false;

        // Проверяем, принадлежит ли файл пользователю
        const fileName = req.params.fileName;
        let decodedFileName = fileName;
        try {
            decodedFileName = decodeURIComponent(fileName);
        } catch (e) {
            console.log('Error decoding file name:', e.message);
        }

        const record = await MedicalRecord.findOne({ fileName: decodedFileName, student: user._id });
        if (!record) {
            return res.status(403).json({ success: false, message: 'Access denied - Record not found or not owned by user' });
        }

        next();
    } catch (error) {
        console.log('Error in authDoctorOrUser:', error);
        res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
    }
};

export default authDoctorOrUser;