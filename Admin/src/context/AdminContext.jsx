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
    };

    return <AdminContext.Provider value={value}>{props.children}</AdminContext.Provider>;
};

export default AdminContextProvider;