import jwt from 'jsonwebtoken';
import doctorModel from '../models/doctorModel.js';

export const authDoctor = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({ success: false, message: 'Unauthorized - No access token provided' });
        }

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        console.log('Decoded token (Doctor):', decoded); // Лог для отладки
        const doctor = await doctorModel.findById(decoded.docId).select('-password');

        if (!doctor) {
            return res.status(401).json({ success: false, message: 'Doctor not found' });
        }

        req.doctor = doctor;
        next();
    } catch (error) {
        console.log('Error in authDoctor middleware:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Unauthorized - Access token expired' });
        }
        return res.status(401).json({ success: false, message: 'Unauthorized - Invalid access token' });
    }
};

export default authDoctor;


// import jwt from 'jsonwebtoken';

// // doctor authentication middleware
// const authDoctor = async (req, res, next) => {
//     try {

//         const {dtoken} = req.headers
//         if (!dtoken) {
//             return res.json({success: false, message: 'Not Authorized Login Again'});
//         }

//         const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);

//         req.body.docId = token_decode.id

//         next()

//     } catch (error) {
//         console.log(error)
//         res.json({success: false, message: error.message})
//     }
// }

// export default authDoctor;