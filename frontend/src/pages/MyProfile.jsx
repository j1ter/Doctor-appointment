import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import profile_pic from '../assets/profile_pic.png';
import upload_area from '../assets/upload_area.png';
import { AppContext } from '../context/AppContext';
import upload_icon from '../assets/upload_icon.png';
import axios from 'axios';
import { toast } from 'react-toastify';

function MyProfile() {
  const { userData, setUserData, backendUrl, loadUserProfileData } = useContext(AppContext);
  const { t } = useTranslation();
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('phone', userData.phone);
      formData.append('address', JSON.stringify(userData.address));
      formData.append('gender', userData.gender);
      formData.append('dob', userData.dob);
      image && formData.append('image', image);

      const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, {
        withCredentials: true,
      });
      if (data.success) {
        toast.success(t('my_profile.update_success'));
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message || t('my_profile.update_error'));
      }
    } catch (error) {
      console.log('Ошибка в updateUserProfileData:', error);
      toast.error(error.response?.data?.message || t('my_profile.update_error'));
    }
  };

  return userData ? (
    <div className='max-w-lg flex flex-col gap-2 text-sm'>
      {isEdit ? (
        <label htmlFor="image">
          <div className='inline-block relative cursor-pointer'>
            <img className='w-36 rounded opacity-75' src={image ? URL.createObjectURL(image) : userData.image || profile_pic} alt="profile" />
            <img className='w-10 absolute bottom-12 right-12' src={image ? '' : upload_icon} alt="upload" />
          </div>
          <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden />
        </label>
      ) : (
        <img className='w-36 rounded' src={userData.image || profile_pic} alt="profile" />
      )}
      {isEdit ? (
        <input
          className='bg-gray-50 text-3xl font-medium max-w-60 mt-4'
          onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
          value={userData.name}
          type="text"
        />
      ) : (
        <p className='font-medium text-3xl text-neutral-800 mt-4'>{userData.name}</p>
      )}
      <hr className='bg-zinc-400 h-[1px] border-none' />
      <div>
        <p className='text-neutral-500 underline mt-3'>{t('my_profile.contact_info')}</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>{t('my_profile.email')}</p>
          <p className='text-blue-500'>{userData.email}</p>
          <p className='font-medium'>{t('my_profile.phone')}</p>
          {isEdit ? (
            <input
              className='bg-gray-100 max-w-52'
              onChange={(e) => setUserData((prev) => ({ ...prev, phone: e.target.value }))}
              value={userData.phone || ''}
              type="text"
            />
          ) : (
            <p className='text-blue-400'>{userData.phone || '-'}</p>
          )}
          <p className='font-medium'>{t('my_profile.address')}</p>
          {isEdit ? (
            <p>
              <input
                className='bg-gray-50'
                onChange={(e) => setUserData((prev) => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                value={userData.address?.line1 || ''}
                type="text"
              />
              <br />
              <input
                className='bg-gray-50'
                onChange={(e) => setUserData((prev) => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                value={userData.address?.line2 || ''}
                type="text"
              />
            </p>
          ) : (
            <p className='text-gray-500'>
              {userData.address?.line1 || '-'}
              <br />
              {userData.address?.line2 || '-'}
            </p>
          )}
        </div>
      </div>
      <div>
        <p className='text-neutral-500 underline mt-3'>{t('my_profile.basic_info')}</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>{t('my_profile.gender')}</p>
          {isEdit ? (
            <select
              className='max-w-20 bg-gray-100'
              onChange={(e) => setUserData((prev) => ({ ...prev, gender: e.target.value }))}
              value={userData.gender || ''}
            >
              <option value="Male">{t('my_profile.male')}</option>
              <option value="Female">{t('my_profile.female')}</option>
            </select>
          ) : (
            <p className='text-gray-400'>{userData.gender || '-'}</p>
          )}
          <p className='font-medium'>{t('my_profile.birthday')}</p>
          {isEdit ? (
            <input
              className='max-w-28 bg-gray-100'
              type="date"
              onChange={(e) => setUserData((prev) => ({ ...prev, dob: e.target.value }))}
              value={userData.dob || ''}
            />
          ) : (
            <p className='text-gray-400'>{userData.dob || '-'}</p>
          )}
        </div>
      </div>
      <div className='mt-10'>
        {isEdit ? (
          <button
            className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all duration-500'
            onClick={updateUserProfileData}
          >
            {t('my_profile.save_information')}
          </button>
        ) : (
          <button
            className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all duration-500'
            onClick={() => setIsEdit(true)}
          >
            {t('my_profile.edit')}
          </button>
        )}
      </div>
    </div>
  ) : (
    <p>{t('my_profile.loading')}</p>
  );
}

export default MyProfile;