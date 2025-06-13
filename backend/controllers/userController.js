import validator from 'validator';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import nodemailer from 'nodemailer';
import { redis } from '../lib/redis.js';
import { newConversation } from '../controllers/conversationsController.js';
import MedicalRecord from '../models/medicalRecordModel.js';
import articleModel from '../models/articleModel.js'; // New import
import dotenv from 'dotenv';

dotenv.config();

// Helper function to generate access and refresh tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });

    return { accessToken, refreshToken };
};

// Helper function to store refresh token in Redis
const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7 days
};

// Helper function to set cookies
const setCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minute
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

// Helper function to generate 6-digit code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to send verification code via email (asynchronous)
const sendVerificationCode = async (email, code) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: '"Clinic Booking" <your-email@gmail.com>',
            to: email,
            subject: 'Verification Code for Login',
            text: `Your verification code is: ${code}. It is valid for 10 minutes.`,
            html: `<p>Your verification code is: <strong>${code}</strong>. It is valid for 10 minutes.</p>`,
        });
    } catch (error) {
        console.error('Error sending verification code:', error);
    }
};

// API to check if refresh token exists
const checkRefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        res.json({ success: true, hasRefreshToken: !!refreshToken });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API for user registration
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Валидация входных данных
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        if (!validator.isEmail(email) || !email.endsWith('@narxoz.kz')) {
            return res.status(400).json({ success: false, message: 'Email must be a valid @narxoz.kz address' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }
        if (!validator.isLength(name, { min: 2, max: 50 })) {
            return res.status(400).json({ success: false, message: 'Name must be between 2 and 50 characters' });
        }

        // Хеширование пароля (с уменьшенным числом раундов для скорости)
        const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Проверка и создание пользователя в одном запросе
        const user = await userModel.findOneAndUpdate(
            { email },
            {
                $setOnInsert: {
                    name,
                    email,
                    password: hashedPassword,
                    isVerified: false
                }
            },
            { upsert: true, new: true }
        );

        if (!user.isNew) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Генерация и кэширование кода верификации
        const code = generateVerificationCode();
        await redis.set(`verify_code:${user._id}`, code, 'EX', 10 * 60); // 10 минут

        // Отправка email асинхронно
        sendVerificationCode(email, code).catch((err) => {
            console.error('Failed to send verification code:', err);
        });

        res.status(201).json({
            success: true,
            message: 'Verification code sent to your email',
            userId: user._id
        });
    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// API for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Валидация email
        if (!validator.isEmail(email) || !email.endsWith('@narxoz.kz')) {
            return res.status(400).json({ success: false, message: 'Email must be a valid @narxoz.kz address' });
        }

        // Проверка попыток логина
        const loginAttemptsKey = `login_attempts:${email}`;
        const attempts = await redis.get(loginAttemptsKey) || 0;
        if (parseInt(attempts) >= 5) {
            return res.status(429).json({ success: false, message: 'Too many login attempts. Try again in 15 minutes' });
        }

        // Поиск пользователя
        let user;
        const cachedUser = await redis.get(`user:${email}`);
        if (cachedUser) {
            const parsedUser = JSON.parse(cachedUser);
            // Если в кэше нет пароля, запрашиваем из базы
            if (!parsedUser.password) {
                user = await userModel.findOne({ email }).select('password name email isVerified');
            } else {
                user = parsedUser;
            }
        } else {
            user = await userModel.findOne({ email }).select('password name email isVerified');
        }

        if (!user) {
            await redis.incr(loginAttemptsKey);
            await redis.expire(loginAttemptsKey, 15 * 60); // 15 минут
            return res.status(400).json({ success: false, message: 'User does not exist' });
        }

        // Проверка пароля
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await redis.incr(loginAttemptsKey);
            await redis.expire(loginAttemptsKey, 15 * 60);
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Сбрасываем счетчик попыток
        await redis.del(loginAttemptsKey);

        // Кэшируем данные пользователя (без пароля)
        await redis.set(`user:${email}`, JSON.stringify({
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified
        }), 'EX', 3600); // 1 час

        // Генерация и кэширование кода верификации
        const code = generateVerificationCode();
        await redis.set(`verify_code:${user._id}`, code, 'EX', 10 * 60);

        // Отправка email асинхронно
        sendVerificationCode(email, code).catch((err) => {
            console.error('Failed to send verification code:', err);
        });

        res.json({
            success: true,
            message: 'Verification code sent to your email',
            userId: user._id,
        });
    } catch (error) {
        console.error('Error in loginUser:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to verify code and complete login or registration
const verifyCode = async (req, res) => {
    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            return res.status(400).json({ success: false, message: 'User ID and code are required' });
        }

        // Проверка попыток ввода кода
        const codeAttemptsKey = `code_attempts:${userId}`;
        const attempts = await redis.get(codeAttemptsKey) || 0;
        if (parseInt(attempts) >= 3) {
            return res.status(429).json({ success: false, message: 'Too many code attempts. Request a new code' });
        }

        // Проверка кода
        const storedCode = await redis.get(`verify_code:${userId}`);
        if (!storedCode || storedCode !== code) {
            await redis.incr(codeAttemptsKey);
            await redis.expire(codeAttemptsKey, 10 * 60);
            return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
        }

        // Проверка и обновление пользователя в одном запросе
        const user = await userModel.findOneAndUpdate(
            { _id: userId, isVerified: false },
            { $set: { isVerified: true } },
            { new: true }
        ) || await userModel.findById(userId).select('name email isVerified');

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        // Очистка кэша и счетчиков
        await redis.del(`verify_code:${userId}`);
        await redis.del(codeAttemptsKey);
        await redis.del(`refresh_token:${userId}`); // Инвалидируем старые токены

        // Выдача токенов
        const { accessToken, refreshToken } = generateTokens(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookies(res, accessToken, refreshToken);

        // Обновляем кэш пользователя (без пароля)
        await redis.set(`user:${user.email}`, JSON.stringify({
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified
        }), 'EX', 3600);

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
            message: 'Action completed successfully!',
        });
    } catch (error) {
        console.error('Error in verifyCode:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to log out user
const logoutUser = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decoded.userId}`);
        }

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.log('Error in logoutUser:', error);
        res.json({ success: false, message: error.message });
    }
};

// API to refresh access token
const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'No refresh token provided' });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
        if (storedToken !== refreshToken) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '15m', // Исправлено с '1d' на '15m'
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.json({ success: true, message: 'Token refreshed successfully' });
    } catch (error) {
        console.log('Error in refreshToken:', error.message); // Лог
        res.status(401).json({ success: false, message: error.message });
    }
};

// API to get user profile
const getProfile = async (req, res) => {
    try {
        const userData = await userModel.findById(req.user._id).select('-password');
        if (!userData) {
            return res.json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, userData });
    } catch (error) {
        console.log('Error in getProfile:', error);
        res.json({ success: false, message: error.message });
    }
};

// API to update user profile
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;

        if (!name || !phone || !address || !dob || !gender) {
            return res.json({ success: false, message: 'Data Missing' });
        }

        const updateData = {
            name,
            phone,
            address: JSON.parse(address),
            dob,
            gender,
        };

        // Обновляем основные данные профиля
        const updatedUser = await userModel.findByIdAndUpdate(req.user._id, updateData, { new: true });

        if (imageFile) {
            try {
                // Загружаем файл из буфера
                const imageUpload = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: 'image',
                            folder: 'user_profiles',
                        },
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        }
                    );
                    stream.end(imageFile.buffer);
                });

                const imageURL = imageUpload.secure_url;

                // Обновляем поле image в базе данных
                const imageUpdate = await userModel.findByIdAndUpdate(
                    req.user._id,
                    { image: imageURL },
                    { new: true }
                );
            } catch (cloudinaryError) {
                console.log('Error uploading to Cloudinary:', cloudinaryError);
                return res.json({ success: false, message: 'Failed to upload image to Cloudinary' });
            }
        } else {
            console.log('No file uploaded, skipping Cloudinary');
        }

        res.json({ success: true, message: 'Profile Updated' });
    } catch (error) {
        console.log('Error in updateProfile:', error);
        res.json({ success: false, message: error.message });
    }
};

// API to change password
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user._id;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'New passwords do not match' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect old password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await userModel.findByIdAndUpdate(userId, { password: hashedPassword });

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.log('Error in changePassword:', error);
        res.json({ success: false, message: error.message });
    }
};

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const formatSlotDate = (slotDate) => {
    const dateArray = slotDate.split('_');
    const day = dateArray[0];
    const month = months[Number(dateArray[1]) - 1];
    const year = dateArray[2];
    return `${day} ${month} ${year}`;
};

const sendEmailNotification = async (recipient, subject, message) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: '"Clinic Booking" <your-email@gmail.com>',
            to: recipient,
            subject,
            text: message,
            html: `<p>${message}</p>`,
        });
    } catch (error) {
        console.error('Ошибка при отправке email:', error);
    }
};

// API to book appointment
// userController.js
const bookAppointment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { docId, slotDate, slotTime } = req.body;
        const userId = req.user._id;

        // Проверяем доктора в базе данных
        const docData = await doctorModel
            .findOne({ _id: docId })
            .select('name address image available slots_booked')
            .session(session);

        if (!docData) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        if (!docData.available) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Doctor not available' });
        }

        // Проверяем, свободен ли слот
        const updateResult = await doctorModel
            .findOneAndUpdate(
                {
                    _id: docId,
                    [`slots_booked.${slotDate}`]: { $nin: [slotTime] },
                },
                {
                    $push: { [`slots_booked.${slotDate}`]: slotTime },
                },
                { session, new: true }
            );

        if (!updateResult) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Slot not available' });
        }

        // Получаем данные пользователя, включая dob
        const userData = await userModel
            .findById(userId)
            .select('name email dob') // Добавляем dob
            .session(session);
        if (!userData) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Создаем запись о бронировании
        const appointmentData = {
            userId,
            docId,
            userData: {
                name: userData.name,
                email: userData.email,
                dob: userData.dob, // Добавляем dob
            },
            docData: { name: docData.name, address: docData.address, image: docData.image },
            slotTime,
            slotDate,
            date: Date.now(),
        };

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save({ session });

        // Обновляем кэш в Redis
        await redis.set(
            `doctor:${docId}`,
            JSON.stringify({ ...docData.toObject(), slots_booked: updateResult.slots_booked }),
            'EX',
            3600
        );

        // Подтверждаем транзакцию
        await session.commitTransaction();

        // Отправляем email асинхронно
        const formattedSlotDate = formatSlotDate(slotDate);
        const message = `
            Здравствуйте, ${userData.name}!
            Вы записаны к врачу ${docData.name}.
            Дата: ${formattedSlotDate}, Время: ${slotTime}.
            Спасибо за использование нашей системы!
        `;
        sendEmailNotification(userData.email, 'Запись к врачу подтверждена', message).catch((err) => {
            console.error('Failed to send email notification:', err);
        });

        res.json({
            success: true,
            message: 'Appointment Booked',
            appointmentId: newAppointment._id,
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error in bookAppointment:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};


// API to get user appointments
const listAppointment = async (req, res) => {
    try {
        const userId = req.user._id;
        const appointments = await appointmentModel.find({ userId });
        res.json({ success: true, appointments });
    } catch (error) {
        console.log('Error in listAppointment:', error);
        res.json({ success: false, message: error.message });
    }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.user._id;

        const appointmentData = await appointmentModel.findById(appointmentId);
        if (appointmentData.userId.toString() !== userId.toString()) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);

        let slots_booked = doctorData.slots_booked;
        slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime);

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        res.json({ success: true, message: 'Appointment Cancelled' });
    } catch (error) {
        console.log('Error in cancelAppointment:', error);
        res.json({ success: false, message: error.message });
    }
};

// API to get all medical records for the current user
const getUserMedicalRecords = async (req, res) => {
    try {
        const userId = req.user._id;
        const records = await MedicalRecord.find({ student: userId })
            .populate('appointment', 'slotDate slotTime')
            .populate('doctor', 'name')
            .select('fileName fileUrl createdAt');
        res.json({ success: true, records });
    } catch (error) {
        console.log('Error in getUserMedicalRecords:', error);
        res.json({ success: false, message: error.message });
    }
};

// API: Search articles by title
const searchArticles = async (req, res) => {
    try {
        const { query } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }

        const articles = await articleModel
            .find({
                title: { $regex: query, $options: 'i' } // Case-insensitive search
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await articleModel.countDocuments({
            title: { $regex: query, $options: 'i' }
        });

        res.json({ success: true, articles, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.log('Error in searchArticles:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Обновленный API: Get all articles
const getAllArticles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        const articles = await articleModel
            .find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await articleModel.countDocuments();

        res.json({ success: true, articles, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.log('Error in getAllArticles:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// New API: Get article by ID
const getArticleById = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await articleModel.findById(id);
        if (!article) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }
        res.json({ success: true, article });
    } catch (error) {
        console.log('Error in getArticleById:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
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
    verifyCode,
    changePassword,
    searchArticles,
    getAllArticles,
    getArticleById,
    checkRefreshToken
};
