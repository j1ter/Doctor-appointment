import React from 'react';
import { useTranslation } from 'react-i18next';
import medLogo from '../assets/medLogo.svg';

function Footer() {
  const { t } = useTranslation();
// hello
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        <div>
          <img className='mb-5 w-40' src={medLogo} alt="medLogo" />
          <p className='w-full md:w-2/3 text-gray-600 leading-6'>{t('footer.description')}</p>
        </div>
        <div>
          <p className='text-xl font-medium mb-5'>{t('footer.company')}</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>{t('footer.home')}</li>
            <li>{t('footer.about')}</li>
            <li>{t('footer.contact')}</li>
            <li>{t('footer.privacy_policy')}</li>
          </ul>
        </div>
        <div>
          <p className='text-xl font-medium mb-5'>{t('footer.get_in_touch')}</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>{t('footer.phone')}</li>
            <li>{t('footer.email')}</li>
          </ul>
        </div>
      </div>
      <div>
        <hr />
        <p className='py-5 text-sm text-center'>{t('footer.copyright')}</p>
      </div>
    </div>
  );
}

export default Footer;