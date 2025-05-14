import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoutes.js';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import http from 'http';
import { sendMessage } from './controllers/messageController.js';


// app config
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'access-control-allow-origin'], // Добавляем заголовок
  },
});
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// middlewares
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'access-control-allow-origin'],
  })
);
app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on('send_message', async (data) => {
    const { conversationId, senderId, receiverId, text } = data;
    try {
      // Находим беседу
      const conversation = await conversationModel.findById(conversationId);
      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      // Добавляем сообщение в беседу
      const newMessage = {
        sender: senderId,
        receiver: receiverId,
        text,
        createdAt: new Date(),
      };
      conversation.messages.push(newMessage);
      conversation.lastMessage = newMessage;
      await conversation.save();

      // Отправляем обновлённую беседу всем участникам
      io.to(conversationId).emit('new_message', {
        conversationId,
        messages: conversation.messages,
        lastMessage: newMessage,
      });
    } catch (error) {
      console.error('Error in send_message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('io', io);

// api endpoints
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);

app.get('/', (req, res) => {
  res.send('API WORKING');
});
// hello// hello
server.listen(port, () => console.log('Server Started on port', port));