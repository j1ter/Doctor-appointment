import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

function Doctors() {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);
  const { t } = useTranslation();

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality));
    } else {
      setFilterDoc(doctors);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality]);

  return (
    <div>
      <p className='text-gray-600'>{t('doctors.browse')}</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <button
          className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`}
          onClick={() => setShowFilter(prev => !prev)}
        >
          {t('doctors.filters')}
        </button>
        <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <p
            onClick={() => (speciality === 'General physician' ? navigate('/doctors') : navigate('/doctors/General physician'))}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'General physician' ? 'bg-red-50 text-black' : ''
            }`}
          >
            {t('doctors.general_physician')}
          </p>
          <p
            onClick={() => (speciality === 'Gynecologist' ? navigate('/doctors') : navigate('/doctors/Gynecologist'))}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'Gynecologist' ? 'bg-red-50 text-black' : ''
            }`}
          >
            {t('doctors.gynecologist')}
          </p>
          <p
            onClick={() => (speciality === 'Dermatologist' ? navigate('/doctors') : navigate('/doctors/Dermatologist'))}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'Dermatologist' ? 'bg-red-50 text-black' : ''
            }`}
          >
            {t('doctors.dermatologist')}
          </p>
          <p
            onClick={() => (speciality === 'Pediatricians' ? navigate('/doctors') : navigate('/doctors/Pediatricians'))}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'Pediatricians' ? 'bg-red-50 text-black' : ''
            }`}
          >
            {t('doctors.pediatricians')}
          </p>
          <p
            onClick={() => (speciality === 'Neurologist' ? navigate('/doctors') : navigate('/doctors/Neurologist'))}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'Neurologist' ? 'bg-red-50 text-black' : ''
            }`}
          >
            {t('doctors.neurologist')}
          </p>
          <p
            onClick={() => (speciality === 'Gastroenterologist' ? navigate('/doctors') : navigate('/doctors/Gastroenterologist'))}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              speciality === 'Gastroenterologist' ? 'bg-red-50 text-black' : ''
            }`}
          >
            {t('doctors.gastroenterologist')}
          </p>
        </div>
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {filterDoc.map((item, index) => (
            <div
              onClick={() => navigate(`/appointment/${item._id}`)}
              key={index}
              className='border border-red-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'
            >
              <img className='bg-red-50' src={item.image} alt="doctor_img" />
              <div className='p-4'>
                <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : 'text-gray-500'}`}>
                  <p className={`w-2 h-2 ${item.available ? 'bg-green-500' : 'bg-gray-500'} rounded-full`}></p>
                  <p>{item.available ? t('doctors.available') : t('doctors.not_available')}</p>
                </div>
                <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                <p className='text-gray-600 text-sm'>{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Doctors;