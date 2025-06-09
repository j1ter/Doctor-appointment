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
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [articles, setArticles] = useState([]);
    const socket = io(backendUrl, { withCredentials: true });

    axios.defaults.withCredentials = true;

    // Определяем все функции до их использования
    const refreshAndReload = async () => {
        try {
            console.log('Sending refresh token request to:', backendUrl + '/api/user/refresh-token'); // Лог
            const { data } = await axios.post(backendUrl + '/api/user/refresh-token', {}, { withCredentials: true });
            console.log('Refresh token response:', data); // Лог
            if (data.success) {
                await loadUserProfileData();
                return true;
            }
            console.log('Refresh token failed:', data.message); // Лог
            return false;
        } catch (error) {
            console.error('Error refreshing token:', error.response?.data?.message || error.message); // Лог
            return false;
        }
    };

    const loadUserProfileData = async () => {
        try {
            setLoading(true);
            console.log('Fetching user profile...'); // Лог
            const { data } = await axios.get(backendUrl + '/api/user/profile', { withCredentials: true });
            console.log('Profile data response:', data); // Лог
            if (data.success) {
                setUserData(data.userData);
                setIsAuthenticated(true);
            } else {
                setUserData(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.log('Error loading user profile:', error.response?.data?.message || error.message); // Лог
            setUserData(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

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
                setMedicalRecords([]);
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
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        return age;
    };

    const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_');
        return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2];
    };

    const getAllArticles = async (page = 1, limit = 6) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/articles?page=${page}&limit=${limit}`);
            console.log('getAllArticles response:', data);
            if (data.success) {
                setArticles(data.articles);
                return {
                    articles: data.articles,
                    total: data.total,
                    totalPages: data.totalPages,
                    page: data.page
                };
            } else {
                toast.error(data.message || t('article.error_load') || 'Не удалось загрузить статьи');
                return { articles: [], total: 0, totalPages: 1, page: 1 };
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
            toast.error(error.response?.data?.message || t('article.error_load') || 'Не удалось загрузить статьи');
            return { articles: [], total: 0, totalPages: 1, page: 1 };
        }
    };

    const searchArticles = async (query, page = 1, limit = 6) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/articles/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`);
            console.log('searchArticles response:', data);
            if (data.success) {
                return {
                    articles: data.articles,
                    total: data.total,
                    totalPages: data.totalPages,
                    page: data.page
                };
            } else {
                toast.error(data.message || t('article.error_search') || 'Не удалось выполнить поиск');
                return { articles: [], total: 0, totalPages: 1, page: 1 };
            }
        } catch (error) {
            console.error('Error searching articles:', error);
            toast.error(error.response?.data?.message || t('article.error_search') || 'Не удалось выполнить поиск');
            return { articles: [], total: 0, totalPages: 1, page: 1 };
        }
    };

    const getArticleById = async (articleId) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/articles/${articleId}`);
            if (data.success) {
                return data.article;
            } else {
                toast.error(data.message || t('article.error_load_single') || 'Не удалось загрузить статью');
                return null;
            }
        } catch (error) {
            console.error('Error fetching article:', error);
            toast.error(error.response?.data?.message || t('article.error_load_single') || 'Не удалось загрузить статью');
            return null;
        }
    };

    const createComment = async (articleId, content) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/comments`,
                { articleId, content },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(t('article.comment_created') || 'Комментарий добавлен');
                return data.comment;
            } else {
                toast.error(data.message || t('article.error_comment') || 'Не удалось добавить комментарий');
                return null;
            }
        } catch (error) {
            console.error('Error creating comment:', error);
            toast.error(error.response?.data?.message || t('article.error_comment') || 'Не удалось добавить комментарий');
            return null;
        }
    };

    const updateComment = async (commentId, content) => {
        try {
            const { data } = await axios.put(
                `${backendUrl}/api/user/comments/${commentId}`,
                { content },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(t('article.comment_updated') || 'Комментарий обновлен');
                return data.comment;
            } else {
                toast.error(data.message || t('article.error_comment_update') || 'Не удалось обновить комментарий');
                return null;
            }
        } catch (error) {
            console.error('Error updating comment:', error);
            toast.error(error.response?.data?.message || t('article.error_comment_update') || 'Не удалось обновить комментарий');
            return null;
        }
    };

    const deleteComment = async (commentId) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/user/comments/${commentId}`, {
                withCredentials: true,
            });
            if (data.success) {
                toast.success(t('article.comment_deleted') || 'Комментарий удален');
                return true;
            } else {
                toast.error(data.message || t('article.error_comment_delete') || 'Не удалось удалить комментарий');
                return false;
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error(error.response?.data?.message || t('article.error_comment_delete') || 'Не удалось удалить комментарий');
            return false;
        }
    };

    const getCommentsByArticle = async (articleId) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/comments/${articleId}`);
            if (data.success) {
                return data.comments;
            } else {
                toast.error(data.message || t('article.error_comments') || 'Не удалось загрузить комментарии');
                return [];
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast.error(error.response?.data?.message || t('article.error_comments') || 'Не удалось загрузить комментарии');
            return [];
        }
    };

    // Перехватчик axios
    useEffect(() => {
        let refreshPromise = null;

        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                console.log('Axios error:', {
                    status: error.response?.status,
                    message: error.response?.data?.message,
                    url: originalRequest.url
                }); // Лог для отладки

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    // Проверяем, есть ли refreshToken в cookies
                    try {
                        if (refreshPromise) {
                            console.log('Waiting for existing refresh promise'); // Лог
                            await refreshPromise;
                            return axios(originalRequest);
                        }

                        console.log('Attempting to refresh token...'); // Лог
                        refreshPromise = refreshAndReload();
                        const success = await refreshPromise;
                        refreshPromise = null;

                        if (success) {
                            console.log('Token refreshed successfully, retrying request'); // Лог
                            return axios(originalRequest);
                        } else {
                            console.log('Refresh token failed, logging out'); // Лог
                            setIsAuthenticated(false);
                            setUserData(null);
                            setConversations([]);
                            setMedicalRecords([]);
                            toast.error(t('auth.session_expired') || 'Session expired, please log in again');
                            return Promise.reject(error);
                        }
                    } catch (refreshError) {
                        console.error('Error refreshing token:', refreshError); // Лог
                        setIsAuthenticated(false);
                        setUserData(null);
                        setConversations([]);
                        setMedicalRecords([]);
                        toast.error(t('auth.session_expired') || 'Session expired, please log in again');
                        refreshPromise = null;
                        return Promise.reject(error);
                    }
                }

                console.log('Non-401 error or retry failed:', error.response?.data?.message || error.message); // Лог
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [backendUrl, t, loadUserProfileData]);

    useEffect(() => {
        loadUserProfileData();
        getDoctorsData();
    }, []);

    useEffect(() => {
        if (isAuthenticated && userData) {
            fetchConversations();
            fetchUserMedicalRecords();
        }
    }, [isAuthenticated, userData]);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to socket (user)');
        });
        socket.on('disconnect', () => {
            console.log('Disconnected from socket (user)');
        });
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
        medicalRecords,
        fetchUserMedicalRecords,
        calculateAge,
        slotDateFormat,
        articles,
        getAllArticles,
        searchArticles,
        getArticleById,
        createComment,
        updateComment,
        deleteComment,
        getCommentsByArticle,
        refreshAndReload,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;