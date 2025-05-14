import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Добавляем состояние загрузки
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [profileData, setProfileData] = useState(false);

    // Проверяем авторизацию доктора при монтировании
    useEffect(() => {
        const initAuthCheck = async () => {
            setLoading(true);
            const isAuth = await checkAuth();
            setIsAuthenticated(isAuth);
            if (isAuth) {
                await getProfileData(); // Загружаем данные профиля, чтобы иметь ID доктора
            }
            setLoading(false);
        };
        initAuthCheck();
    }, []);

    const checkAuth = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
                withCredentials: true,
            });
            console.log('Doctor auth check:', data);
            setIsAuthenticated(data.success);
            return data.success;
        } catch (error) {
            console.error('Doctor auth error:', error);
            setIsAuthenticated(false);
            return false;
        }
    };

    const getMessages = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/doctor/conversations`, {
                withCredentials: true,
            });
            if (data.success) {
                return data.conversations || [];
            } else {
                toast.error(data.message);
                return [];
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            toast.error(error.response?.data?.message || error.message);
            return [];
        }
    };

    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/doctor/messages`,
                messageData,
                { withCredentials: true }
            );
            if (data.success) {
                toast.success('Message sent successfully');
            } else {
                toast.error(data.message);
            }
            return data; // Возвращаем данные от сервера
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || 'Network error' };
        }
    };

    // const sendMessage = async (messageData) => {
    //     try {
    //         const { data } = await axios.post(
    //             `${backendUrl}/api/doctor/messages`,
    //             messageData,
    //             { withCredentials: true }
    //         );
    //         if (data.success) {
    //             toast.success('Message sent successfully');
    //         } else {
    //             toast.error(data.message);
    //         }
    //     } catch (error) {
    //         console.error('Error sending message:', error);
    //         toast.error(error.response?.data?.message || error.message);
    //     }
    // };

    const logout = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/doctor/logout`, {}, {
                withCredentials: true,
            });
            if (data.success) {
                toast.success(data.message);
                setIsAuthenticated(false);
                setAppointments([]);
                setDashData(false);
                setProfileData(false);
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

    const getAppointments = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, {
                withCredentials: true,
            });
            console.log('getAppointments response:', data); // Лог для отладки
            if (data.success) {
                setAppointments(data.appointments);
                console.log('Appointments set:', data.appointments);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const completeAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/doctor/complete-appointment`,
                { appointmentId },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(data.message);
                getAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/doctor/cancel-appointment`,
                { appointmentId },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(data.message);
                getAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const getDashData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
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
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const getProfileData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
                withCredentials: true,
            });
            if (data.success) {
                setProfileData(data.profileData);
                console.log(data.profileData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const updateProfile = async (updateData) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/doctor/update-profile`,
                updateData,
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(data.message);
                getProfileData();
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            return false;
        }
    };

    const value = {
        backendUrl,
        isAuthenticated,
        setIsAuthenticated,
        loading, // Добавляем loading в контекст
        checkAuth,
        logout,
        appointments,
        setAppointments,
        getAppointments,
        completeAppointment,
        cancelAppointment,
        dashData,
        setDashData,
        getDashData,
        profileData,
        setProfileData,
        getProfileData,
        updateProfile,
        getMessages,
        sendMessage
    };

    return <DoctorContext.Provider value={value}>{props.children}</DoctorContext.Provider>;
};
// hello
export default DoctorContextProvider;