import React, { useContext, useEffect } from 'react';
import Login from './pages/login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext';
import { DoctorContext } from './context/DoctorContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllApponitments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import DoctorMessages from './pages/Doctor/DoctorMessages';
import UserProfile from './pages/Doctor/UserProfile';
import UsersList from './pages/Admin/UsersList';
import AddArticle from './pages/Admin/AddArticle'; // Новый импорт
import ArticlesList from './pages/Admin/ArticlesList'; // Новый импорт
import ArticleDetails from './pages/Admin/ArticleDetails'; // Новый импорт

const App = () => {
    const { isAuthenticated: isAdminAuthenticated, loading: adminLoading } = useContext(AdminContext) || { isAuthenticated: false, loading: true };
    const { isAuthenticated: isDoctorAuthenticated, loading: doctorLoading } = useContext(DoctorContext) || { isAuthenticated: false, loading: true };

    useEffect(() => {
        console.log('App.jsx: adminLoading:', adminLoading, 'isAdminAuthenticated:', isAdminAuthenticated);
        console.log('App.jsx: doctorLoading:', doctorLoading, 'isDoctorAuthenticated:', isDoctorAuthenticated);
    }, [adminLoading, isAdminAuthenticated, doctorLoading, isDoctorAuthenticated]);

    // Показываем экран загрузки, пока идет проверка авторизации
    if (adminLoading || doctorLoading) {
        return (
            <div className='bg-[#F8F9FD] h-screen flex items-center justify-center'>
                <p className='text-lg text-gray-600'>Загрузка...</p>
            </div>
        );
    }

    return (
        <div className='bg-[#F8F9FD]'>
            <ToastContainer />
            {(isAdminAuthenticated || isDoctorAuthenticated) && <Navbar />}
            <div className='flex items-start'>
                {(isAdminAuthenticated || isDoctorAuthenticated) && <Sidebar />}
                <Routes>
                    <Route path='/' element={<Login />} />
                    {isAdminAuthenticated ? (
                        <>
                            <Route path='/admin-dashboard' element={<Dashboard />} />
                            <Route path='/all-appointments' element={<AllAppointments />} />
                            <Route path='/add-doctor' element={<AddDoctor />} />
                            <Route path='/doctor-list' element={<DoctorsList />} />
                            <Route path='/users-list' element={<UsersList />} />
                            <Route path='/add-article' element={<AddArticle />} />
                            <Route path='/articles-list' element={<ArticlesList />} />
                            <Route path='/article-details/:id' element={<ArticleDetails />} />
                            <Route path='*' element={<Navigate to='/admin-dashboard' replace />} />
                        </>
                    ) : isDoctorAuthenticated ? (
                        <>
                            <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
                            <Route path='/doctor-appointments' element={<DoctorAppointments />} />
                            <Route path='/doctor-profile' element={<DoctorProfile />} />
                            <Route path='/doctor-messages' element={<DoctorMessages />} />
                            <Route path='/doctor/user-profile/:userId' element={<UserProfile />} />
                            <Route path='*' element={<Navigate to='/doctor-dashboard' replace />} />
                        </>
                    ) : (
                        <Route path='*' element={<Navigate to='/' replace />} />
                    )}
                </Routes>
            </div>
        </div>
    );
};

export default App;