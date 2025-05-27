import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const { backendUrl, isAuthenticated, handleAuthSuccess } = useContext(AppContext);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            if (!showCodeInput) {
                // Отправка email и пароля
                const response = await axios.post(`${backendUrl}/api/user/login`, { email, password }, { withCredentials: true });
                const { data } = response;

                if (data.success) {
                    toast.success(t('login.code_sent') || 'Код подтверждения отправлен на ваш email');
                    setShowCodeInput(true);
                    setUserId(data.userId);
                } else {
                    toast.error(data.message || t('login.error') || 'Ошибка входа');
                }
            } else {
                // Проверка кода подтверждения
                const response = await axios.post(`${backendUrl}/api/user/verify-code`, { userId, code }, { withCredentials: true });
                const { data } = response;

                if (data.success) {
                    toast.success(t('login.login_success') || 'Вход выполнен успешно');
                    await handleAuthSuccess();
                    navigate('/');
                } else {
                    toast.error(data.message || t('login.invalid_code') || 'Неверный или просроченный код');
                }
            }
        } catch (error) {
            console.error('Error in onSubmitHandler:', error);
            const errorMessage = error.response?.data?.message || t('login.error') || 'Произошла ошибка';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/my-profile');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className='min-h-screen flex items-center justify-center'>
            <form onSubmit={onSubmitHandler} className='flex flex-col gap-4 p-8 bg-white rounded-xl shadow-lg w-full max-w-md'>
                <h3 className='text-2xl font-semibold text-center'>
                    {showCodeInput ? t('login.email_verify') : t('login.login')}
                </h3>
                <p className='text-center text-gray-600'>
                    {showCodeInput ? t('login.verify_code') : t('login.login')}
                </p>

                {!showCodeInput ? (
                    <>
                        <div className='w-full'>
                            <label className='block text-sm font-medium text-gray-700'>{t('login.email')}</label>
                            <input
                                className='mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                                type="email"
                                onChange={(event) => setEmail(event.target.value)}
                                value={email}
                                required
                                placeholder="example@narxoz.kz"
                                autoComplete="email"
                            />
                        </div>
                        <div className='w-full'>
                            <label className='block text-sm font-medium text-gray-700'>{t('login.password')}</label>
                            <input
                                className='mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                                type="password"
                                onChange={(event) => setPassword(event.target.value)}
                                value={password}
                                required
                                placeholder="Введите пароль"
                                autoComplete="password"
                            />
                        </div>
                    </>
                ) : (
                    <div className='w-full'>
                        <label className='block text-sm font-medium text-gray-700'>{t('login.enter_verification_code')}</label>
                        <input
                            className='mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                            type="text"
                            onChange={(event) => setCode(event.target.value)}
                            value={code}
                            placeholder={t('login.enter_code') || 'Введите 6-значный код'}
                            required
                            maxLength={6}
                            autoComplete="one-time-code"
                        />
                    </div>
                )}

                <button
                    type='submit'
                    className='w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo'
                    disabled={loading}
                >
                    {loading ? t('loading') || 'Загрузка...' : (showCodeInput ? t('login.verify') : t('login.submit'))}
                </button>
            </form>
        </div>
    );
};

export default Login;