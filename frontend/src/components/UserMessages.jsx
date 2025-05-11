import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import upload_area from '../assets/upload_area.png';

const UserMessages = () => {
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
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (currentConversation && socket) {
            socket.emit('join_conversation', currentConversation._id);
        }
    }, [currentConversation, socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentConversation?.messages]);

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
            } else {
                console.error('Failed to send message:', response?.message || 'Unknown error');
            }
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
                            onClick={() => setCurrentConversation(conv)}
                            className='p-2 hover:bg-gray-100 cursor-pointer rounded flex items-center gap-2'
                        >
                            <img
                                className='w-10 rounded-full'
                                src={conv.userData?.image || upload_area}
                                alt='user'
                            />
                            <div>
                                <p className='font-medium'>{conv.userData?.name || 'Doctor'}</p>
                                <p className='text-xs text-gray-500'>
                                    {conv.lastMessage?.text || 'No messages yet'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className='w-2/3 flex flex-col'>
                    {currentConversation ? (
                        <>
                            <div className='p-4 border-b font-semibold'>
                                {currentConversation.userData?.name || 'Doctor'}
                            </div>
                            <div className='flex-1 p-4 overflow-y-auto'>
                                {currentConversation.messages && currentConversation.messages.length > 0 ? (
                                    currentConversation.messages.map((msg, index) => {
                                        const isUser = msg.sender?._id === userData?._id;
                                        return (
                                            <div
                                                key={index}
                                                className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[70%] ${isUser ? 'text-right' : 'text-left'}`}>
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
                                    <p className='text-center text-gray-500'>No messages yet</p>
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

export default UserMessages;