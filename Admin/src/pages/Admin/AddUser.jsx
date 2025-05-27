import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';

const AddUser = () => {
  const { registerUser } = useContext(AdminContext); // Извлекаем только registerUser
  const { t } = useTranslation(); // t берется из useTranslation
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!userData.email.endsWith('@narxoz.kz')) {
      toast.error(t('invalid email') || 'Email должен быть с доменом @narxoz.kz');
      setLoading(false);
      return;
    }

    if (userData.password.length < 8) {
      toast.error(t('password too short') || 'Пароль должен содержать минимум 8 символов');
      setLoading(false);
      return;
    }

    const success = await registerUser(userData);
    if (success) {
      setUserData({ name: '', email: '', password: '' });
    }
    setLoading(false);
  };

  return (
    <div className='m-5 w-full'>
      <div className='w-full max-w-4xl mx-auto my-5'>
        <h3 className='text-lg font-medium mb-5'>{t('Add user')}</h3>
        <form onSubmit={handleSubmit} className='flex flex-wrap gap-5'>
          <div className='w-full sm:w-[45%]'>
            <p className='mb-2 text-gray-600'>{t('name')}</p>
            <input
              type='text'
              className='w-full p-2 border rounded'
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              required
            />
          </div>
          <div className='w-full sm:w-[45%]'>
            <p className='mb-2 text-gray-600'>{t('email')}</p>
            <input
              type='email'
              className='w-full p-2 border rounded'
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              required
            />
          </div>
          <div className='w-full sm:w-[45%]'>
            <p className='mb-2 text-gray-600'>{t('password')}</p>
            <input
              type='password'
              className='w-full p-2 border rounded'
              value={userData.password}
              onChange={(e) => setUserData({ ...userData, password: e.target.value })}
              required
            />
          </div>
          <button
            type='submit'
            className='bg-primary text-white px-10 py-2 mt-5 rounded-full'
            disabled={loading}
          >
            {loading ? t('loading') : t('register')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;