import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const { t } = useTranslation();
    const currencySymbol = '$';
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    const [doctors, setDoctors] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const socket = io(backendUrl, { withCredentials: true });

    axios.defaults.withCredentials = true;

    // Перехватчик для обработки ошибок 401 и обновления токена
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Проверяем, есть ли refreshToken в куках
                    const refreshToken = document.cookie
                        .split('; ')
                        .find(row => row.startsWith('refreshToken='))
                        ?.split('=')[1];

                    if (!refreshToken) {
                        console.log('No refresh token found in cookies');
                        setIsAuthenticated(false);
                        setUserData(null);
                        setConversations([]);
                        toast.error(t('auth.session_expired') || 'Session expired, please log in again');
                        return Promise.reject(error);
                    }

                    try {
                        console.log('Attempting to refresh token...');
                        const { data } = await axios.post(backendUrl + '/api/user/refresh-token', {}, { withCredentials: true });
                        if (data.success) {
                            console.log('Token refreshed successfully');
                            return axios(error.config);
                        } else {
                            console.log('Refresh token request failed:', data.message);
                            setIsAuthenticated(false);
                            setUserData(null);
                            setConversations([]);
                            toast.error(t('auth.session_expired') || 'Session expired, please log in again');
                            return Promise.reject(error);
                        }
                    } catch (refreshError) {
                        console.log('Error refreshing token:', refreshError);
                        setIsAuthenticated(false);
                        setUserData(null);
                        setConversations([]);
                        toast.error(t('auth.session_expired') || 'Session expired, please log in again');
                        return Promise.reject(error);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list');
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const loadUserProfileData = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(backendUrl + '/api/user/profile', { withCredentials: true });
            if (data.success) {
                setUserData(data.userData);
                setIsAuthenticated(true);
            } else {
                setUserData(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.log('Error loading user profile:', error);
            setUserData(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const handleAuthSuccess = async () => {
        await loadUserProfileData();
    };

    const logout = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/logout', {}, { withCredentials: true });
            if (data.success) {
                setIsAuthenticated(false);
                setUserData(null);
                setConversations([]);
                toast.success(t('logout.success'));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const fetchConversations = async () => {
        if (userData?._id) {
            try {
                const { data } = await axios.get(backendUrl + `/api/user/conversations`, { withCredentials: true });
                if (data.success) {
                    setConversations(data.conversations || []);
                } else {
                    console.log('Fetch conversations failed:', data.message);
                    toast.error(t('chat.error') || 'Failed to load conversations');
                }
            } catch (error) {
                console.log('Error in fetchConversations:', error);
                toast.error(t('chat.error') || 'Failed to load conversations');
            }
        }
    };

    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/messages`,
                messageData,
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(t('chat.message_sent') || 'Message sent successfully');
                return data;
            } else {
                toast.error(data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error.response?.data?.message || t('chat.send_error') || 'Failed to send message');
            return { success: false, message: error.response?.data?.message || 'Network error' };
        }
    };

    useEffect(() => {
        loadUserProfileData();
        getDoctorsData();
    }, []);

    useEffect(() => {
        if (isAuthenticated && userData) {
            fetchConversations();
        }
    }, [isAuthenticated, userData]);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to socket (user)');
        });
        socket.on('disconnect', () => {
            console.log('Disconnected from socket (user)');
        });
        socket.on('new_message', (data) => {
            if (userData?._id) {
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv._id === data.conversationId
                            ? { ...conv, messages: data.messages, lastMessage: data.lastMessage }
                            : conv
                    )
                );
                if (currentConversation?._id === data.conversationId) {
                    setCurrentConversation((prev) => ({
                        ...prev,
                        messages: data.messages,
                        lastMessage: data.lastMessage,
                    }));
                }
            }
        });
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('new_message');
        };
    }, [socket, userData, currentConversation]);

    const value = {
        doctors,
        getDoctorsData,
        currencySymbol,
        backendUrl,
        userData,
        setUserData,
        isAuthenticated,
        setIsAuthenticated,
        loadUserProfileData,
        handleAuthSuccess,
        logout,
        conversations,
        setConversations,
        currentConversation,
        setCurrentConversation,
        socket,
        fetchConversations,
        sendMessage,
        loading,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;