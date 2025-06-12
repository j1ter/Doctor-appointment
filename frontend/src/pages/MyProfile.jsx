import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import profile_pic from '../assets/profile_pic.png';
import upload_icon from '../assets/upload_icon.png';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MyProfile = () => {
  const { userData, setUserData, backendUrl, loadUserProfileData, medicalRecords, slotDateFormat } = useContext(AppContext);
  const { t } = useTranslation();
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('phone', userData.phone);
      formData.append('address', JSON.stringify(userData.address));
      formData.append('gender', userData.gender);
      formData.append('dob', userData.dob);
      if (image) {
        formData.append('image', image);
      }

      const { data } = await axios.post(`${backendUrl}/api/user/update-profile`, formData, {
        withCredentials: true,
      });

      if (data.success) {
        toast.success(t('my_profile.update_success'));
        await loadUserProfileData();
        setIsEdit(false);
        setImage(null);
      } else {
        toast.error(data.message || t('my_profile.update_error'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('my_profile.update_error'));
    }
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await axios.get(`${backendUrl}${fileUrl}`, {
        withCredentials: true,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName.split('_').slice(1).join('_') || fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(error.response?.data?.message || t('my_profile.download_error') || 'Failed to download file');
    }
  };

  return userData ? (
    <div className='flex flex-col gap-2 text-sm'>
      {/* Profile Section */}
      <div className='max-w-lg'>
        {isEdit ? (
          <label htmlFor="image">
            <div className='inline-block relative cursor-pointer'>
              <img
                className='w-36 rounded opacity-75'
                src={image ? URL.createObjectURL(image) : userData.image || profile_pic}
                alt="profile"
              />
              <img
                className='w-10 absolute bottom-12 right-12'
                src={image ? '' : upload_icon}
                alt="upload"
              />
            </div>
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id='image'
              hidden
            />
          </label>
        ) : (
          <img
            className='w-36 rounded'
            src={userData.image || profile_pic}
            alt="profile"
          />
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

        {/* Buttons */}
        <div className='mt-10 flex gap-4'>
          {isEdit ? (
            <button
              className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all duration-500'
              onClick={updateUserProfileData}
            >
              {t('Save')}
            </button>
          ) : (
            <>
              <button
                className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all duration-500'
                onClick={() => setIsEdit(true)}
              >
                {t('my_profile.edit_profile')}
              </button>
              <button
                onClick={() => navigate('/change-password')}
                className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all duration-500'
              >
                {t('my_profile.change_password')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Medical Records Section */}
      <div className='m-5'>
        <h3 className='text-lg font-medium mt-7'>{t('my_profile.medical_history')}</h3>
        {medicalRecords.length > 0 ? (
          <div className='bg-white border rounded text-sm max-h-[40vh] overflow-y-scroll w-full'>
            <div className='grid grid-cols-[2fr_2fr_1fr] gap-1 py-3 px-6 border-b'>
              <p>{t('my_profile.file')}</p>
              <p>{t('my_profile.appointment')}</p>
              <p>{t('my_profile.doctor')}</p>
            </div>
            {medicalRecords.map((record, index) => (
              <div
                className='grid grid-cols-[2fr_2fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50'
                key={index}
              >
                <button
                  onClick={() => handleDownload(record.fileUrl, record.fileName)}
                  className='text-blue-500 underline text-left'
                >
                  {record.fileName.split('_').slice(1).join('_') || record.fileName}
                </button>
                <p>
                  {record.appointment
                    ? `${slotDateFormat(record.appointment.slotDate)}, ${record.appointment.slotTime}`
                    : 'N/A'}
                </p>
                <p>{record.doctor?.name || 'N/A'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-gray-500'>{t('my_profile.no_records')}</p>
        )}
      </div>
    </div>
  ) : (
    <p className='text-gray-500'>{t('my_profile.loading') || 'Loading...'}</p>
  );
};

export default MyProfile;