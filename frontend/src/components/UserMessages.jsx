import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import upload_area from '../assets/upload_area.png';
import exit_icon from '../assets/exit.png';
import { useTranslation } from 'react-i18next';

const UserMessages = () => {
    const { t } = useTranslation();
    const {
        backendUrl,
        conversations,
        setConversations,
        currentConversation,
        setCurrentConversation,
        sendMessage,
        socket,
        userData,
        fetchConversations,
    } = useContext(AppContext);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const sidebarRef = useRef(null);
    const touchStartX = useRef(null);
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (currentConversation && socket) {
            socket.emit('join_conversation', currentConversation._id);
            setMessages(currentConversation.messages || []);
        }
    }, [currentConversation, socket]);

    // Прокрутка к последнему сообщению
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (message.trim() && currentConversation && userData?._id && socket) {
            const receiverId = currentConversation.userData._id;
            const newMessage = {
                conversationId: currentConversation._id,
                receiverId,
                text: message,
            };
            const response = await sendMessage(newMessage);
            if (response && response.success) {
                socket.emit('send_message', {
                    conversationId: currentConversation._id,
                    senderId: userData._id,
                    receiverId,
                    text: message,
                });
                setMessage('');
                if (response.messages) {
                    setMessages(response.messages);
                }
                // Уведомление об успехе
                console.log(t('UserMessages.send-success'));
            } else {
                console.error('Failed to send message:', response?.message || 'Unknown error');
                // Уведомление об ошибке
                console.log(t('UserMessages.send-error'));
            }
        }
    };

    const getLastMessageText = (conv) => {
        if (conv.lastMessage?.text) {
            return conv.lastMessage.text;
        }
        if (conv.messages && conv.messages.length > 0) {
            return conv.messages[conv.messages.length - 1].text;
        }
        return t('UserMessages.no-messages');
    };

    useEffect(() => {
        if (socket) {
            const handleNewMessage = (data) => {
                console.log('New message received:', data);
                if (userData?._id && data.conversationId) {
                    if (currentConversation?._id === data.conversationId) {
                        if (data.messages) {
                            setMessages(data.messages);
                        } else {
                            setMessages((prev) => [
                                ...prev,
                                {
                                    ...data,
                                    sender: {
                                        _id: data.sender,
                                        name: data.senderName,
                                        email: data.senderEmail,
                                        image: data.senderImage || '',
                                    },
                                    receiver: {
                                        _id: data.receiver,
                                        name: data.receiverName,
                                        email: data.receiverEmail,
                                        image: data.receiverImage || '',
                                    },
                                    createdAt: data.createdAt || new Date(),
                                },
                            ]);
                        }
                        setCurrentConversation((prev) => ({
                            ...prev,
                            messages: data.messages || [...prev.messages, data],
                            lastMessage: data.lastMessage || data,
                        }));
                    }
                    setConversations((prev) =>
                        prev.map((conv) =>
                            conv._id === data.conversationId
                                ? {
                                      ...conv,
                                      lastMessage: data.lastMessage || {
                                          ...data,
                                          sender: {
                                              _id: data.sender,
                                              name: data.senderName,
                                              email: data.senderEmail,
                                              image: data.senderImage || '',
                                          },
                                          receiver: {
                                              _id: data.receiver,
                                              name: data.receiverName,
                                              email: data.receiverEmail,
                                              image: data.receiverImage || '',
                                          },
                                          createdAt: data.createdAt || new Date(),
                                      },
                                  }
                                : conv
                        )
                    );
                }
            };

            socket.on('new_message', handleNewMessage);

            return () => {
                socket.off('new_message', handleNewMessage);
            };
        }
    }, [socket, userData, currentConversation, setConversations]);

    // Обработка смахивания
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
            <p className='mb-3 text-lg font-medium'>{t('UserMessages.my-messages')}</p>
            <div className='relative flex flex-col h-[80vh] bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden md:flex-row'>
                <div
                    ref={sidebarRef}
                    className={`fixed md:static inset-y-0 left-0 w-4/5 sm:w-2/5 md:w-1/3 bg-gray-50 p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
                        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 border-r border-gray-200 z-20`}
                >
                    <div className='flex justify-between items-center mb-4'>
                        <p className='font-semibold text-gray-900'>{t('UserMessages.my-messages')}</p>
                        <button
                            className='md:hidden bg-primary text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors'
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            {t('UserMessages.close')}
                        </button>
                    </div>
                    {conversations.map((conv) => (
                        <div
                            key={conv._id}
                            onClick={() => {
                                setCurrentConversation(conv);
                                setIsSidebarOpen(false);
                            }}
                            className='p-3 hover:bg-gray-100 cursor-pointer rounded-lg flex items-center gap-3 transition-colors'
                        >
                            <img
                                className='w-10 h-10 rounded-full object-cover'
                                src={conv.userData?.image || upload_area}
                                alt='user'
                            />
                            <div className='flex-1'>
                                <p className='font-medium text-gray-900 text-sm'>{conv.userData?.name || t('UserMessages.doctor')}</p>
                                <p className='text-xs text-gray-500 truncate'>{getLastMessageText(conv)}</p>
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
                    {currentConversation ? (
                        <>
                            <div className='p-4 border-b bg-white flex items-center gap-3 sticky top-0 z-10'>
                                <button
                                    className='md:hidden bg-transparent p-1'
                                    onClick={() => setIsSidebarOpen(true)}
                                >
                                    <img src={exit_icon} alt='open sidebar' className='w-5 h-5' />
                                </button>
                                <p className='font-semibold text-gray-900'>{currentConversation.userData?.name || t('UserMessages.doctor')}</p>
                            </div>
                            <div
                                ref={messagesContainerRef}
                                className='flex-1 p-4 overflow-y-auto'
                                style={{ maxHeight: 'calc(80vh - 120px)' }}
                            >
                                {messages.length > 0 ? (
                                    messages.map((msg, index) => {
                                        const isUser = msg.sender?._id === userData?._id;
                                        return (
                                            <div
                                                key={index}
                                                className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] sm:max-w-[60%] p-3 rounded-2xl shadow-sm ${
                                                        isUser
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
                                    <p className='text-center text-gray-500 mt-10'>{t('UserMessages.no-messages')}</p>
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
                                        placeholder={t('UserMessages.type-message')}
                                    />
                                    <button
                                        type='submit'
                                        className='bg-primary text-white px-4 py-2.5 rounded-full hover:bg-red-700 transition-colors'
                                    >
                                        {t('UserMessages.send')}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className='flex-1 flex items-center justify-center text-gray-500'>
                            {t('UserMessages.select-conversation')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserMessages;