import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function MyAppointments() {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const navigate = useNavigate();

  const specialityMap = {
    'General physician': 'doctors.general_physician',
    'Gynecologist': 'doctors.gynecologist',
    'Dermatologist': 'doctors.dermatologist',
    'Pediatricians': 'doctors.pediatricians',
    'Neurologist': 'doctors.neurologist',
    'Gastroenterologist': 'doctors.gastroenterologist'
  };

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_');
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2];
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } });
      if (data.success) {
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      console.log(error);
      toast.error(t('my_appointments.cancel_error'));
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } });
      if (data.success) {
        toast.success(t('my_appointments.cancel_success'));
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(t('my_appointments.cancel_error'));
      }
    } catch (error) {
      console.log(error);
      toast.error(t('my_appointments.cancel_error'));
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>{t('my_appointments.title')}</p>
      <div>
        {appointments.map((item, index) => (
          <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
            <div>
              <img className='w-32 bg-red-100' src={item.docData.image} alt="doctor_img" />
            </div>
            <div className='flex-1 text-sm text-zinc-600'>
              <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
              <p>{t(specialityMap[item.docData.speciality] || item.docData.speciality)}</p>
              <p className='text-zinc-700 font-medium mt-1'>{t('my_appointments.address')}</p>
              <p className='text-xs'>{item.docData.address.line1}</p>
              <p className='text-xs'>{item.docData.address.line2}</p>
              <p className='text-xs mt-1'>
                <span className='text-sm text-neutral-700 font-medium'>{t('my_appointments.date_time')}</span>
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div></div>
            <div className='flex flex-col gap-2 justify-end'>
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'
                >
                  {t('my_appointments.cancel_appointment')}
                </button>
              )}
              {item.cancelled && !item.isCompleted && (
                <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>
                  {t('my_appointments.appointment_cancelled')}
                </button>
              )}
              {item.isCompleted && (
                <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>{t('my_appointments.completed')}</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyAppointments;