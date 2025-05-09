import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';

const DoctorsList = () => {
    const { doctors, getAllDoctors, changeAvailability } = useContext(AdminContext);

    useEffect(() => {
        getAllDoctors();
    }, []);

    return (
        <div className='m-5 max-h-[90vh] overflow-y-auto'>
            <h1 className='text-lg font-medium'>All Doctors</h1>
            <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
                {doctors && doctors.length > 0 ? (
                    doctors.map((doctor, index) => (
                        <div
                            className='border border-gray-200 rounded-xl max-w-56 w-full flex flex-col items-center gap-2 pb-4'
                            key={index}
                        >
                            <div className='w-full'>
                                <img
                                    className='w-full h-44 bg-gray-50 rounded-t-xl'
                                    src={doctor.image}
                                    alt=''
                                />
                            </div>
                            <div className='w-full px-2'>
                                <p className='text-lg font-medium text-gray-700'>{doctor.name}</p>
                                <p className='text-gray-600'>{doctor.speciality}</p>
                                <button
                                    onClick={() => changeAvailability(doctor._id)}
                                    className={`mt-2 w-full py-1 rounded-full text-sm ${
                                        doctor.available
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-red-100 text-red-600'
                                    }`}
                                >
                                    {doctor.available ? 'Available' : 'Not Available'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No doctors available</p>
                )}
            </div>
        </div>
    );
};

export default DoctorsList;