import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function MyAppointments() {
  const { getDoctorsData, userData, fetchConversations, setCurrentConversation, conversations, loading, startConversation, fetchUserAppointments, cancelAppointment } = useContext(AppContext);
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const navigate = useNavigate();

  const specialityMap = {
    'Therapist': 'therapist',
    'Pediatrician': 'pediatrician',
    'Psychologist': 'psychologist',
    'Nurse': 'nurse'
  };

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_');
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2];
  };

  const getUserAppointments = async () => {
    try {
      const appointments = await fetchUserAppointments();
      setAppointments(appointments);
    } catch (error) {
      console.error('Error in getUserAppointments:', error);
      toast.error(t('my_appointments.load_error') || 'Failed to load appointments');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const success = await cancelAppointment(appointmentId);
      if (success) {
        await getUserAppointments(); // Обновляем список записей
      }
    } catch (error) {
      console.error('Error in handleCancelAppointment:', error);
      toast.error(t('my_appointments.cancel_error') || 'Failed to cancel appointment');
    }
  };

  const startChat = async (docId) => {
    try {
      if (loading || !userData || !userData._id) {
        toast.warn(t('chat.loading') || 'Please wait, loading user data...');
        return;
      }

      // Проверяем, есть ли уже диалог с этим доктором
      const existingConversation = conversations && Array.isArray(conversations)
        ? conversations.find((conv) => 
            conv && conv.members && Array.isArray(conv.members) &&
            conv.members.includes(userData._id) && conv.members.includes(docId)
          )
        : null;

      if (existingConversation) {
        setCurrentConversation(existingConversation);
        navigate('/messages');
        return;
      }

      // Создаем новый диалог через контекст
      const conversation = await startConversation(docId);

      if (conversation) {
        setCurrentConversation(conversation);
        navigate('/my-messages');
        toast.success(t('chat.started') || 'Chat started successfully');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error(error.message || t('chat.start_error') || 'Failed to start chat');
    }
  };

  useEffect(() => {
    if (userData) {
      getUserAppointments();
    }
  }, [userData]);

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
              <p className='text-xs'>{item.docData.address?.line1 || 'N/A'}</p>
              <p className='text-xs'>{item.docData.address?.line2 || 'N/A'}</p>
              <p className='text-xs mt-1'>
                <span className='text-sm text-neutral-700 font-medium'>{t('my_appointments.date_time')}</span>
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div></div>
            <div className='flex flex-col gap-2 justify-end'>
              {!item.cancelled && !item.isCompleted && (
                <>
                  <button
                    onClick={() => startChat(item.docId)}
                    className='text-sm text-blue-500 text-center sm:min-w-48 py-2 border rounded hover:bg-blue-500 hover:text-white transition-all duration-300'
                  >
                    {t('my_appointments.start_chat') || 'Start Chat'}
                  </button>
                  <button
                    onClick={() => handleCancelAppointment(item._id)}
                    className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'
                  >
                    {t('my_appointments.cancel_appointment')}
                  </button>
                </>
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