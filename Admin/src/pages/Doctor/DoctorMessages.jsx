import React, { useContext, useEffect, useState, useRef } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { io } from 'socket.io-client';
import { assets } from '../../assets/assets';

const DoctorMessages = () => {
    const { backendUrl, getMessages, sendMessage, profileData } = useContext(DoctorContext);
    const { currency } = useContext(AppContext);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const newSocket = io(`${backendUrl}`, {
            withCredentials: true,
            extraHeaders: {
                'Access-Control-Allow-Origin': 'http://localhost:5174',
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
        setSocket(newSocket);

        const fetchConversations = async () => {
            const data = await getMessages();
            setConversations(data || []);
        };
        fetchConversations();

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error.message);
        });

        newSocket.on('new_message', (data) => {
            console.log('New message received:', data);
            if (data.messages) {
                setMessages(data.messages);
            } else {
                setMessages((prev) => [...prev, {
                    ...data,
                    sender: { _id: data.sender, name: data.senderName, email: data.senderEmail, image: data.senderImage || '' },
                    receiver: { _id: data.receiver, name: data.receiverName, email: data.receiverEmail, image: data.receiverImage || '' },
                    createdAt: data.createdAt,
                }]);
            }
            setConversations((prev) =>
                prev.map((conv) =>
                    conv._id === data.conversationId
                        ? { ...conv, lastMessage: data }
                        : conv
                )
            );
        });

        return () => newSocket.close();
    }, [backendUrl, getMessages]);

    useEffect(() => {
        if (selectedConversation && socket) {
            socket.emit('join_conversation', selectedConversation._id);
            setMessages(selectedConversation.messages || []);
        }
    }, [selectedConversation, socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (message.trim() && selectedConversation && socket) {
            const receiverId = selectedConversation.userData._id;
            const newMessage = {
                conversationId: selectedConversation._id,
                receiverId: receiverId,
                text: message,
            };
            const response = await sendMessage(newMessage);
            if (response && response.success && response.messages) {
                setMessages(response.messages);
            } else {
                console.error('Failed to send message:', response);
                // Можно добавить уведомление для пользователя, если нужно
            }
            setMessage(''); // Очищаем поле ввода после отправки
        }
    };

    return (
        <div className='w-full max-w-6xl m-5'>
            <p className='mb-3 text-lg font-medium'>Messages</p>
            <div className='flex h-[80vh] bg-white border rounded overflow-hidden'>
                <div className='w-1/3 border-r p-4 overflow-y-auto'>
                    {conversations.map((conv) => (
                        <div
                            key={conv._id}
                            onClick={() => setSelectedConversation(conv)}
                            className='p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center gap-2'
                        >
                            <img
                                className='w-10 rounded-full'
                                src={conv.userData?.image || assets.user_icon}
                                alt='user'
                            />
                            <div>
                                <p className='font-medium'>{conv.userData?.name || 'User'}</p>
                                <p className='text-xs text-gray-500'>
                                    {conv.lastMessage?.text || 'No messages yet'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className='w-2/3 flex flex-col'>
                    {selectedConversation ? (
                        <>
                            <div className='p-4 border-b font-semibold'>
                                {selectedConversation.userData?.name || 'User'}
                            </div>
                            <div className='flex-1 p-4 overflow-y-auto'>
                                {messages.map((msg, index) => {
                                    const isDoctor = msg.sender?._id === profileData._id;
                                    return (
                                        <div
                                            key={index}
                                            className={`flex mb-3 ${isDoctor ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[70%] ${isDoctor ? 'text-right' : 'text-left'}`}>
                                                <p
                                                    className={`inline-block p-3 rounded-lg ${
                                                        isDoctor
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-gray-200 text-gray-800'
                                                    }`}
                                                >
                                                    {msg.text}
                                                </p>
                                                <p className='text-xs text-gray-400 mt-1'>
                                                    {new Date(msg.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className='p-4 border-t'>
                                <div className='flex gap-2'>
                                    <input
                                        type='text'
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className='border border-[#DADADA] rounded w-full p-2'
                                        placeholder='Type a message...'
                                    />
                                    <button
                                        type='submit'
                                        className='bg-blue-500 text-white px-4 py-2 rounded'
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className='flex-1 flex items-center justify-center text-gray-500'>
                            Select a conversation to start chatting
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorMessages;