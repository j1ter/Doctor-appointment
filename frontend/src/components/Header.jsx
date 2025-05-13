import React from 'react';
import { useTranslation } from 'react-i18next';
import group_prifiles from '../assets/group_profiles.png';
import arrow_icon from '../assets/arrow_icon.svg';
import header_img from '../assets/header_img.png';

function Header() {
  const { t } = useTranslation();
// hello
  return (
    <div className='flex flex-col md:flex-row flex-wrap bg-primary rounded-lg px-6 md:px-10 lg:px-20'>
      <div className='md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px]'>
        <p className='text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight'>
          {t('header.title')}
        </p>
        <div className='flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light'>
          <img className='w-28' src={group_prifiles} alt="group_profiles" />
          <p>{t('header.description')}</p>
        </div>
        <a href='#speciality' className='flex items-center gap-2 bg-white px-8 py-3 rounded-full text-gray-600 text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300'>
          {t('header.book_appointment')} <img className='w-3' src={arrow_icon} alt='arrow_icon' />
        </a>
      </div>
      <div className='md:w-1/2 relative'>
        <img className='w-full max-w-[800px] px-2 mt-10 md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:scale-125 h-auto rounded-lg' src={header_img} alt="header_img" />
      </div>
    </div>
  );
}

export default Header;