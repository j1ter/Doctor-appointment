import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import profile_pic from '../assets/profile_pic.png';
import dropdown_icon from '../assets/dropdown_icon.svg';
import medLogo from '../assets/medLogo.svg';
import menu_icon from '../assets/menu_icon.svg';
import cross_icon from '../assets/cross_icon.png';
import flag_en from '../assets/flag_en.png';
import flag_ru from '../assets/flag_ru.png';
import flag_kz from '../assets/flag_kz.png';
import { AppContext } from '../context/AppContext';
import hideLanguageIcon from '../assets/hide-language.png';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userData, logout } = useContext(AppContext);
  const { t, i18n } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    setShowLanguageMenu(false);
  };

  const languages = [
    { code: 'en', name: t('navbar.english'), flag: flag_en },
    { code: 'ru', name: t('navbar.russian'), flag: flag_ru },
    { code: 'kz', name: t('navbar.kazakh'), flag: flag_kz },
  ];

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400 font-sans'>
      <img onClick={() => navigate('/')} className='w-44 cursor-pointer' src={medLogo} alt='logo' />
      <div className='flex items-center gap-4'>
        <ul className='hidden md:flex items-start gap-5 font-medium font-sans'>
          <NavLink to='/'>
            <li className='py-1'>{t('navbar.home')}</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
          </NavLink>
          <NavLink to='/doctors'>
            <li className='py-1'>{t('navbar.all_doctors')}</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
          </NavLink>
          <NavLink to='/about'>
            <li className='py-1'>{t('navbar.about')}</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
          </NavLink>
          <NavLink to='/contact'>
            <li className='py-1'>{t('navbar.contact')}</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
          </NavLink>
        </ul>
        <div className="relative flex items-center gap-2"> {/* Изменено */}
          <button onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="block"> 
            <img src={hideLanguageIcon} alt="Toggle Language" className="h-8 w-8" />
          </button>
          {showLanguageMenu && (
            <div className='absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-sm z-20'>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className='flex items-center w-full px-4 py-2 text-sm font-sans text-gray-900 hover:bg-red-50 transition-all'
                >
                  <img src={lang.flag} alt={`${lang.code}_flag`} className='w-5 h-5 mr-2' />
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {isAuthenticated && userData ? (
          <div className='flex items-center gap-2 cursor-pointer group relative'>
            <img className='w-5 rounded-full' src={userData.image || profile_pic} alt='profile_pic' /> {/* Изменено */}
            <img className='w-2.5' src={dropdown_icon} alt='dropdown_icon' />
            <div className='absolute top-0 right-0 pt-14 text-base font-sans font-medium text-gray-600 z-20 hidden group-hover:block'>
              <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
                <p onClick={() => navigate('/my-profile')} className='hover:text-black cursor-pointer'>
                  {t('navbar.my_profile')}
                </p>
                <p onClick={() => navigate('/my-appointments')} className='hover:text-black cursor-pointer'>
                  {t('navbar.my_appointments')}
                </p>
                <p onClick={() => navigate('/my-messages')} className='hover:text-black cursor-pointer'>
                  {t('messages')}
                </p>
                <p onClick={logout} className='hover:text-black cursor-pointer'>
                  {t('navbar.logout')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className='bg-primary text-white px-8 py-3 rounded-full font-sans font-light hidden md:block'
          >
            {t('navbar.create_account')}
          </button>
        )}
        <img onClick={() => setShowMenu(true)} className='w-6 md:hidden' src={menu_icon} alt='menu_icon' />
        <div
          className={`${showMenu ? 'fixed w-full' : 'h-0 w-0'} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all font-sans`}
        >
          <div className='flex items-center justify-between px-5 py-6'>
            <img className='w-36' src={medLogo} alt='logo' />
            <img className='w-7' onClick={() => setShowMenu(false)} src={cross_icon} alt='cross_icon' />
          </div>
          <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium font-sans'>
            <NavLink onClick={() => setShowMenu(false)} to='/'>
              <p className='px-4 py-2 rounded inline-block'>{t('navbar.home')}</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/doctors'>
              <p className='px-4 py-2 rounded inline-block'>{t('navbar.all_doctors')}</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/about'>
              <p className='px-4 py-2 rounded inline-block'>{t('navbar.about')}</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/contact'>
              <p className='px-4 py-2 rounded inline-block'>{t('navbar.contact')}</p>
            </NavLink>
            {isAuthenticated && userData ? (
              <>
                <NavLink onClick={() => setShowMenu(false)} to='/my-profile'>
                  <p className='px-4 py-2 rounded inline-block'>{t('navbar.my_profile')}</p>
                </NavLink>
                <NavLink onClick={() => setShowMenu(false)} to='/my-appointments'>
                  <p className='px-4 py-2 rounded inline-block'>{t('navbar.my_appointments')}</p>
                </NavLink>
                <NavLink onClick={() => setShowMenu(false)} to='/my-messages'>
                  <p className='px-4 py-2 rounded inline-block'>{t('messages')}</p>
                </NavLink>
                <p onClick={() => { logout(); setShowMenu(false); }} className='px-4 py-2 rounded inline-block cursor-pointer'>
                  {t('navbar.logout')}
                </p>
              </>
            ) : (
              <NavLink onClick={() => setShowMenu(false)} to='/login'>
                <p className='px-4 py-2 rounded inline-block'>{t('navbar.create_account')}</p>
              </NavLink>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;