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
    const [userData, setUserData] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const socket = io(backendUrl, { withCredentials: true });

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
                toast.error(data.message);
                setIsAuthenticated(false);
                setUserData(false);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
            setIsAuthenticated(false);
            setUserData(false);
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
        if (userData._id) {
            try {
                const { data } = await axios.get(backendUrl + `/api/conversations/${userData._id}`, { withCredentials: true });
                setConversations(data);
            } catch (error) {
                console.log(error);
                toast.error(t('chat.error'));
            }
        }
    };

    useEffect(() => {
        getDoctorsData();
        if (isAuthenticated) {
            fetchConversations();
        }
    }, [isAuthenticated, userData]);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to socket');
        });
        socket.on('disconnect', () => {
            console.log('Disconnected from socket');
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
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;