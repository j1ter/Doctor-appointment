import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';

const AddArticle = () => {
    const { createArticle } = useContext(AdminContext);
    const { t } = useTranslation();
    const [articleData, setArticleData] = useState({
        title: '',
        description: '',
        image: null,
    });
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (articleData.title.length > 200) {
            toast.error(t('article.title_too_long') || 'Заголовок не должен превышать 200 символов');
            setLoading(false);
            return;
        }

        if (!articleData.description) {
            toast.error(t('article.description_required') || 'Описание обязательно');
            setLoading(false);
            return;
        }

        const success = await createArticle(articleData);
        if (success) {
            setArticleData({ title: '', description: '', image: null });
            setImagePreview(null);
        }
        setLoading(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setArticleData({ ...articleData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className='m-5 w-full'>
            <div className='w-full max-w-4xl mx-auto my-5'>
                <h3 className='text-lg font-medium mb-5'>{t('article.add_article')}</h3>
                <form onSubmit={handleSubmit} className='flex flex-wrap gap-5'>
                    <div className='w-full'>
                        <p className='mb-2 text-gray-600'>{t('article.title')}</p>
                        <input
                            type='text'
                            className='w-full p-2 border rounded'
                            value={articleData.title}
                            onChange={(e) => setArticleData({ ...articleData, title: e.target.value })}
                            required
                            placeholder={t('article.title_placeholder')}
                        />
                    </div>
                    <div className='w-full'>
                        <p className='mb-2 text-gray-600'>{t('article.description')}</p>
                        <textarea
                            className='w-full p-2 border rounded h-40'
                            value={articleData.description}
                            onChange={(e) => setArticleData({ ...articleData, description: e.target.value })}
                            required
                            placeholder={t('article.description_placeholder')}
                        />
                    </div>
                    <div className='w-full'>
                        <p className='mb-2 text-gray-600'>{t('article.image')}</p>
                        <input
                            type='file'
                            accept='image/*'
                            className='w-full p-2 border rounded'
                            onChange={handleImageChange}
                        />
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt='Предпросмотр'
                                className='mt-4 w-full max-w-xs rounded'
                            />
                        )}
                    </div>
                    <button
                        type='submit'
                        className='bg-primary text-white px-10 py-2 mt-5 rounded-full disabled:bg-gray-400'
                        disabled={loading}
                    >
                        {loading ? t('loading') : t('article.create')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddArticle;