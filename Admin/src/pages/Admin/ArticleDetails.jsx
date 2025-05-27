import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ArticleDetails = () => {
    const { backendUrl, getArticleById, updateArticle, deleteArticle, deleteComment } = useContext(AdminContext);
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [article, setArticle] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ title: '', description: '', image: null });
    const [imagePreview, setImagePreview] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Загрузка статьи и комментариев
    useEffect(() => {
        const fetchArticleAndComments = async () => {
            setLoading(true);
            const articleData = await getArticleById(id);
            if (articleData) {
                setArticle(articleData);
                setEditData({ title: articleData.title, description: articleData.description, image: null });
                setImagePreview(articleData.image || null);
            }

            try {
                const { data } = await axios.get(`${backendUrl}/api/user/comments/${id}`, {
                    withCredentials: true,
                });
                if (data.success) {
                    setComments(data.comments);
                } else {
                    toast.error(data.message || 'Не удалось загрузить комментарии');
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
                toast.error(error.response?.data?.message || 'Не удалось загрузить комментарии');
            }
            setLoading(false);
        };

        fetchArticleAndComments();
    }, [id, getArticleById, backendUrl]);

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (editData.title.length > 200) {
            toast.error(t('article.title_too_long') || 'Заголовок не должен превышать 200 символов');
            setLoading(false);
            return;
        }

        if (!editData.description) {
            toast.error(t('article.description_required') || 'Описание обязательно');
            setLoading(false);
            return;
        }

        const success = await updateArticle(id, editData);
        if (success) {
            const updatedArticle = await getArticleById(id);
            setArticle(updatedArticle);
            setIsEditing(false);
            setImagePreview(updatedArticle.image || null);
        }
        setLoading(false);
    };

    const handleDeleteArticle = async () => {
        if (window.confirm(t('article.confirm_delete') || 'Вы уверены, что хотите удалить статью?')) {
            const success = await deleteArticle(id);
            if (success) {
                navigate('/articles-list');
            }
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm(t('article.confirm_delete_comment') || 'Вы уверены, что хотите удалить комментарий?')) {
            const success = await deleteComment(commentId);
            if (success) {
                setComments(comments.filter((comment) => comment._id !== commentId));
            }
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditData({ ...editData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    if (!article && !loading) {
        return <p className='m-5 text-gray-600'>{t('article.not_found') || 'Статья не найдена'}</p>;
    }

    return (
        <div className='m-5 w-full'>
            <div className='w-full max-w-4xl mx-auto my-5'>
                {loading ? (
                    <p className='text-gray-600'>{t('loading') || 'Загрузка...'}</p>
                ) : isEditing ? (
                    <div>
                        <h3 className='text-lg font-medium mb-5'>{t('article.edit_article')}</h3>
                        <form onSubmit={handleEditSubmit} className='flex flex-wrap gap-5'>
                            <div className='w-full'>
                                <p className='mb-2 text-gray-600'>{t('article.title')}</p>
                                <input
                                    type='text'
                                    className='w-full p-2 border rounded'
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    required
                                    placeholder={t('article.title_placeholder')}
                                />
                            </div>
                            <div className='w-full'>
                                <p className='mb-2 text-gray-600'>{t('article.description')}</p>
                                <textarea
                                    className='w-full p-2 border rounded h-40'
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
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
                            <div className='flex gap-4'>
                                <button
                                    type='submit'
                                    className='bg-primary text-white px-10 py-2 mt-5 rounded-full disabled:bg-gray-400'
                                    disabled={loading}
                                >
                                    {loading ? t('loading') : t('article.save')}
                                </button>
                                <button
                                    type='button'
                                    className='bg-gray-500 text-white px-10 py-2 mt-5 rounded-full'
                                    onClick={() => setIsEditing(false)}
                                >
                                    {t('article.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div>
                        <h3 className='text-lg font-medium mb-5'>{article.title}</h3>
                        {article.image && (
                            <img
                                src={article.image}
                                alt={article.title}
                                className='w-full max-w-md rounded mb-5'
                            />
                        )}
                        <p className='text-gray-600 mb-5'>{article.description}</p>
                        <p className='text-gray-500 text-sm mb-5'>
                            {t('article.author')}: {article.author}
                        </p>
                        <p className='text-gray-500 text-sm mb-5'>
                            {t('article.created_at')}: {new Date(article.createdAt).toLocaleDateString()}
                        </p>
                        <p className='text-gray-500 text-sm mb-5'>
                            {t('article.updated_at')}: {new Date(article.updatedAt).toLocaleDateString()}
                        </p>
                        <div className='flex gap-4 mb-5'>
                            <button
                                className='bg-primary text-white px-10 py-2 rounded-full'
                                onClick={() => setIsEditing(true)}
                            >
                                {t('article.edit')}
                            </button>
                            <button
                                className='bg-red-600 text-white px-10 py-2 rounded-full'
                                onClick={handleDeleteArticle}
                            >
                                {t('article.delete')}
                            </button>
                        </div>

                        <h4 className='text-lg font-medium mb-3'>{t('article.comments')}</h4>
                        <div className='bg-white border rounded text-sm max-h-[40vh] overflow-y-scroll'>
                            {comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div
                                        className='py-3 px-6 border-b flex justify-between items-center'
                                        key={comment._id}
                                    >
                                        <div>
                                            <p className='text-gray-600'>{comment.content}</p>
                                            <p className='text-gray-500 text-xs'>
                                                {t('article.comment_by')}: {comment.user.name} ({comment.user.email})
                                            </p>
                                            <p className='text-gray-500 text-xs'>
                                                {t('article.comment_date')}: {new Date(comment.createdAt).toLocaleDateString()}
                                                {comment.edited && (
                                                    <span>
                                                        {' '}
                                                        ({t('article.edited_at')} {new Date(comment.editedAt).toLocaleDateString()})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <button
                                            className='text-red-600 hover:underline'
                                            onClick={() => handleDeleteComment(comment._id)}
                                        >
                                            {t('article.delete_comment')}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className='text-gray-500 px-6 py-3'>{t('article.no_comments')}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticleDetails;