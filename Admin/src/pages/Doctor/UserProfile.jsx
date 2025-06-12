import React, { useEffect, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';

const UserProfile = () => {
    const { userId } = useParams();
    const { backendUrl } = useContext(DoctorContext);
    const { calculateAge, slotDateFormat } = useContext(AppContext);
    const [userData, setUserData] = useState(null);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/doctor/user-profile/${userId}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();
                if (data.success) {
                    setUserData(data.profile);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        const fetchMedicalRecords = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/doctor/student-medical-records/${userId}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();
                if (data.success) {
                    setMedicalRecords(data.records);
                }
            } catch (error) {
                console.error('Error fetching medical records:', error);
            }
        };

        const fetchAppointments = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/doctor/student-appointments/${userId}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();
                if (data.success) {
                    setAppointments(data.appointments);
                }
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
        };

        fetchUserProfile();
        fetchMedicalRecords();
        fetchAppointments();
    }, [userId, backendUrl]);

    const uploadMedicalRecord = async (appointmentId) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx';
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const formData = new FormData();
                let fileName = file.name; // Используем оригинальное имя файла
                formData.append('file', file, fileName); // Указываем имя файла явно

                try {
                    const response = await fetch(`${backendUrl}/api/doctor/upload-medical-record/${appointmentId}`, {
                        method: 'POST',
                        body: formData,
                        credentials: 'include',
                        // Убрали вручную заданный Content-Type
                    });
                    const data = await response.json();
                    if (data.success) {
                        alert('Medical record uploaded successfully');
                        const recordsResponse = await fetch(`${backendUrl}/api/doctor/student-medical-records/${userId}`, {
                            method: 'GET',
                            credentials: 'include',
                        });
                        const recordsData = await recordsResponse.json();
                        if (recordsData.success) {
                            setMedicalRecords(recordsData.records);
                        }
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

    if (!userData) return <div>Loading...</div>;

    return (
        <div className='m-5'>
            <h2 className='text-lg font-medium'>User Profile</h2>
            <div className='flex items-center gap-4 mb-5'>
                <img src={userData.image} alt='user' className='w-20 rounded-full' />
                <div>
                    <p><strong>Name:</strong> {userData.name}</p>
                    <p><strong>Age:</strong> {calculateAge(userData.dob)}</p>
                </div>
            </div>

            <h3 className='text-md font-medium mt-5'>Medical History</h3>
            {medicalRecords.length > 0 ? (
                <div className='bg-white border rounded text-sm max-h-[40vh] overflow-y-scroll'>
                    <div className='grid grid-cols-[2fr_2fr_1fr] gap-1 py-3 px-6 border-b'>
                        <p>File</p>
                        <p>Appointment</p>
                        <p>Doctor</p>
                    </div>
                    {medicalRecords.map((record, index) => (
                        <div
                            className='grid grid-cols-[2fr_2fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50'
                            key={index}
                        >
                            <a
                                href={`${backendUrl}${record.fileUrl}`}
                                download
                                className='text-blue-500 underline'
                            >
                                {record.fileName.split('_').slice(1).join('_') || record.fileName}
                            </a>
                            <p>
                                {record.appointment
                                    ? `${slotDateFormat(record.appointment.slotDate)}, ${record.appointment.slotTime}`
                                    : 'N/A'}
                            </p>
                            <p>{record.doctor ? record.doctor.name : 'N/A'}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className='text-gray-500'>No medical records found.</p>
            )}

            <h3 className='text-md font-medium mt-5'>Completed Appointments</h3>
            {appointments.length > 0 ? (
                <div className='bg-white border rounded text-sm max-h-[40vh] overflow-y-scroll'>
                    <div className='grid grid-cols-[2fr_1fr] gap-1 py-3 px-6 border-b'>
                        <p>Date & Time</p>
                        <p>Action</p>
                    </div>
                    {appointments.map((appointment, index) => (
                        <div
                            className='grid grid-cols-[2fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50'
                            key={index}
                        >
                            <p>
                                {slotDateFormat(appointment.slotDate)}, {appointment.slotTime}
                            </p>
                            <button
                                onClick={() => uploadMedicalRecord(appointment._id)}
                                className='bg-blue-500 text-white px-3 py-1 rounded'
                            >
                                Upload Record
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className='text-gray-500'>No completed appointments found.</p>
            )}
        </div>
    );
};

export default UserProfile;