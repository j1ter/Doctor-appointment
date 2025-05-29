import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const Register = () => {
    const { backendUrl, isAuthenticated, handleAuthSuccess } = useContext(AppContext);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [code, setCode] = useState('');
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            if (!showCodeInput) {
                if (password !== confirmPassword) {
                    toast.error(t('login.passwordMismatch') || 'Passwords do not match');
                    setLoading(false);
                    return;
                }

                const response = await axios.post(`${backendUrl}/api/user/register`, {
                    name,
                    email,
                    password
                }, { withCredentials: true });
                const { data } = response;

                if (data.success) {
                    toast.success(t('login.codeSent') || 'Verification code sent to your email');
                    setShowCodeInput(true);
                    setUserId(data.userId);
                } else {
                    toast.error(data.message || t('login.error') || 'Registration failed');
                }
            } else {
                const response = await axios.post(`${backendUrl}/api/user/verify-code`, {
                    userId,
                    code
                }, { withCredentials: true });
                const { data } = response;

                if (data.success) {
                    toast.success(t('login.registerSuccess') || 'Registration completed successfully');
                    await handleAuthSuccess();
                    navigate('/');
                } else {
                    toast.error(data.message || t('login.invalidCode') || 'Invalid or expired code');
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('login.error') || 'An error occurred';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setShowCodeInput(false);
        setCode('');
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/my-profile');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
            <form onSubmit={onSubmitHandler} className='w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6 auth-form'>
                <h3 className='text-2xl font-semibold text-center text-gray-800'>
                    {showCodeInput ? t('login.emailVerify') : t('login.register')}
                </h3>
                <p className='text-center text-sm text-gray-500'>
                    {showCodeInput ? t('login.verifyCode') : t('login.createAccount')}
                </p>

                {!showCodeInput ? (
                    <div className='space-y-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                {t('login.name')}
                            </label>
                            <input
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition'
                                type="text"
                                onChange={(event) => setName(event.target.value)}
                                value={name}
                                required
                                placeholder={t('login.enterName') || 'Enter name'}
                                autoComplete="name"
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                {t('login.email')}
                            </label>
                            <input
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition'
                                type="email"
                                onChange={(event) => setEmail(event.target.value)}
                                value={email}
                                required
                                placeholder={t('login.emailPlaceholder') || 'example@narxoz.kz'}
                                autoComplete="email"
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                {t('login.password')}
                            </label>
                            <input
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition'
                                type="password"
                                onChange={(event) => setPassword(event.target.value)}
                                value={password}
                                required
                                placeholder={t('login.enterPassword') || 'Enter password'}
                                autoComplete="new-password"
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                {t('login.confirmPassword')}
                            </label>
                            <input
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition'
                                type="password"
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                value={confirmPassword}
                                required
                                placeholder={t('login.confirmPasswordPlaceholder') || 'Confirm password'}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            {t('login.enterVerificationCode')}
                        </label>
                        <input
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition'
                            type="text"
                            onChange={(event) => setCode(event.target.value)}
                            value={code}
                            placeholder={t('login.enterCode') || 'Enter 6-digit code'}
                            required
                            maxLength={6}
                            autoComplete="one-time-code"
                        />
                    </div>
                )}

                <button
                    type='submit'
                    className='w-full bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-400 transition font-medium'
                    disabled={loading}
                >
                    {loading ? t('loading') || 'Loading...' : (showCodeInput ? t('login.verify') : t('login.register'))}
                </button>

                {showCodeInput && (
                    <button
                        type='button'
                        onClick={handleBack}
                        className='w-full text-red-600 hover:text-red-700 text-sm font-medium text-center'
                    >
                        {t('login.back') || 'Back'}
                    </button>
                )}

                {!showCodeInput && (
                    <p className='text-center text-sm text-gray-600'>
                        {t('login.alreadyHaveAccount') || 'Already have an account? '}{' '}
                        <button
                            type='button'
                            onClick={() => navigate('/login')}
                            className='text-red-600 hover:underline font-medium'
                        >
                            {t('login.loginLink') || 'Login'}
                        </button>
                    </p>
                )}
            </form>
        </div>
    );
};

export default Register;