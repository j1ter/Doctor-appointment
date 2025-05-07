import React from 'react';
import { useTranslation } from 'react-i18next';
import contact_image from '../assets/contact_image.png';

function Contact() {
  const { t } = useTranslation();

  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>
          {t('contact.title').split(' ').slice(0, -1).join(' ')}{' '}
          <span className='text-gray-700 font-semibold'>{t('contact.title').split(' ').slice(-1)}</span>
        </p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
        <img className='w-full md:max-w-[360px]' src={contact_image} alt="contact_image" />

        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-lg text-gray-600'>{t('contact.office')}</p>
          <p className='text-gray-500'>{t('contact.address')}</p>
          <p className='text-gray-500'>
            {t('contact.phone')} <br /> {t('contact.email')}
          </p>
          <p className='font-semibold text-lg text-gray-600'>{t('contact.careers_title')}</p>
          <p className='text-gray-500'>{t('contact.careers')}</p>
          <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>
            {t('contact.explore_jobs')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Contact;