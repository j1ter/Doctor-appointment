import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
   const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(null);
    const [profileData, setProfileData] = useState(null);

    // Проверка наличия doctorRefreshToken
    const checkRefreshToken = async () => {
        try {
            console.log('Checking doctor refresh token...');
            const { data } = await axios.post(`${backendUrl}/api/doctor/check-refresh-token`, {}, {
                withCredentials: true,
            });
            console.log('Check doctor refresh token response:', data);
            return data.hasRefreshToken;
        } catch (error) {
            console.error('Error checking doctor refresh token:', error.response?.data?.message || error.message);
            return false;
        }
    };

    // Обновление токена
    const refreshToken = async () => {
        try {
            console.log('Sending doctor refresh token request to:', `${backendUrl}/api/doctor/refresh-token`);
            const { data } = await axios.post(`${backendUrl}/api/doctor/refresh-token`, {}, {
                withCredentials: true,
            });
            console.log('Doctor refresh token response:', data);
            if (data.success) {
                setIsAuthenticated(true);
                await getProfileData();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error refreshing doctor token:', error.response?.data?.message || error.message);
            return false;
        }
    };

    // Проверка авторизации доктора
    const checkAuth = async () => {
        try {
            setLoading(true);
            const hasRefreshToken = await checkRefreshToken();
            if (!hasRefreshToken) {
                console.log('No doctor refresh token found');
                setIsAuthenticated(false);
                return false;
            }

            console.log('Checking doctor auth...');
            const success = await refreshToken();
            return success;
        } catch (error) {
            console.error('Doctor auth error:', error.response?.data?.message || error.message);
            setIsAuthenticated(false);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Выход из аккаунта доктора
    const logout = async () => {
        try {
            console.log('Initiating doctor logout...');
            const { data } = await axios.post(`${backendUrl}/api/doctor/logout`, {}, {
                withCredentials: true,
            });
            console.log('Doctor logout response:', data);
            if (data.success) {
                toast.success(data.message);
                setIsAuthenticated(false);
                setAppointments([]);
                setDashData(null);
                setProfileData(null);
                return true;
            }
            toast.error(data.message || 'Logout failed');
            return false;
        } catch (error) {
            console.error('Error during doctor logout:', error.response?.data?.message || error.message);
            // Игнорируем 401, если уже не авторизован
            if (error.response?.status === 401) {
                setIsAuthenticated(false);
                setAppointments([]);
                setDashData(null);
                setProfileData(null);
                return true; // Считаем логаут успешным, если токена нет
            }
            toast.error(error.response?.data?.message || 'Logout failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getProfileData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
                withCredentials: true,
            });
            if (data.success) {
                setProfileData(data.profileData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
            toast.error(error.response?.data?.message || 'Failed to load profile data');
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


    const updateProfile = async (updateData) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/doctor/update-profile`,
                updateData,
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(data.message);
                await getProfileData(); // Убедимся, что данные обновляются
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

   // Перехватчик axios
    useEffect(() => {
        let refreshPromise = null;
        let retryCount = 0; // Добавляем счетчик повторных попыток
        const MAX_RETRIES = 3; // Максимум 3 попытки

        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                console.log('Axios error (Doctor):', {
                    status: error.response?.status,
                    message: error.response?.data?.message,
                    url: originalRequest.url,
                });

                if (
                    error.response?.status === 401 &&
                    !originalRequest._retry &&
                    originalRequest.url.includes('/api/doctor') &&
                    retryCount < MAX_RETRIES
                ) {
                    originalRequest._retry = true;
                    retryCount += 1;

                    if (refreshPromise) {
                        console.log('Waiting for existing doctor refresh promise');
                        await refreshPromise;
                        return axios(originalRequest);
                    }

                    const hasRefreshToken = await checkRefreshToken();
                    if (!hasRefreshToken) {
                        console.log('No doctor refresh token available, logging out');
                        await logout();
                        return Promise.reject(error);
                    }

                    try {
                        console.log('Attempting to refresh doctor token...');
                        refreshPromise = refreshToken();
                        const success = await refreshPromise;
                        refreshPromise = null;

                        if (success) {
                            console.log('Doctor token refreshed successfully, retrying request');
                            retryCount = 0; // Сбрасываем счетчик
                            return axios(originalRequest);
                        } else {
                            console.log('Doctor refresh token failed, logging out');
                            await logout();
                            return Promise.reject(error);
                        }
                    } catch (refreshError) {
                        console.error('Error refreshing doctor token:', refreshError);
                        refreshPromise = null;
                        await logout();
                        return Promise.reject(error);
                    }
                }

                retryCount = 0; // Сбрасываем счетчик для других ошибок
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [backendUrl]);

    // Проверка авторизации при загрузке
    useEffect(() => {
        checkAuth();
    }, []);

    // Инициализация данных при авторизации
    useEffect(() => {
        const initData = async () => {
            if (isAuthenticated) {
                await Promise.all([getAppointments(), getProfileData()]);
            }
        };
        initData();
    }, [isAuthenticated]);

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