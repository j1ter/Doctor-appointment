import React from 'react';
import { useTranslation } from 'react-i18next';
import about_image from '../assets/about_image.png';

function About() {
  const { t } = useTranslation();

  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>{t('about.title')} <span className='text-gray-700 font-medium'>{t('about.title').split(' ')[1]}</span></p>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[360px]' src={about_image} alt="about_image" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
          <p>{t('about.welcome')}</p>
          <p>{t('about.commitment')}</p>
          <b className='text-gray-800'>{t('about.vision_title')}</b>
          <p>{t('about.vision')}</p>
        </div>
      </div>
      <div className='text-xl my-4'>
        <p>{t('about.why_choose')} <span className='text-gray-700 font-semibold'>{t('about.why_choose').split(' ')[1]}</span></p>
      </div>
      <div className='flex flex-col md:flex-row mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>{t('about.efficiency_title')}:</b>
          <p>{t('about.efficiency')}</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>{t('about.convenience_title')}:</b>
          <p>{t('about.convenience')}</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>{t('about.personalization_title')}:</b>
          <p>{t('about.personalization')}</p>
        </div>
      </div>
    </div>
  );
}

export default About;