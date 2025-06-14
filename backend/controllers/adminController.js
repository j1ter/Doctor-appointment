import validator from "validator";
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken';
import appointmentModel from "../models/appointmentModel.js";
import userModel from '../models/userModel.js';
import articleModel from '../models/articleModel.js'; // New import
import commentModel from '../models/commentModel.js'; // New import

import { redis } from '../lib/redis.js';

// Helper function to generate access and refresh tokens
const generateTokens = () => {
    const accessToken = jwt.sign({ isAdmin: true }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m', // Увеличено до 15 минут
    });

    const refreshToken = jwt.sign({ isAdmin: true }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });

    return { accessToken, refreshToken };
};

// Helper function to store refresh token in Redis
const storeRefreshToken = async (refreshToken) => {
    await redis.set(`refresh_token_admin`, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7 days
};

// Helper function to set cookies
const setCookies = (res, accessToken, refreshToken) => {
    res.cookie('adminAccessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 минут
    });
    res.cookie('adminRefreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    });
};

// API to check if refresh token exists
const checkRefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.adminRefreshToken;
        res.json({ success: true, hasRefreshToken: !!refreshToken });
    } catch (error) {
        console.log('Error in checkRefreshToken (admin):', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API for admin login
// API for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = generateTokens();
        await storeRefreshToken(refreshToken);
        setCookies(res, accessToken, refreshToken);

        res.json({
            success: true,
            admin: {
                name: 'Admin',
                email: process.env.ADMIN_EMAIL,
            },
            message: 'Login successfully!',
        });
    } catch (error) {
        console.log('Error in loginAdmin:', error);
        res.json({ success: false, message: error.message });
    }
};


// API to log out admin
const logoutAdmin = async (req, res) => {
    try {
        // Проверяем наличие refresh-токена
        const refreshToken = req.cookies.adminRefreshToken;
        if (refreshToken) {
            await redis.del(`refresh_token_admin`);
        } else {
            console.log('No refresh token found for admin');
        }

        // Очищаем куки
        res.clearCookie('adminAccessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.clearCookie('adminRefreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error during admin logout:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// API to refresh access token for admin
const refreshTokenAdmin = async (req, res) => {
    try {
        const refreshToken = req.cookies.adminRefreshToken;

        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'No refresh token provided' });
        }

        const storedToken = await redis.get(`refresh_token_admin`);
        if (storedToken !== refreshToken) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!decoded.isAdmin) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Admin access required' });
        }

        const accessToken = jwt.sign({ isAdmin: true }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '15m', // Увеличено до 15 минут
        });

        res.cookie('adminAccessToken', accessToken, { // Исправлено
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 минут
        });

        res.json({ success: true, message: 'Token refreshed successfully' });
    } catch (error) {
        console.log('Error in refreshTokenAdmin:', error);
        res.status(401).json({ success: false, message: error.message });
    }
};

// API for adding doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, address } = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !address) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        let imageUrl = '';
        if (imageFile) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'image' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(imageFile.buffer);
            });
            imageUrl = result.secure_url;
        }

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: await bcrypt.hash(password, 10),
            speciality,
            degree,
            experience,
            about,
            address: JSON.parse(address),
            date: Date.now(),
        };

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.json({ success: true, message: 'Doctor added successfully' });
    } catch (error) {
        console.log('Error in addDoctor:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password');
        res.json({ success: true, doctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });

    }
}


// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)



        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        //releasing doctor slot
        const { docId, slotDate, slotTime } = appointmentData
        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked
        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


//API to get dashbord data for admin panel
const adminDashboard = async (req, res) => {

    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}


// API to get all users for admin panel
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password');
        res.json({ success: true, users });
    } catch (error) {
        console.log('Error in getAllUsers:', error);
        res.json({ success: false, message: error.message });
    }
};

// New API: Create an article
const createArticle = async (req, res) => {
    try {
        const { title, description } = req.body;
        const imageFile = req.file;

        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Title and description are required' });
        }

        let imageUrl = '';
        if (imageFile) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'image', folder: 'articles' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(imageFile.buffer);
            });
            imageUrl = result.secure_url;
        }

        const articleData = {
            title,
            description,
            image: imageUrl,
            author: process.env.ADMIN_EMAIL // Assuming admin email as author
        };

        const newArticle = new articleModel(articleData);
        await newArticle.save();

        res.status(201).json({ success: true, message: 'Article created successfully', article: newArticle });
    } catch (error) {
        console.log('Error in createArticle:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// New API: Get all articles
const getAllArticles = async (req, res) => {
    try {
        const articles = await articleModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, articles });
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

// New API: Update an article
const updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const imageFile = req.file;

        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Title and description are required' });
        }

        const updateData = {
            title,
            description
        };

        if (imageFile) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'image', folder: 'articles' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(imageFile.buffer);
            });
            updateData.image = result.secure_url;
        }

        const updatedArticle = await articleModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedArticle) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }

        res.json({ success: true, message: 'Article updated successfully', article: updatedArticle });
    } catch (error) {
        console.log('Error in updateArticle:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// New API: Delete an article
const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await articleModel.findByIdAndDelete(id);
        if (!article) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }

        // Delete associated comments
        await commentModel.deleteMany({ article: id });

        res.json({ success: true, message: 'Article and associated comments deleted successfully' });
    } catch (error) {
        console.log('Error in deleteArticle:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// New API: Delete a comment (admin only)
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await commentModel.findByIdAndDelete(id);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }
        res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        console.log('Error in deleteComment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    addDoctor,
    loginAdmin,
    allDoctors,
    appointmentsAdmin,
    appointmentCancel,
    adminDashboard,
    logoutAdmin,
    refreshTokenAdmin,
    getAllUsers,
    createArticle,
    getAllArticles,
    getArticleById,
    updateArticle,
    deleteArticle,
    deleteComment,
    checkRefreshToken
};