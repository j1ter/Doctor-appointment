import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

function Login() {
    const { backendUrl, isAuthenticated, handleAuthSuccess } = useContext(AppContext);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [state, setState] = useState('Sign Up');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
// hello
    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            let response;
            if (state === 'Sign Up') {
                response = await axios.post(backendUrl + '/api/user/register', { name, password, email }, { withCredentials: true });
            } else {
                response = await axios.post(backendUrl + '/api/user/login', { password, email }, { withCredentials: true });
            }

            const { data } = response;
            if (data.success) {
                toast.success(state === 'Sign Up' ? t('login.signup_success') : t('login.login_success'));
                await handleAuthSuccess();
                navigate('/');
            } else {
                toast.error(data.message || t('login.error'));
            }
        } catch (error) {
            console.log('Ошибка в onSubmitHandler:', error);
            const errorMessage = error.response?.data?.message || error.message || t('login.error');
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    return (
        <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
                <p className='text-2xl font-semibold'>{state === 'Sign Up' ? t('login.create_account') : t('login.login')}</p>
                <p>{state === 'Sign Up' ? t('login.signup_prompt') : t('login.login_prompt')}</p>
                {state === 'Sign Up' && (
                    <div className='w-full'>
                        <p>{t('login.full_name')}</p>
                        <input
                            className='border border-zinc-300 rounded w-full p-2 mt-1'
                            type="text"
                            onChange={(event) => setName(event.target.value)}
                            value={name}
                            required
                        />
                    </div>
                )}

                <div className='w-full'>
                    <p>{t('login.email')}</p>
                    <input
                        className='border border-zinc-300 rounded w-full p-2 mt-1'
                        type="email"
                        onChange={(event) => setEmail(event.target.value)}
                        value={email}
                        required
                        autoComplete="email"
                    />
                </div>
                <div className='w-full'>
                    <p>{t('login.password')}</p>
                    <input
                        className='border border-zinc-300 rounded w-full p-2 mt-1'
                        type="password"
                        onChange={(event) => setPassword(event.target.value)}
                        value={password}
                        required
                        autoComplete="current-password"
                    />
                </div>
                <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>
                    {state === 'Sign Up' ? t('login.create_account') : t('login.login')}
                </button>
                {state === 'Sign Up' ? (
                    <p>
                        {t('login.already_have_account')}{' '}
                        <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>
                            {t('login.login')}
                        </span>
                    </p>
                ) : (
                    <p>
                        {t('login.create_new_account')}{' '}
                        <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>
                            {t('login.create_account')}
                        </span>
                    </p>
                )}
            </div>
        </form>
    );
}

export default Login;