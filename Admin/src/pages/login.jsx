import React, { useState, useContext } from 'react';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [state, setState] = useState('Admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        backendUrl,
        setIsAuthenticated: setAdminAuthenticated,
        checkAuth: checkAdminAuth,
        logout: adminLogout,
    } = useContext(AdminContext);
    const {
        setIsAuthenticated: setDoctorAuthenticated,
        checkAuth: checkDoctorAuth,
        logout: doctorLogout,
        isAuthenticated: isDoctorAuthenticated, // Добавляем isAuthenticated
    } = useContext(DoctorContext);
    const navigate = useNavigate();

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const endpoint = state === 'Admin' ? '/api/admin/login' : '/api/doctor/login';
            const targetRoute = state === 'Admin' ? '/admin-dashboard' : '/doctor-dashboard';

            // Логаут другой сущности только если она авторизована
            if (state === 'Admin' && isDoctorAuthenticated) {
                await doctorLogout();
                setDoctorAuthenticated(false);
            } else if (state === 'Doctor') {
                await adminLogout();
                setAdminAuthenticated(false);
            }

            const { data } = await axios.post(
                `${backendUrl}${endpoint}`,
                { email, password },
                { withCredentials: true }
            );

            if (data.success) {
                toast.success(data.message);
                if (state === 'Admin') {
                    setAdminAuthenticated(true);
                    checkAdminAuth(); // Фоновая проверка
                } else {
                    setDoctorAuthenticated(true);
                    checkDoctorAuth(); // Фоновая проверка
                }
                navigate(targetRoute, { replace: true });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error during login:', error);
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center justify-center w-full'>
            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
                <p className='text-2xl font-semibold m-auto'>
                    <span className='text-primary'> {state} </span> Login
                </p>
                <div className='w-full'>
                    <p>Email</p>
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        className='border border-[#DADADA] rounded w-full p-2 mt-1'
                        type='email'
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <div className='w-full'>
                    <p>Password</p>
                    <input
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        className='border border-[#DADADA] rounded w-full p-2 mt-1'
                        type='password'
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <button
                    className='bg-primary text-white w-full py-2 rounded-md text-base'
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Loading...' : 'Login'}
                </button>
                {state === 'Admin' ? (
                    <p>
                        Doctor Login?{' '}
                        <span
                            className='text-primary underline cursor-pointer'
                            onClick={() => setState('Doctor')}
                        >
                            Click here
                        </span>
                    </p>
                ) : (
                    <p>
                        Admin Login?{' '}
                        <span
                            className='text-primary underline cursor-pointer'
                            onClick={() => setState('Admin')}
                        >
                            Click here
                        </span>
                    </p>
                )}
            </div>
        </form>
    );
};

export default Login;