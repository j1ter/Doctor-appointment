import express from 'express';
import { addDoctor, allDoctors, loginAdmin, appointmentsAdmin, appointmentCancel, adminDashboard, logoutAdmin, refreshTokenAdmin, registerUser, getAllUsers } from '../controllers/adminController.js';
import upload from '../middlewares/multer.js';
import authAdmin from '../middlewares/authAdmin.js';
import debugMiddleware from '../middlewares/debugMiddleware.js';
import multerErrorHandler from '../middlewares/multerErrorHandler.js';
import { changeAvailabity } from '../controllers/doctorController.js';

const adminRouter = express.Router();
// hello
adminRouter.post('/add-doctor', debugMiddleware, authAdmin, upload.single('image'), multerErrorHandler, addDoctor);
adminRouter.post('/login', loginAdmin);
adminRouter.post('/logout', logoutAdmin);
adminRouter.post('/refresh-token', refreshTokenAdmin);
adminRouter.get('/all-doctors', authAdmin, allDoctors);
adminRouter.post('/change-availability', authAdmin, changeAvailabity);
adminRouter.get('/appointments', authAdmin, appointmentsAdmin);
adminRouter.post('/cancel-appointment', authAdmin, appointmentCancel);
adminRouter.get('/dashboard', authAdmin, adminDashboard);
adminRouter.post('/register-user', authAdmin, registerUser); // Новый маршрут
adminRouter.get('/all-users', authAdmin, getAllUsers);

export default adminRouter;

// import express from 'express';
// import { addDoctor, allDoctors, loginAdmin, appointmentsAdmin, appointmentCancel, adminDashboard, logoutAdmin, refreshTokenAdmin } from '../controllers/adminController.js';
// import upload from '../middlewares/multer.js';
// import authAdmin from '../middlewares/authAdmin.js';
// import { changeAvailabity } from '../controllers/doctorController.js';

// const adminRouter = express.Router();

// adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor);
// adminRouter.post('/login', loginAdmin);
// adminRouter.post('/logout', logoutAdmin);
// adminRouter.post('/refresh-token', refreshTokenAdmin);
// adminRouter.post('/all-doctors', authAdmin, allDoctors);
// adminRouter.post('/change-availability', authAdmin, changeAvailabity);
// adminRouter.get('/appointments', authAdmin, appointmentsAdmin)
// adminRouter.post('/cancel-appointment', authAdmin,appointmentCancel)
// adminRouter.get('/dashboard', authAdmin, adminDashboard)
// export default adminRouter;