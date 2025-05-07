import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoutes.js';
import conversationsRouter from './routes/conversationsRoute.js';
import messageRouter from './routes/messagesRoute.js';
import cookieParser from 'cookie-parser';

// app config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// middlewares
app.use(
  cors({
    origin: 'http://localhost:5173', // Указываем точный origin фронтенда
    credentials: true, // Разрешаем отправку куки
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// api endpoints
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/messages', messageRouter);

app.get('/', (req, res) => {
  res.send('API WORKING');
});

app.listen(port, () => console.log("Server Started", port));