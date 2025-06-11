import jwt from 'jsonwebtoken';
import doctorModel from '../models/doctorModel.js';

const authDoctor = async (req, res, next) => {
    try {
        const token = req.cookies.doctorAccessToken;
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const doctor = await doctorModel.findById(decoded.docId).select('-password');
        if (!doctor) {
            return res.status(401).json({ success: false, message: 'Doctor not found' });
        }

        req.doctor = doctor;
        next();
    } catch (error) {
        console.error('Error in authDoctor:', error.message);
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

export default authDoctor;