import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export const authUser = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({ success: false, message: 'Unauthorized - No access token provided' });
        }

        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            console.log('Decoded token (User):', decoded); // Лог для отладки
            const user = await userModel.findById(decoded.userId).select('-password');

            if (!user) {
                return res.status(401).json({ success: false, message: 'User not found' });
            }

            req.user = user;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Unauthorized - Access token expired' });
            }
            throw error;
        }
    } catch (error) {
        console.log('Error in authUser middleware:', error.message);
        return res.status(401).json({ success: false, message: 'Unauthorized - Invalid access token' });
    }
};


// user authentication middleware
// const authUser = async (req, res, next) => {
//     try {

//         const {token} = req.headers
//         if (!token) {
//             return res.json({success: false, message: 'Not Authorized Login Again'});
//         }

//         const token_decode = jwt.verify(token, process.env.JWT_SECRET);

//         req.body.userId = token_decode.id

//         next()

//     } catch (error) {
//         console.log(error)
//         res.json({success: false, message: error.message})
//     }
// }

// export default authUser;