import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [users, setUsers] = useState([]);
    const [articles, setArticles] = useState([]); // Новый стейт для статей

    // Проверяем авторизацию админа
    const checkAuth = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
                withCredentials: true,
            });
            console.log('Admin auth check:', data);
            setIsAuthenticated(data.success);
            return data.success;
        } catch (error) {
            console.error('Admin auth error:', error);
            setIsAuthenticated(false);
            return false;
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
                setDashData(false);
                setUsers([]);
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            console.error('Error during logout:', error);
            toast.error(error.response?.data?.message || 'Logout failed');
            return false;
        }
    };

    // Получить все статьи
    const getAllArticles = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/articles`, {
                withCredentials: true,
            });
            if (data.success && Array.isArray(data.articles)) {
                setArticles(data.articles);
                console.log('Articles set:', data.articles);
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

    // Получить статью по ID
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

    // Создать статью
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

    // Обновить статью
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

    // Удалить статью
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

    // Удалить комментарий
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

    useEffect(() => {
        checkAuth();
    }, []);

    const getAllDoctors = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/all-doctors`, {
                withCredentials: true,
            });
            console.log('Get all doctors response:', data);
            if (data.success && Array.isArray(data.doctors)) {
                setDoctors(data.doctors);
                console.log('Doctors set:', data.doctors);
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
                console.log('Users set:', data.users);
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
                console.log(data.appointments);
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

    const getDashData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
                withCredentials: true,
            });
            if (data.success) {
                setDashData(data.dashData);
                console.log(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
        }
    };


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
        deleteComment, // Новый метод
    };

    return <AdminContext.Provider value={value}>{props.children}</AdminContext.Provider>;
};

export default AdminContextProvider;