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
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(
    cors({
        origin: 'http://localhost:5173', // Убрали завершающий слеш
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);
app.options('*', cors()); // Поддержка preflight-запросов
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// api endpoints
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)
app.use('/api/conversations', conversationsRouter)
app.use('/api/messages', messageRouter)


app.get('/', (req, res) => {
    res.send('API WORKING')
});

app.listen(port, () => console.log("Server Started", port))