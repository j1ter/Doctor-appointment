import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Articles = () => {
    const { getAllArticles, searchArticles } = useContext(AppContext);
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [articles, setArticles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const articlesPerPage = 6;

    const fetchArticles = async (page = 1) => {
        setLoading(true);
        try {
            const response = await getAllArticles(page, articlesPerPage);
            console.log('fetchArticles response:', response);
            setArticles(response.articles || []);
            setTotalPages(response.totalPages || 1);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error in fetchArticles:', error);
            toast.error(t('error') || 'Ошибка загрузки статей');
        }
        setLoading(false);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!searchQuery.trim()) {
                fetchArticles(1);
                return;
            }
            const response = await searchArticles(searchQuery, currentPage, articlesPerPage);
            console.log('handleSearch response:', response);
            setArticles(response.articles || []);
            setTotalPages(response.totalPages || 1);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error in handleSearch:', error);
            toast.error(t('error') || 'Ошибка поиска статей');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!searchQuery) {
            fetchArticles(currentPage);
        } else {
            handleSearch({ preventDefault: () => {} });
        }
    }, [currentPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleArticleClick = (articleId) => {
        navigate(`/articles/${articleId}`);
    };

    return (
        <div className='m-5'>
            <h3 className='text-lg font-medium mb-5'>{t('articles_list')}</h3>
            <form onSubmit={handleSearch} className='mb-5 flex gap-2 max-w-md search-form'>
                <input
                    type='text'
                    className='w-full p-2 border rounded'
                    placeholder={t('search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                    type='submit'
                    className='bg-primary text-white px-6 py-2 rounded-full'
                    disabled={loading}
                >
                    {t('search')}
                </button>
            </form>
            {loading ? (
                <p className='text-gray-600'>{t('loading')}</p>
            ) : (
                <>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 articles-grid'>
                        {articles.length > 0 ? (
                            articles.map((article) => {
                                const truncatedDescription = article.description.length > 100 
                                    ? `${article.description.substring(0, 100)}...` 
                                    : article.description;
                                return (
                                    <div
                                        key={article._id}
                                        className='bg-white rounded-lg shadow-md p-4 hover:shadow-lg cursor-pointer article-card'
                                        onClick={() => handleArticleClick(article._id)}
                                    >
                                        {article.image && (
                                            <img
                                                src={article.image}
                                                alt={article.title}
                                                className='w-full h-48 object-cover rounded-t-lg mb-2'
                                            />
                                        )}
                                        <h4 className='text-lg font-semibold mb-2'>{article.title}</h4>
                                        <p className='text-gray-600 mb-2' style={{ whiteSpace: 'pre-wrap' }}>
                                            {truncatedDescription}
                                        </p>
                                        <p className='text-gray-500 text-sm'>
                                            {new Date(article.createdAt).toLocaleDateString('ru-RU', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                );
                            })
                        ) : (
                            <p className='text-gray-500'>{t('no_articles')}</p>
                        )}
                    </div>
                    {totalPages > 1 && (
                        <div className='mt-8 flex justify-center gap-2 pagination'>
                            <button
                                className='px-4 py-2 bg-gray-200 rounded disabled:bg-gray-300'
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                {t('previous')}
                            </button>
                            {[...Array(totalPages).keys()].map((_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        className={`px-4 py-2 rounded ${currentPage === page ? 'bg-primary text-white' : 'bg-gray-200'}`}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                            <button
                                className='px-4 py-2 bg-gray-200 rounded disabled:bg-gray-300'
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                {t('next')}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Articles;