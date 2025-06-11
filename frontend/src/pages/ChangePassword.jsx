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
                toast.success(t('change_password.success') || 'Пароль успешно изменен');
                setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                navigate('/my-profile');
            } else {
                toast.error(data.message || t('change_password.error') || 'Ошибка смены пароля');
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            const errorMessage = error.response?.data?.message || t('change_password.error') || 'Произошла ошибка';
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
                <h3 className='text-2xl font-semibold text-center'>{t('change_password.title')}</h3>
                <p className='text-center text-gray-600'>{t('change_password.prompt')}</p>

                <div className='w-full'>
                    <label className='block text-sm font-medium text-gray-700'>{t('change_password.old_password')}</label>
                    <input
                        className='mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                        type="password"
                        name="oldPassword"
                        onChange={handleChange}
                        value={formData.oldPassword}
                        required
                        placeholder={t('change_password.enter_old_password')}
                        autoComplete="current-password"
                    />
                </div>
                <div className='w-full'>
                    <label className='block text-sm font-medium text-gray-700'>{t('change_password.new_password')}</label>
                    <input
                        className='mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                        type="password"
                        name="newPassword"
                        onChange={handleChange}
                        value={formData.newPassword}
                        required
                        placeholder={t('change_password.enter_new_password')}
                        autoComplete="new-password"
                    />
                </div>
                <div className='w-full'>
                    <label className='block text-sm font-medium text-gray-700'>{t('change_password.confirm_password')}</label>
                    <input
                        className='mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                        type="password"
                        name="confirmPassword"
                        onChange={handleChange}
                        value={formData.confirmPassword}
                        required
                        placeholder={t('change_password.confirm_new_password')}
                        autoComplete="new-password"
                    />
                </div>

                <button
                    type='submit'
                    className='w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed'
                    disabled={loading}
                >
                    {loading ? t('change_password.loading') || 'Загрузка...' : t('change_password.submit')}
                </button>
            </form>
        </div>
    );//asda
};

export default ChangePassword;