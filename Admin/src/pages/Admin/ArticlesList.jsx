import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const ArticlesList = () => {
    const { articles, getAllArticles, isAuthenticated } = useContext(AdminContext);
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            getAllArticles();
        }
    }, [isAuthenticated, getAllArticles]);

    const handleArticleClick = (articleId) => {
        navigate(`/article-details/${articleId}`);
    };

    return (
        <div className='m-5'>
            <h3 className='text-lg font-medium mb-5'>{t('articles list')}</h3>
            <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
                <div className='grid grid-cols-[2fr_2fr_1fr_1fr] gap-1 py-3 px-6 border-b'>
                    <p>{t('title')}</p>
                    <p>{t('author')}</p>
                    <p>{t('created at')}</p>
                    <p>{t('updated at')}</p>
                </div>
                {articles.length > 0 ? (
                    articles.map((article) => (
                        <div
                            className='grid grid-cols-[2fr_2fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50 cursor-pointer'
                            key={article._id}
                            onClick={() => handleArticleClick(article._id)}
                        >
                            <p>{article.title}</p>
                            <p>{article.author}</p>
                            <p>{new Date(article.createdAt).toLocaleDateString()}</p>
                            <p>{new Date(article.updatedAt).toLocaleDateString()}</p>
                        </div>
                    ))
                ) : (
                    <p className='text-gray-500 px-6 py-3'>{t('article.no_articles')}</p>
                )}
            </div>
        </div>
    );
};

export default ArticlesList;