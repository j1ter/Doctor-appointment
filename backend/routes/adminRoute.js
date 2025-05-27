import express from 'express';
import {
     addDoctor,
     allDoctors,
      loginAdmin,
       appointmentsAdmin,
        appointmentCancel,
         adminDashboard,
          logoutAdmin,
           refreshTokenAdmin,
            registerUser,
             getAllUsers,
             createArticle,
             getAllArticles,
             getArticleById,
             updateArticle,
             deleteArticle,
             deleteComment
             } from '../controllers/adminController.js';
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

// New article routes
adminRouter.post('/articles', debugMiddleware, authAdmin, upload.single('image'), multerErrorHandler, createArticle);
adminRouter.get('/articles', authAdmin, getAllArticles);
adminRouter.get('/articles/:id', authAdmin, getArticleById);
adminRouter.put('/articles/:id', debugMiddleware, authAdmin, upload.single('image'), multerErrorHandler, updateArticle);
adminRouter.delete('/articles/:id', authAdmin, deleteArticle);
adminRouter.delete('/comments/:id', authAdmin, deleteComment);

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