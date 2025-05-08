import doctorModel from "../models/doctorModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import appointmentModel from '../models/appointmentModel.js';
import { redis } from '../lib/redis.js';

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



// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {
        const { docId } = req.body;
        const appointments = await appointmentModel.find({docId});

        res.json({success: true, appointments});

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
    try {
        const {docId, appointmentId} = req.body;
        
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, {isCompleted: true});

            return res.json({success: true, message: 'Appointment Completed'});
        } else {
            return res.json({success: false, message: 'Mark Failed'});
        }



    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
    try {
        const {docId, appointmentId} = req.body;
        
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled: true});

            return res.json({success: true, message: 'Appointment Cancelled'});
        } else {
            return res.json({success: false, message: 'Cancellation Failed'});
        }



    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// API to get dashboard data for doctor panel

const doctorDashboard = async (req, res) => {
    try {
        const {docId} = req.body;

        const appointments = await appointmentModel.find({docId});

        let earnings = 0;

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        });

        let patients = [];

        appointments.map((item) => {
            if(!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        });

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({success: true, dashData});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// API to get doctor profile for Doctor Panel

const doctorProfile = async (req, res) => {
    try {
        const {docId} = req.body;
        const profileData = await doctorModel.findById(docId).select('-password');

        res.json({success: true, profileData});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// API to update doctor profile data from Doctor Panel

const updateDoctorProfile = async (req, res) => {
    try {
        const {docId, fees, address, available} = req.body;

        await doctorModel.findByIdAndUpdate(docId, {fees, address, available});

        res.json({success: true, message: 'Profile Updated'});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

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
    refreshTokenDoctor };