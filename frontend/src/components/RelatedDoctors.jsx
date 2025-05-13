import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

function RelatedDoctors({ docId, speciality }) {
  const { doctors } = useContext(AppContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [relDoc, setRelDoc] = useState([]);

  const specialityMap = {
    'Therapist': 'therapist',
    'Pediatrician': 'pediatrician',
    'Psychologist': 'psychologist',
    'Nurse': 'nurse'
  };
// hello
  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const doctorsData = doctors.filter((doc) => doc.speciality === speciality && doc._id !== docId);
      setRelDoc(doctorsData);
    }
  }, [doctors, speciality, docId]);

  return (
    <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
      <h1 className='text-3xl font-medium'>{t('related_doctors.title')}</h1>
      <p className='sm:w-1/3 text-center text-sm'>{t('related_doctors.description')}</p>
      <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
        {relDoc.slice(0, 5).map((item, index) => (
          <div
            onClick={() => {
              navigate(`/appointment/${item._id}`);
              scrollTo(0, 0);
            }}
            key={index}
            className='border border-red-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'
          >
            <img className='bg-red-50' src={item.image} alt="doctor_img" />
            <div className='p-4'>
              <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : 'text-gray-500'}`}>
                <p className={`w-2 h-2 ${item.available ? 'bg-green-500' : 'bg-gray-500'} rounded-full`}></p>
                <p>{item.available ? t('related_doctors.available') : t('related_doctors.not_available')}</p>
              </div>
              <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
              <p className='text-gray-600 text-sm'>{t(specialityMap[item.speciality] || item.speciality)}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          navigate('/doctors');
          scrollTo(0, 0);
        }}
        className='bg-red-200 text-gray-600 px-12 py-3 rounded-full mt-10'
      >
        {t('related_doctors.more')}
      </button>
    </div>
  );
}

export default RelatedDoctors;