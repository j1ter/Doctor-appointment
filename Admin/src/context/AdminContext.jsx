import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(null);
    const [users, setUsers] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Проверка наличия adminRefreshToken
    const checkRefreshToken = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/check-refresh-token`, {}, {
                withCredentials: true,
            });
            return data.hasRefreshToken;
        } catch (error) {
            console.error('Error checking admin refresh token:', error.response?.data?.message || error.message);
            return false;
        }
    };

    // Обновление токена
    const refreshToken = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/refresh-token`, {}, {
                withCredentials: true,
            });
            if (data.success) {
                setIsAuthenticated(true);
                await getDashData();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error refreshing admin token:', error.response?.data?.message || error.message);
            return false;
        }
    };

    // Проверка авторизации админа
    const checkAuth = async () => {
        try {
            setLoading(true);
            const hasRefreshToken = await checkRefreshToken();
            if (!hasRefreshToken) {
                setIsAuthenticated(false);
                return false;
            }

            const success = await refreshToken();
            return success;
        } catch (error) {
            console.error('Admin auth error:', error.response?.data?.message || error.message);
            setIsAuthenticated(false);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Логаут админа
    const logout = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/logout`, {}, {
                withCredentials: true,
            });
            if (data.success) {
                toast.success(data.message);
                setIsAuthenticated(false);
                setDoctors([]);
                setAppointments([]);
                setDashData(null);
                setUsers([]);
                setArticles([]);
                return true;
            }
            toast.error(data.message || 'Logout failed');
            return false;
        } catch (error) {
            console.error('Error during admin logout:', error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || 'Logout failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getDashData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
                withCredentials: true,
            });
            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error(error.response?.data?.message || 'Failed to load dashboard data');
        }
    };

    const getAllArticles = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/articles`, {
                withCredentials: true,
            });
            if (data.success && Array.isArray(data.articles)) {
                setArticles(data.articles);
            } else {
                toast.error(data.message || 'Статьи не найдены');
                setArticles([]);
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
            toast.error(error.response?.data?.message || 'Не удалось загрузить статьи');
            setArticles([]);
        }
    };

    const getArticleById = async (articleId) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/articles/${articleId}`, {
                withCredentials: true,
            });
            if (data.success) {
                return data.article;
            } else {
                toast.error(data.message || 'Статья не найдена');
                return null;
            }
        } catch (error) {
            console.error('Error fetching article:', error);
            toast.error(error.response?.data?.message || 'Не удалось загрузить статью');
            return null;
        }
    };

    const createArticle = async (articleData) => {
        try {
            const formData = new FormData();
            formData.append('title', articleData.title);
            formData.append('description', articleData.description);
            if (articleData.image) {
                formData.append('image', articleData.image);
            }

            const { data } = await axios.post(`${backendUrl}/api/admin/articles`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (data.success) {
                toast.success(data.message || 'Статья успешно создана');
                getAllArticles();
                return true;
            } else {
                toast.error(data.message || 'Ошибка создания статьи');
                return false;
            }
        } catch (error) {
            console.error('Error creating article:', error);
            toast.error(error.response?.data?.message || 'Не удалось создать статью');
            return false;
        }
    };

    const updateArticle = async (articleId, articleData) => {
        try {
            const formData = new FormData();
            formData.append('title', articleData.title);
            formData.append('description', articleData.description);
            if (articleData.image) {
                formData.append('image', articleData.image);
            }

            const { data } = await axios.put(`${backendUrl}/api/admin/articles/${articleId}`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (data.success) {
                toast.success(data.message || 'Статья успешно обновлена');
                getAllArticles();
                return true;
            } else {
                toast.error(data.message || 'Ошибка обновления статьи');
                return false;
            }
        } catch (error) {
            console.error('Error updating article:', error);
            toast.error(error.response?.data?.message || 'Не удалось обновить статью');
            return false;
        }
    };

    const deleteArticle = async (articleId) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/admin/articles/${articleId}`, {
                withCredentials: true,
            });
            if (data.success) {
                toast.success(data.message || 'Статья успешно удалена');
                getAllArticles();
                return true;
            } else {
                toast.error(data.message || 'Ошибка удаления статьи');
                return false;
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            toast.error(error.response?.data?.message || 'Не удалось удалить статью');
            return false;
        }
    };

    const deleteComment = async (commentId) => {
        try {
            const { data } = await axios.delete(`${backendUrl}/api/admin/comments/${commentId}`, {
                withCredentials: true,
            });
            if (data.success) {
                toast.success(data.message || 'Комментарий успешно удален');
                return true;
            } else {
                toast.error(data.message || 'Ошибка удаления комментария');
                return false;
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error(error.response?.data?.message || 'Не удалось удалить комментарий');
            return false;
        }
    };

    const getAllDoctors = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/all-doctors`, {
                withCredentials: true,
            });
            if (data.success && Array.isArray(data.doctors)) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message || 'No doctors found');
                setDoctors([]);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch doctors');
            setDoctors([]);
        }
    };

    const getAllUsers = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/all-users`, {
                withCredentials: true,
            });
            if (data.success && Array.isArray(data.users)) {
                setUsers(data.users);
            } else {
                toast.error(data.message || 'No users found');
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch users');
            setUsers([]);
        }
    };

    const changeAvailability = async (docId) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/admin/change-availability`,
                { docId },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(data.message);
                getAllDoctors();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to change availability');
        }
    };

    const getAllAppointments = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/appointments`, {
                withCredentials: true,
            });
            if (data.success) {
                setAppointments(data.appointments);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to fetch appointments');
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/admin/cancel-appointment`,
                { appointmentId },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(data.message);
                getAllAppointments();
                getDashData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to cancel appointment');
        }
    };

    useEffect(() => {
        let refreshPromise = null;

        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                console.error('Axios error (Admin):', {
                    status: error.response?.status,
                    message: error.response?.data?.message,
                    url: originalRequest.url,
                });

                if (
                    error.response?.status === 401 &&
                    !originalRequest._retry &&
                    originalRequest.url.includes('/api/admin')
                ) {
                    originalRequest._retry = true;

                    if (refreshPromise) {
                        await refreshPromise;
                        return axios(originalRequest);
                    }

                    const hasRefreshToken = await checkRefreshToken();
                    if (!hasRefreshToken) {
                        await logout();
                        return Promise.reject(error);
                    }

                    try {
                        refreshPromise = refreshToken();
                        const success = await refreshPromise;
                        refreshPromise = null;

                        if (success) {
                            return axios(originalRequest);
                        } else {
                            await logout();
                            return Promise.reject(error);
                        }
                    } catch (refreshError) {
                        console.error('Error refreshing admin token:', refreshError);
                        refreshPromise = null;
                        await logout();
                        return Promise.reject(error);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [backendUrl]);

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        const initData = async () => {
            if (isAuthenticated) {
                await Promise.all([
                    getAllDoctors(),
                    getAllUsers(),
                    getAllAppointments(),
                    getAllArticles(),
                ]);
            }
        };
        initData();
    }, [isAuthenticated]);

    const value = {
        backendUrl,
        isAuthenticated,
        setIsAuthenticated,
        checkAuth,
        logout,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        getAllAppointments,
        cancelAppointment,
        dashData,
        setDashData,
        getDashData,
        users,
        getAllUsers,
        articles,
        getAllArticles,
        getArticleById,
        createArticle,
        updateArticle,
        deleteArticle,
        deleteComment,
    };

    return <AdminContext.Provider value={value}>{props.children}</AdminContext.Provider>;
};

export default AdminContextProvider;