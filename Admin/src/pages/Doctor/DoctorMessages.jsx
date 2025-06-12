import React, { useContext, useEffect, useState, useRef } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { io } from 'socket.io-client';
import { assets } from '../../assets/assets';
import exit_icon from '../../assets/exit.png';

const DoctorMessages = () => {
    const { backendUrl, getMessages, sendMessage, profileData } = useContext(DoctorContext);
    const { currency } = useContext(AppContext);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const sidebarRef = useRef(null);
    const touchStartX = useRef(null);

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
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error.message);
        });

        newSocket.on('new_message', (data) => {
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
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
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
            }
            setMessage('');
        }
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        if (touchStartX.current !== null) {
            const touchEndX = e.touches[0].clientX;
            const diffX = touchEndX - touchStartX.current;
            if (diffX > 50 && !isSidebarOpen) {
                setIsSidebarOpen(true);
                touchStartX.current = null;
            } else if (diffX < -50 && isSidebarOpen) {
                setIsSidebarOpen(false);
                touchStartX.current = null;
            }
        }
    };

    const handleTouchEnd = () => {
        touchStartX.current = null;
    };

    return (
        <div className='w-full max-w-6xl mx-auto my-5 flex flex-col md:flex-row'>
            <p className='mb-3 text-lg font-medium'>Messages</p>
            <div className='relative flex flex-col h-[80vh] bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden md:flex-row'>
                <div
                    ref={sidebarRef}
                    className={`fixed md:static inset-y-0 left-0 w-4/5 sm:w-2/5 md:w-1/3 bg-gray-50 p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
                        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 border-r border-gray-200 z-20`}
                >
                    <div className='flex justify-between items-center mb-4'>
                        <p className='font-semibold text-gray-900'>Messages</p>
                        <button
                            className='md:hidden bg-primary text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors'
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                    {conversations.map((conv) => (
                        <div
                            key={conv._id}
                            onClick={() => {
                                setSelectedConversation(conv);
                                setIsSidebarOpen(false);
                            }}
                            className='p-3 hover:bg-gray-100 cursor-pointer rounded-lg flex items-center gap-3 transition-colors'
                        >
                            <img
                                className='w-10 h-10 rounded-full object-cover'
                                src={conv.userData?.image || assets.user_icon}
                                alt='user'
                            />
                            <div className='flex-1'>
                                <p className='font-medium text-gray-900 text-sm'>{conv.userData?.name || 'User'}</p>
                                <p className='text-xs text-gray-500 truncate'>{conv.lastMessage?.text || 'No messages yet'}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div
                    className='w-full md:w-2/3 flex flex-col chat-container bg-gray-50'
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {selectedConversation ? (
                        <>
                            <div className='p-4 border-b bg-white flex items-center gap-3 sticky top-0 z-10'>
                                <button
                                    className='md:hidden bg-transparent p-1'
                                    onClick={() => setIsSidebarOpen(true)}
                                >
                                    <img src={exit_icon} alt='open sidebar' className='w-5 h-5' />
                                </button>
                                <p className='font-semibold text-gray-900'>{selectedConversation.userData?.name || 'User'}</p>
                            </div>
                            <div
                                ref={messagesContainerRef}
                                className='flex-1 p-4 overflow-y-auto'
                                style={{ maxHeight: 'calc(80vh - 120px)' }}
                            >
                                {messages.length > 0 ? (
                                    messages.map((msg, index) => {
                                        const isDoctor = msg.sender?._id === profileData._id;
                                        return (
                                            <div
                                                key={index}
                                                className={`flex mb-4 ${isDoctor ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] sm:max-w-[60%] p-3 rounded-2xl shadow-sm ${
                                                        isDoctor
                                                            ? 'bg-green-200 text-gray-900'
                                                            : 'bg-gray-200 text-gray-900'
                                                    }`}
                                                >
                                                    <p className='text-sm'>{msg.text}</p>
                                                    <p className='text-xs text-gray-500 mt-1 text-right'>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className='text-center text-gray-500 mt-10'>No messages yet</p>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className='p-4 border-t bg-white sticky bottom-0 z-10'>
                                <div className='flex gap-2'>
                                    <input
                                        type='text'
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className='border border-gray-300 rounded-full w-full p-2.5 text-sm focus:ring-red-500 focus:border-red-500'
                                        placeholder='Type a message...'
                                    />
                                    <button
                                        type='submit'
                                        className='bg-primary text-white px-4 py-2.5 rounded-full hover:bg-red-700 transition-colors'
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className='flex-1 flex items-center justify-center text-gray-500 bg-gray-50'>
                            Select a conversation to start chatting
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorMessages;