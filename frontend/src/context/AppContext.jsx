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
    const [medicalRecords, setMedicalRecords] = useState([]); // Новое состояние для медицинских записей
    const socket = io(backendUrl, { withCredentials: true });

    axios.defaults.withCredentials = true;

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    const refreshToken = document.cookie
                        .split('; ')
                        .find(row => row.startsWith('refreshToken='))
                        ?.split('=')[1];

                    // Игнорируем ошибку "No access token provided" для неавторизованных пользователей
                    if (error.response?.data?.message === 'Unauthorized - No access token provided') {
                        console.log('No access token provided, skipping toast');
                        setIsAuthenticated(false);
                        setUserData(null);
                        setConversations([]);
                        setMedicalRecords([]); // Очищаем записи
                        return Promise.reject(error);
                    }

                    if (!refreshToken) {
                        console.log('No refresh token found in cookies');
                        setIsAuthenticated(false);
                        setUserData(null);
                        setConversations([]);
                        setMedicalRecords([]); // Очищаем записи
                        toast.error(t('auth.session_expired') || 'Session expired, please log in again');
                        return Promise.reject(error);
                    }

                    try {
                        console.log('Attempting to refresh token...');
                        const { data } = await axios.post(backendUrl + '/api/user/refresh-token', {}, { withCredentials: true });
                        if (data.success) {
                            console.log('Token refreshed successfully');
                            return axios({
                                ...error.config,
                                headers: {
                                    ...error.config.headers,
                                    'Cookie': `accessToken=${data.accessToken}; refreshToken=${refreshToken}`
                                }
                            });
                        } else {
                            console.log('Refresh token request failed:', data.message);
                            setIsAuthenticated(false);
                            setUserData(null);
                            setConversations([]);
                            setMedicalRecords([]); // Очищаем записи
                            toast.error(t('auth.session_expired') || 'Session expired, please log in again');
                            return Promise.reject(error);
                        }
                    } catch (refreshError) {
                        console.log('Error refreshing token:', refreshError);
                        setIsAuthenticated(false);
                        setUserData(null);
                        setConversations([]);
                        setMedicalRecords([]); // Очищаем записи
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
                setMedicalRecords([]); // Очищаем записи
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
                    const updatedConversations = (data.conversations || []).map(conv => {
                        if (!conv.lastMessage && conv.messages && conv.messages.length > 0) {
                            const lastMsg = conv.messages[conv.messages.length - 1];
                            return { ...conv, lastMessage: lastMsg };
                        }
                        return conv;
                    });
                    setConversations(updatedConversations);
                    return updatedConversations;
                } else {
                    console.log('Fetch conversations failed:', data.message);
                    toast.error(t('chat.error') || 'Failed to load conversations');
                    return [];
                }
            } catch (error) {
                console.log('Error in fetchConversations:', error);
                toast.error(t('chat.error') || 'Failed to load conversations');
                return [];
            }
        }
        return [];
    };

    const startConversation = async (receiverId) => {
        try {
            if (!userData?._id) {
                throw new Error(t('chat.no_user') || 'User not authenticated');
            }

            const { data } = await axios.post(
                backendUrl + '/api/user/conversations',
                { receiverId },
                { withCredentials: true }
            );

            if (data.success) {
                await fetchConversations();
                return data.conversation;
            } else {
                throw new Error(data.message || t('chat.start_error') || 'Failed to start chat');
            }
        } catch (error) {
            console.error('Error starting conversation:', error);
            toast.error(error.message || t('chat.start_error') || 'Failed to start chat');
            return null;
        }
    };

    const fetchUserAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/appointments', { withCredentials: true });
            if (data.success) {
                return data.appointments.reverse();
            } else {
                throw new Error(data.message || t('my_appointments.load_error') || 'Failed to load appointments');
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error(error.message || t('my_appointments.load_error') || 'Failed to load appointments');
            return [];
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/cancel-appointment',
                { appointmentId },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(t('my_appointments.cancel_success') || 'Appointment cancelled successfully');
                await getDoctorsData();
                return true;
            } else {
                throw new Error(data.message || t('my_appointments.cancel_error') || 'Failed to cancel appointment');
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            toast.error(error.message || t('my_appointments.cancel_error') || 'Failed to cancel appointment');
            return false;
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

    // Новая функция для загрузки медицинских записей пользователя
    const fetchUserMedicalRecords = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/medical-records', { withCredentials: true });
            if (data.success) {
                setMedicalRecords(data.records);
                return data.records;
            } else {
                throw new Error(data.message || t('my_profile.load_medical_records_error') || 'Failed to load medical records');
            }
        } catch (error) {
            console.error('Error fetching medical records:', error);
            toast.error(error.message || t('my_profile.load_medical_records_error') || 'Failed to load medical records');
            return [];
        }
    };
    const calculateAge = (dob) => {
        const today = new Date()
        const birtDate = new Date(dob)

        let age = today.getFullYear() - birtDate.getFullYear()
        return age
    }

    const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    }

    useEffect(() => {
        loadUserProfileData();
        getDoctorsData();
    }, []);

    useEffect(() => {
        if (isAuthenticated && userData) {
            fetchConversations();
            fetchUserMedicalRecords(); // Загружаем медицинские записи при аутентификации
        }
    }, [isAuthenticated, userData]);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to socket (user)');
        });
        socket.on('disconnect', () => {
            console.log('Disconnected from socket (user)');
        });
        // Убираем обработчик new_message, чтобы избежать дублирования с UserMessages.jsx
        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [socket]);

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
        startConversation,
        fetchUserAppointments,
        cancelAppointment,
        sendMessage,
        loading,
        medicalRecords, // Добавляем записи в контекст
        fetchUserMedicalRecords, // Добавляем функцию в контекст
        calculateAge,
        slotDateFormat
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;