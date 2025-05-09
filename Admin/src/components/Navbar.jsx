import React, { useContext } from 'react';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
    const { backendUrl, isAuthenticated: isAdminAuthenticated } = useContext(AdminContext);
    const { isAuthenticated: isDoctorAuthenticated } = useContext(DoctorContext);
    const navigate = useNavigate();

    const logout = async () => {
        try {
            const endpoint = isAdminAuthenticated
                ? '/api/admin/logout'
                : '/api/doctor/logout';
            await axios.post(`${backendUrl}${endpoint}`, {}, { withCredentials: true });
            navigate('/');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
            <div className='flex items-center gap-2 text-xs'>
                <img className='w-36 sm:w-40 cursor-pointer' src={assets.admin_logo} alt='' />
                <p className='border px-2.5 py-0.3 rounded-full border-gray-500 text-gray-600'>
                    {isAdminAuthenticated ? 'Admin' : isDoctorAuthenticated ? 'Doctor' : ''}
                </p>
            </div>
            {(isAdminAuthenticated || isDoctorAuthenticated) && (
                <button
                    onClick={logout}
                    className='bg-primary text-white text-sm px-10 py-2 rounded-full'
                >
                    Logout
                </button>
            )}
        </div>
    );
};

export default Navbar;