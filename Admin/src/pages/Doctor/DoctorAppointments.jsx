import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom'; // Для навигации

const DoctorAppointments = () => {
    const { appointments, getAppointments, completeAppointment, cancelAppointment, loading, backendUrl } =
        useContext(DoctorContext);
    const { calculateAge, slotDateFormat } = useContext(AppContext);
    const navigate = useNavigate();

    const [medicalRecords, setMedicalRecords] = useState({});

    useEffect(() => {
        getAppointments();
    }, []);

    // Функция для загрузки справки
    const uploadMedicalRecord = async (appointmentId) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx';
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const response = await fetch(`${backendUrl}/api/doctor/upload-medical-record/${appointmentId}`, {
                        method: 'POST',
                        body: formData,
                        credentials: 'include',
                    });
                    const data = await response.json();
                    if (data.success) {
                        alert('Medical record uploaded successfully');
                        // Обновим список справок, если есть эндпоинт для их получения
                        // getMedicalRecords(appointmentId); // Добавим позже
                    } else {
                        alert(data.message);
                    }
                } catch (error) {
                    console.error('Error uploading medical record:', error);
                    alert('Failed to upload medical record');
                }
            }
        };
        fileInput.click();
    };

    // Функция для получения списка справок (пример, если эндпоинт будет добавлен)
    const getMedicalRecords = async (appointmentId) => {
        try {
            const response = await fetch(`${backendUrl}/api/doctor/medical-records/${appointmentId}`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                setMedicalRecords((prev) => ({ ...prev, [appointmentId]: data.records }));
            }
        } catch (error) {
            console.error('Error fetching medical records:', error);
        }
    };

    // Обработчик клика на имя пользователя
    const handleUserProfileClick = (userId) => {
        // Перенаправление на страницу профиля пользователя или отображение модального окна
        navigate(`/doctor/user-profile/${userId}`); // Пример маршрута
    };

    if (loading) {
        return <div className='m-5'>Loading appointments...</div>;
    }

    return (
        <div className='w-full max-w-6xl m-5'>
            <p className='mb-3 text-lg font-medium'>All Appointments</p>
            <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>
                <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr_1fr] gap-1 py-3 px-6 border-b'>
                    <p>#</p>
                    <p>Patient</p>
                    <p>Age</p>
                    <p>Date & Time</p>
                    <p>Medical Records</p>
                    <p>Status</p>
                    <p>Action</p>
                </div>
                {appointments.length > 0 ? (
                    appointments.reverse().map((item, index) => (
                        <div
                            className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50'
                            key={index}
                        >
                            <p className='max-sm:hidden'>{index + 1}</p>
                            <div
                                className='flex items-center gap-2 cursor-pointer'
                                onClick={() => handleUserProfileClick(item.userId)}
                            >
                                <img
                                    className='w-8 rounded-full'
                                    src={item.userData.image}
                                    alt='user_image'
                                />
                                <p className='underline text-blue-500'>{item.userData.name}</p>
                            </div>
                            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
                            <p>
                                {slotDateFormat(item.slotDate)}, {item.slotTime}
                            </p>
                            <div>
                                {medicalRecords[item._id]?.length > 0 ? (
                                    medicalRecords[item._id].map((record, idx) => (
                                        <a
                                            key={idx}
                                            href={`${backendUrl}/api/doctor/records/download/${record.fileName}`}
                                            download
                                            className='text-blue-500 underline mr-2'
                                        >
                                            {record.fileName}
                                        </a>
                                    ))
                                ) : (
                                    <p>No records</p>
                                )}
                            </div>
                            <p>
                                {item.cancelled ? (
                                    <span className='text-red-400 text-xs font-medium'>Cancelled</span>
                                ) : item.isCompleted ? (
                                    <span className='text-green-500 text-xs font-medium'>Completed</span>
                                ) : (
                                    <span className='text-yellow-500 text-xs font-medium'>Pending</span>
                                )}
                            </p>
                            <div className='flex gap-2'>
                                {!item.cancelled && !item.isCompleted && (
                                    <>
                                        <img
                                            onClick={() => cancelAppointment(item._id)}
                                            className='w-10 cursor-pointer'
                                            src={assets.cancel_icon}
                                            alt='cancel_icon'
                                        />
                                        <img
                                            onClick={() => completeAppointment(item._id)}
                                            className='w-10 cursor-pointer'
                                            src={assets.tick_icon}
                                            alt='tick_icon'
                                        />
                                    </>
                                )}
                                {item.isCompleted && (
                                    <button
                                        onClick={() => uploadMedicalRecord(item._id)}
                                        className='bg-blue-500 text-white px-3 py-1 rounded'
                                    >
                                        Upload Record
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className='text-center text-gray-500 py-5'>No appointments found</p>
                )}
            </div>
        </div>
    );
};

export default DoctorAppointments;