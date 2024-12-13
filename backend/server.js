import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// api endpoints
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

// Serve admin panel at /admin
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});

// Serve frontend at root
app.use(express.static(path.join(__dirname, 'public/frontend')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/frontend/index.html'));
});

app.listen(port, () => console.log("Server Started", port))