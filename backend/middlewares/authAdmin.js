import jwt from 'jsonwebtoken';

export const authAdmin = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({ success: false, message: 'Unauthorized - No access token provided' });
        }

        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

            if (!decoded.isAdmin) {
                return res.status(401).json({ success: false, message: 'Unauthorized - Admin access required' });
            }

            req.admin = { email: process.env.ADMIN_EMAIL, name: 'Admin' };
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Unauthorized - Access token expired' });
            }
            throw error;
        }
    } catch (error) {
        console.log('Error in authAdmin middleware:', error.message);
        return res.status(401).json({ success: false, message: 'Unauthorized - Invalid access token' });
    }
};
// hello
export default authAdmin;

// import jwt from 'jsonwebtoken';

// // admin authentication middleware
// const authAdmin = async (req, res, next) => {
//     try {

//         const {atoken} = req.headers
//         if (!atoken) {
//             return res.json({success: false, message: 'Not Authorized Login Again'});
//         }

//         const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);

//         if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
//             return res.json({success: false, message: 'Not Authorized Login Again'});
//         }

//         next()

//     } catch (error) {
//         console.log(error)
//         res.json({success: false, message: error.message})
//     }
// }

// export default authAdmin;