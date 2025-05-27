import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import verified_icon from '../assets/verified_icon.svg';
import info_icon from '../assets/info_icon.svg';
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, getDoctorsData, userData } = useContext(AppContext);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const { t } = useTranslation();
  const navigate = useNavigate();

  const dayTranslations = {
    SUN: t('appointment.day_sun'),
    MON: t('appointment.day_mon'),
    TUE: t('appointment.day_tue'),
    WED: t('appointment.day_wed'),
    THU: t('appointment.day_thu'),
    FRI: t('appointment.day_fri'),
    SAT: t('appointment.day_sat')
  };

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const specialityMap = {
    'Therapist': 'therapist',
    'Pediatrician': 'pediatrician',
    'Psychologist': 'psychologist',
    'Nurse': 'nurse'
  };

  const fetchDocInfo = async () => {
    try {
      setIsLoading(true);
      const docInfo = doctors.find((doc) => doc._id === docId);
      if (!docInfo) {
        setError(t('appointment.error_doctor_not_found') || 'Doctor not found');
      } else {
        setDocInfo(docInfo);
      }
    } catch (err) {
      console.error('Error fetching doctor info:', err);
      setError(t('appointment.error_loading') || 'Error loading doctor information');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableSlots = async () => {
    if (!docInfo) {
      return;
    }
    setDocSlots([]);

    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(19, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = day + '_' + month + '_' + year;
        const slotTime = formattedTime;

        const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true;

        if (isSlotAvailable) {
          timeSlots.push({
            dateTime: new Date(currentDate),
            time: formattedTime
          });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots((prev) => ([...prev, timeSlots]));
    }
  };

  const bookAppointment = async () => {
    if (!userData) {
      toast.warn(t('appointment.login_to_book'));
      return navigate('/login');
    }

    if (!slotTime || !docSlots[slotIndex]) {
      toast.error(t('appointment.error_select_slot') || 'Please select a time slot');
      return;
    }

    try {
      const date = docSlots[slotIndex][0].dateTime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + '_' + month + '_' + year;

      const { data: bookingData } = await axios.post(
        backendUrl + '/api/user/book-appointment',
        { docId, slotDate, slotTime },
        { withCredentials: true }
      );
      if (bookingData.success) {
        toast.success(t('appointment.success') || 'Appointment booked successfully');
        await getDoctorsData();
        navigate('/my-appointments');
      } else {
        toast.error(bookingData.message || t('appointment.error') || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.message || t('appointment.error') || 'Failed to book appointment');
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);

  useEffect(() => {
    console.log('Doc Slots:', docSlots);
  }, [docSlots]);

  if (isLoading) {
    return <div className="text-center py-10">{t('appointment.loading') || 'Loading...'}</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={verified_icon} alt="verified_icon" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {t(specialityMap[docInfo.speciality] || docInfo.speciality)}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>

          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
              {t('appointment.about')}
              <img src={info_icon} alt="info_icon" />
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
        </div>
      </div>

      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>{t('appointment.booking_slots')}</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {docSlots.length ? (
            docSlots.map((item, index) => (
              <div
                onClick={() => setSlotIndex(index)}
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                  slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'
                }`}
                key={index}
              >
                <p>{item[0] && dayTranslations[daysOfWeek[item[0].dateTime.getDay()]]}</p>
                <p>{item[0] && item[0].dateTime.getDate()}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">{t('appointment.no_slots') || 'No available slots'}</p>
          )}
        </div>

        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots.length && docSlots[slotIndex] ? (
            docSlots[slotIndex].map((item, index) => (
              <p
                onClick={() => setSlotTime(item.time)}
                className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                  item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'
                }`}
                key={index}
              >
                {item.time.toLowerCase()}
              </p>
            ))
          ) : (
            <p className="text-gray-500">{t('appointment.no_slots') || 'No available slots'}</p>
          )}
        </div>
        <button
          onClick={bookAppointment}
          className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6'
        >
          {t('appointment.book_appointment')}
        </button>
      </div>

      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  );
};
// hello
export default Appointment;