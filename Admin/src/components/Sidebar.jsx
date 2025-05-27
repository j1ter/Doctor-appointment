import React, { useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
    const { isAuthenticated: isAdminAuthenticated } = useContext(AdminContext);
    const { isAuthenticated: isDoctorAuthenticated } = useContext(DoctorContext);
    const { t } = useTranslation();

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
                        <p>{t('admin.dashboard')}</p>
                    </NavLink>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/all-appointments'}
                    >
                        <img src={assets.appointment_icon} alt='' />
                        <p>{t('admin.appointments')}</p>
                    </NavLink>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/add-doctor'}
                    >
                        <img src={assets.add_icon} alt='' />
                        <p>{t('admin.add_doctor')}</p>
                    </NavLink>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/doctor-list'}
                    >
                        <img src={assets.people_icon} alt='' />
                        <p>{t('admin.doctors_list')}</p>
                    </NavLink>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/add-user'}
                    >
                        <img src={assets.add_icon} alt='' />
                        <p>{t('admin.add_user')}</p>
                    </NavLink>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/users-list'}
                    >
                        <img src={assets.people_icon} alt='' />
                        <p>{t('admin.users_list')}</p>
                    </NavLink>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/add-article'}
                    >
                        <img src={assets.add_icon} alt='' />
                        <p>{t('article.add_article')}</p>
                    </NavLink>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/articles-list'}
                    >
                        <img src={assets.people_icon} alt='' />
                        <p>{t('article.articles_list')}</p>
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
                        <p className='hidden md:block'>{t('doctor.dashboard')}</p>
                    </NavLink>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/doctor-appointments'}
                    >
                        <img src={assets.appointment_icon} alt='' />
                        <p className='hidden md:block'>{t('doctor.appointments')}</p>
                    </NavLink>
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                        to={'/doctor-profile'}
                    >
                        <img src={assets.people_icon} alt='' />
                        <p className='hidden md:block'>{t('doctor.profile')}</p>
                    </NavLink>
                    <NavLink
                        to='/doctor-messages'
                        className={({ isActive }) =>
                            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`
                        }
                    >
                        <img src={assets.message_icon} alt='Messages' className='w-6 mr-2' />
                        <p className='messages-text'>{t('doctor.messages')}</p>
                    </NavLink>
                </ul>
            )}
        </div>
    );
};

export default Sidebar;