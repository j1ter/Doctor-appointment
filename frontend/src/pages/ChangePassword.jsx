import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const ChangePassword = () => {
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${backendUrl}/api/user/change-password`, formData, { withCredentials: true });
            const { data } = response;

            if (data.success) {
                toast.success(t('ChangePassword.success') || 'Password changed successfully');
                setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                navigate('/my-profile');
            } else {
                toast.error(data.message || t('ChangePassword.error') || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            const errorMessage = error.response?.data?.message || t('ChangePassword.error') || 'Failed to change password';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-100'>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4 p-8 bg-white rounded-xl shadow-lg w-full max-w-md'>
                <h3 className='text-2xl font-semibold text-center'>{t('ChangePassword.title')}</h3>
                <p className='text-center text-gray-600'>{t('ChangePassword.prompt')}</p>

                <div className='w-full'>
                    <label className='block text-sm font-medium text-gray-700'>{t('ChangePassword.old password')}</label>
                    <input
                        className='mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500'
                        type="password"
                        name="oldPassword"
                        onChange={handleChange}
                        value={formData.oldPassword}
                        required
                        placeholder={t('ChangePassword.enter old password')}
                        autoComplete="current-password"
                    />
                </div>
                <div className='w-full'>
                    <label className='block text-sm font-medium text-gray-700'>{t('ChangePassword.new password')}</label>
                    <input
                        className='mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500'
                        type="password"
                        name="newPassword"
                        onChange={handleChange}
                        value={formData.newPassword}
                        required
                        placeholder={t('ChangePassword.enter new password')}
                        autoComplete="new-password"
                    />
                </div>
                <div className='w-full'>
                    <label className='block text-sm font-medium text-gray-700'>{t('ChangePassword.confirm password')}</label>
                    <input
                        className='mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500'
                        type="password"
                        name="confirmPassword"
                        onChange={handleChange}
                        value={formData.confirmPassword}
                        required
                        placeholder={t('ChangePassword.confirm new password')}
                        autoComplete="new-password"
                    />
                </div>

                <button
                    type='submit'
                    className='w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed'
                    disabled={loading}
                >
                    {loading ? t('ChangePassword.loading') : t('ChangePassword.submit')}
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;