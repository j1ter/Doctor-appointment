import React, { useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';

const Sidebar = () => {
    const { isAuthenticated: isAdminAuthenticated } = useContext(AdminContext);
    const { isAuthenticated: isDoctorAuthenticated } = useContext(DoctorContext);

    return (
        <div className='min-h-screen bg-white border-r'>
            {isAdminAuthenticated && (
                <ul className='text-[#515151] mt-5'>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/admin-dashboard'}
                    >
                        <img src={assets.home_icon} alt='' />
                        <p>Dashboard</p>
                    </NavLink>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/all-appointments'}
                    >
                        <img src={assets.appointment_icon} alt='' />
                        <p>Appointments</p>
                    </NavLink>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/add-doctor'}
                    >
                        <img src={assets.add_icon} alt='' />
                        <p>Add Doctor</p>
                    </NavLink>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/doctor-list'}
                    >
                        <img src={assets.people_icon} alt='' />
                        <p>Doctors List</p>
                    </NavLink>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/add-user'}
                    >
                        <img src={assets.add_icon} alt='' />
                        <p>Add User</p>
                    </NavLink>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/users-list'}
                    >
                        <img src={assets.people_icon} alt='' />
                        <p>Users List</p>
                    </NavLink>
                </ul>
            )}
            {isDoctorAuthenticated && (
                <ul className='text-[#515151] mt-5'>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/doctor-dashboard'}
                    >
                        <img src={assets.home_icon} alt='' />
                        <p className='hidden md:block'>Dashboard</p>
                    </NavLink>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/doctor-appointments'}
                    >
                        <img src={assets.appointment_icon} alt='' />
                        <p className='hidden md:block'>Appointments</p>
                    </NavLink>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/doctor-profile'}
                    >
                        <img src={assets.people_icon} alt='' />
                        <p className='hidden md:block'>Profile</p>
                    </NavLink>
                    <NavLink
                        to='/doctor-messages'
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                    >
                        <img src={assets.message_icon} alt='Messages' className='w-6 mr-2' />
                        <p className='messages-text'>Messages</p> {/* Изменено */}
                    </NavLink>
                </ul>
            )}
        </div>
    );
};

export default Sidebar;