import doctorModel from "../models/doctorModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import appointmentModel from '../models/appointmentModel.js';
import MedicalRecord from '../models/medicalRecordModel.js';
import { redis } from '../lib/redis.js';
import { uploadFile, downloadFile } from '../services/minioService.js';
import upload from '../middlewares/multer.js';


// Helper function to generate access and refresh tokens
const generateTokens = (docId) => {
    const accessToken = jwt.sign({ docId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ docId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });

    return { accessToken, refreshToken };
};

// Helper function to store refresh token in Redis
const storeRefreshToken = async (docId, refreshToken) => {
    await redis.set(`refresh_token_doctor:${docId}`, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7 days
};

// Helper function to set cookies
const setCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

// API for login doctor
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const doctor = await doctorModel.findOne({ email });

        if (!doctor) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, doctor.password);

        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = generateTokens(doctor._id);
        await storeRefreshToken(doctor._id, refreshToken);
        setCookies(res, accessToken, refreshToken);

        res.json({
            success: true,
            doctor: {
                _id: doctor._id,
                name: doctor.name,
                email: doctor.email,
            },
            message: 'Login successfully!',
        });
    } catch (error) {
        console.log('Error in loginDoctor:', error);
        res.json({ success: false, message: error.message });
    }
};

// API to log out doctor
const logoutDoctor = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token_doctor:${decoded.docId}`);
        }

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.log('Error in logoutDoctor:', error);
        res.json({ success: false, message: error.message });
    }
};

// API to refresh access token for doctor
const refreshTokenDoctor = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'No refresh token provided' });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refresh_token_doctor:${decoded.docId}`);

        if (storedToken !== refreshToken) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        const accessToken = jwt.sign({ docId: decoded.docId }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '15m',
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });

        res.json({ success: true, message: 'Token refreshed successfully' });
    } catch (error) {
        console.log('Error in refreshTokenDoctor:', error);
        res.json({ success: false, message: error.message });
    }
};

const changeAvailabity = async (req, res) => {
    try {

        const {docId} = req.body;

        const docData = await doctorModel.findById(docId);
        await doctorModel.findByIdAndUpdate(docId, {available: !docData.available});
        res.json({success: true, message: 'Availablity Changed'});

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
};


const doctorList = async (req,res) => {
    try {
        
        const doctors = await doctorModel.find({}).select(['-password','-email'])

        res.json({success:true,doctors})

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// API для загрузки справки после завершения назначения
const uploadMedicalRecord = async (req, res) => {
    try {
        const { appointmentId } = req.params; // Изменили на params, так как передается в URL
        const doctorId = req.doctor._id; // Из middleware authDoctor
        const file = req.file;

        if (!file) {
            return res.json({ success: false, message: 'No file uploaded' });
        }

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment || appointment.docId.toString() !== doctorId.toString() || !appointment.isCompleted) {
            return res.json({ success: false, message: 'Invalid or incomplete appointment' });
        }

        const fileName = await uploadFile(file);
        const fileUrl = `/api/doctor/records/download/${fileName}`; // Исправлен путь

        const medicalRecord = new MedicalRecord({
            student: appointment.userId,
            doctor: doctorId,
            appointment: appointment._id,
            fileName,
            fileUrl
        });

        await medicalRecord.save();
        res.json({ success: true, message: 'Medical record uploaded', medicalRecord });
    } catch (error) {
        console.log('Error in uploadMedicalRecord:', error);
        res.json({ success: false, message: error.message });
    }
};



// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {
        const docId = req.doctor._id; // Используем ID из middleware authDoctor
        const appointments = await appointmentModel.find({docId}).populate('userData', 'name image dob');
        console.log('Appointments fetched for docId:', docId, appointments); // Лог для отладки
        res.json({success: true, appointments});
    } catch (error) {
        console.log('Error in appointmentsDoctor:', error);
        res.json({success: false, message: error.message});
    }
};

// Обновляем appointmentComplete для активации загрузки
const appointmentComplete = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const doctorId = req.doctor._id;
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (appointmentData && appointmentData.docId.toString() === doctorId.toString()) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
            return res.json({ success: true, message: 'Appointment Completed', canUpload: true });
        } else {
            return res.json({ success: false, message: 'Mark Failed' });
        }
    } catch (error) {
        console.log('Error in appointmentComplete:', error);
        res.json({ success: false, message: error.message });
    }
};

// Добавляем маршрут для скачивания файла

const downloadMedicalRecord = async (req, res) => {
    try {
        const fileName = req.params.fileName;
        console.log('Attempting to download file:', fileName); // Лог для отладки
        const fileStream = await downloadFile(fileName);
        // Устанавливаем заголовки для корректного скачивания
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        res.setHeader('Content-Type', 'application/octet-stream'); // Универсальный тип для файлов
        // Пайпим поток с обработкой завершения
        fileStream.pipe(res);
        fileStream.on('error', (error) => {
            console.log('Stream error:', error);
            res.status(500).json({ success: false, message: 'Error streaming file' });
        });
        res.on('finish', () => {
            console.log('File stream completed');
        });
        res.on('error', (error) => {
            console.log('Response error:', error);
            res.status(500).json({ success: false, message: 'Error in response' });
        });
    } catch (error) {
        console.log('Error in downloadMedicalRecord:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
    try {
        const {appointmentId} = req.body;
        const docId = req.doctor._id; // Используем ID из middleware authDoctor
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (appointmentData && appointmentData.docId.toString() === docId.toString()) {
            await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled: true});
            return res.json({success: true, message: 'Appointment Cancelled'});
        } else {
            return res.json({success: false, message: 'Cancellation Failed'});
        }
    } catch (error) {
        console.log('Error in appointmentCancel:', error);
        res.json({success: false, message: error.message});
    }
};

// API to get dashboard data for doctor panel

const doctorDashboard = async (req, res) => {
    try {
        const doctor = req.doctor; // Используем данные из токена
        const appointments = await appointmentModel.find({ docId: doctor._id });

        let patients = [];
        appointments.forEach((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId);
            }
        });

        const dashData = {
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5),
        };

        res.json({ success: true, dashData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get doctor profile for Doctor Panel

const doctorProfile = async (req, res) => {
    try {
        const doctor = req.doctor; // Используем данные из токена
        const profileData = await doctorModel.findById(doctor._id).select('-password');

        res.json({ success: true, profileData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to update doctor profile data from Doctor Panel

// API to update doctor profile data from Doctor Panel
const updateDoctorProfile = async (req, res) => {
    try {
        const { docId, address, available } = req.body;

        // Логируем входные данные для отладки
        console.log('Updating doctor profile:', { docId, address, available });

        // Проверяем, существует ли доктор
        const doctor = await doctorModel.findById(docId);
        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        // Обновляем данные
        await doctorModel.findByIdAndUpdate(docId, {
            address: address, // Сохраняем address как объект { line1, line2 }
            available: available,
        });

        res.json({ success: true, message: 'Profile Updated' });
    } catch (error) {
        console.log('Error in updateDoctorProfile:', error);
        res.json({ success: false, message: error.message });
    }
};
// hello

export {
    changeAvailabity, 
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
    uploadMedicalRecord,
    downloadMedicalRecord };