import React, { useContext } from 'react';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
    const { isAuthenticated: isAdminAuthenticated, logout: adminLogout } = useContext(AdminContext);
    const { isAuthenticated: isDoctorAuthenticated, logout: doctorLogout } = useContext(DoctorContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            if (isAdminAuthenticated) {
                const success = await adminLogout();
                if (success) {
                    navigate('/', { replace: true });
                }
            } else if (isDoctorAuthenticated) {
                const success = await doctorLogout();
                if (success) {
                    navigate('/', { replace: true });
                }
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
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
                    onClick={handleLogout}
                    className='bg-primary text-white text-sm px-10 py-2 rounded-full'
                >
                    Logout
                </button>
            )}
        </div>
    );
};

export default Navbar;