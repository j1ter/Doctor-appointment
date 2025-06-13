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
            const { data } = await axios.post(`${backendUrl}/api/doctor/check-refresh-token`, {}, {
                withCredentials: true,
            });
            return data.hasRefreshToken;
        } catch (error) {
            console.error('Error checking doctor refresh token:', error.response?.data?.message || error.message);
            return false;
        }
    };

    // Обновление токена
    const refreshToken = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/doctor/refresh-token`, {}, {
                withCredentials: true,
            });
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
                setIsAuthenticated(false);
                return false;
            }

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
            console.log('Initiating doctor logout request...');
            const { data } = await axios.post(`${backendUrl}/api/doctor/logout`, {}, {
                withCredentials: true,
            });
            console.log('Logout response:', data);
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
            if (error.response?.status === 401) {
                setIsAuthenticated(false);
                setAppointments([]);
                setDashData(null);
                setProfileData(null);
                return true;
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
            return data;
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
            if (data.success) {
                setAppointments(data.appointments);
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
                await getProfileData();
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

    useEffect(() => {
        let refreshPromise = null;
        let retryCount = 0;
        const MAX_RETRIES = 3;

        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                console.error('Axios error (Doctor):', {
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
                            retryCount = 0;
                            return axios(originalRequest);
                        } else {
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

                retryCount = 0;
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
                await Promise.all([getAppointments(), getProfileData()]);
            }
        };
        initData();
    }, [isAuthenticated]);

    const value = {
        backendUrl,
        isAuthenticated,
        setIsAuthenticated,
        loading,
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

export default DoctorContextProvider;