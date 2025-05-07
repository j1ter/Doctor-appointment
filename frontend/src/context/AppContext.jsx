import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const currencySymbol = '$';
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [doctors, setDoctors] = useState([]);
    const [userData, setUserData] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Настройка Axios для отправки cookies
    axios.defaults.withCredentials = true;

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
            const { data } = await axios.get(backendUrl + '/api/user/profile');
            if (data.success) {
                setUserData(data.userData);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                setUserData(false);
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            setIsAuthenticated(false);
            setUserData(false);
            toast.error(error.message);
        }
    };

    const handleAuthSuccess = async () => {
        await loadUserProfileData();
    };

    const logout = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/logout');
            if (data.success) {
                setIsAuthenticated(false);
                setUserData(false);
                toast.success('Выход выполнен успешно');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

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
    };

    useEffect(() => {
        getDoctorsData();
    }, []);

    useEffect(() => {
        loadUserProfileData();
    }, []);

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;