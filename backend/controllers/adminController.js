import validator from "validator";
import bcrypt from 'bcrypt';
import {v2 as cloudinary} from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken';
import appointmentModel from "../models/appointmentModel.js";
import userModel from '../models/userModel.js';

import { redis } from '../lib/redis.js';

// Helper function to generate access and refresh tokens
const generateTokens = () => {
    const accessToken = jwt.sign({ isAdmin: true }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
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
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/',
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
    });
};

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
        const deleted = await redis.del(`refresh_token_admin`);
        console.log(`Redis delete refresh_token_admin: ${deleted}`); // Логирование для отладки
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.log('Error in logoutAdmin:', error);
        res.json({ success: false, message: error.message });
    }
};

// API to refresh access token for admin
const refreshTokenAdmin = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

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
            expiresIn: '15m',
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });

        res.json({ success: true, message: 'Token refreshed successfully' });
    } catch (error) {
        console.log('Error in refreshTokenAdmin:', error);
        res.json({ success: false, message: error.message });
    }
};

// API for adding doctor
const addDoctor = async (req, res) => {
    try {

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({success: false, message: 'Missing Details'});
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({success: false, message: 'Please enter a valid email'});
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({success: false, message: 'Please enter a strong password'});
        }

        // hashing doctor password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: 'image'});
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        res.json({success: true, message: 'Doctor Added'});

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// // API for admin login
// const loginAdmin = async (req, res) => {
//     try {
//         const {email, password} = req.body

//         if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {

//             const token = jwt.sign(email + password, process.env.JWT_SECRET);
//             res.json({success: true, token});

//         } else {
//             res.json({success: false, message: 'Invalid credentials'})
//         }
//     } catch (error) {
//         console.log(error)
//         res.json({success: false, message: error.message})
//     }
// }

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password');
        res.json({success: true, doctors});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        res.json({success:true,appointments})
        
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
        
    }
}


// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

       

        await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled:true})

        //releasing doctor slot
        const {docId, slotDate, slotTime} = appointmentData
        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked
        slots_booked[slotDate] = slots_booked[slotDate].filter(e=> e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, {slots_booked})
        res.json({success:true, message:'Appointment Cancelled'})

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}


//API to get dashbord data for admin panel
const adminDashboard = async (req, res) => {

    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const  dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }

        res.json({success: true, dashData})

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }

}

export {addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard, logoutAdmin, refreshTokenAdmin };