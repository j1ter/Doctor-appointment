import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { useTranslation } from 'react-i18next';

const UsersList = () => {
  const { users, getAllUsers, isAuthenticated } = useContext(AdminContext);
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) {
      getAllUsers();
    }
  }, [isAuthenticated, getAllUsers]);

  return (
    <div className='m-5'>
      <h3 className='text-lg font-medium mb-5'>{t('admin.user_list')}</h3>
      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='grid grid-cols-[1fr_2fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>{t('admin.name')}</p>
          <p>{t('admin.email')}</p>
          <p>{t('admin.registered_on')}</p>
        </div>
        {users.length > 0 ? (
          users.map((user, index) => (
            <div
              className='grid grid-cols-[1fr_2fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50'
              key={user._id || index}
            >
              <p>{user.name}</p>
              <p>{user.email}</p>
              <p>{new Date(user.date).toLocaleDateString()}</p>
            </div>
          ))
        ) : (
          <p className='text-gray-500 px-6 py-3'>{t('admin.no_users')}</p>
        )}
      </div>
    </div>
  );
};

export default UsersList;