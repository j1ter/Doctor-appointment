import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import upload_area from '../assets/upload_area.png';
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
    const [showConversations, setShowConversations] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (currentConversation && socket) {
            socket.emit('join_conversation', currentConversation._id);
            setMessages(currentConversation.messages || []);
        }
    }, [currentConversation, socket]);

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
                    setMessages(response.messages); // Исправлено
                }
            } else {
                console.error('Failed to send message:', response?.message || 'Unknown error');
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
        return t('no-messages');
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

    return (
        <div className='w-full max-w-6xl m-5 flex flex-col md:flex-row'>
            <p className='mb-3 text-lg font-medium'>{t('my-messages')}</p>
            <div className='flex flex-col h-[80vh] bg-white border rounded overflow-hidden md:flex-row'>
                <div className={`w-full md:w-1/3 border-b md:border-r p-4 overflow-y-auto md:block ${showConversations ? 'block' : 'hidden'} conversations-list`}>
                    <button
                        className='md:hidden bg-blue-500 text-white px-4 py-2 rounded mb-4'
                        onClick={() => setShowConversations(!showConversations)}
                    >
                        {t(showConversations ? 'hide-conversations' : 'show-conversations')}
                    </button>
                    {conversations.map((conv) => (
                        <div
                            key={conv._id}
                            onClick={() => {
                                setCurrentConversation(conv);
                                setShowConversations(false);
                            }}
                            className='p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center gap-2'
                        >
                            <img
                                className='w-10 rounded-full'
                                src={conv.userData?.image || upload_area}
                                alt='user'
                            />
                            <div>
                                <p className='font-medium'>{conv.userData?.name || t('doctor')}</p>
                                <p className='text-xs text-gray-500'>
                                    {getLastMessageText(conv)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className='w-full md:w-2/3 flex flex-col chat-container'>
                    {currentConversation ? (
                        <>
                            <div className='p-4 border-b font-semibold flex items-center gap-2'>
                                <button
                                    className='md:hidden bg-gray-200 p-2 rounded'
                                    onClick={() => setShowConversations(true)}
                                >
                                    {t('back')}
                                </button>
                                {currentConversation.userData?.name || t('doctor')}
                            </div>
                            <div className='flex-1 p-4 overflow-y-auto'>
                                {messages.length > 0 ? (
                                    messages.map((msg, index) => {
                                        const isUser = msg.sender?._id === userData?._id;
                                        return (
                                            <div
                                                key={index}
                                                className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[90%] md:max-w-[70%] ${isUser ? 'text-right' : 'text-left'}`}>
                                                    <p
                                                        className={`inline-block p-3 rounded-lg ${
                                                            isUser
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
                                    })
                                ) : (
                                    <p className='text-center text-gray-500'>{t('no-messages')}</p>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className='p-4 border-t'>
                                <div className='flex gap-2'>
                                    <input
                                        type='text'
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className='border border-[#DADADA] rounded w-full p-2'
                                        placeholder={t('type-message')}
                                    />
                                    <button
                                        type='submit'
                                        className='bg-blue-500 text-white px-4 py-2 rounded'
                                    >
                                        {t('send')}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className='flex-1 flex items-center justify-center text-gray-500'>
                            {t('select-conversation')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserMessages;