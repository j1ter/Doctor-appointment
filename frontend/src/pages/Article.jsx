import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const Article = () => {
    const { getArticleById, getCommentsByArticle, createComment, updateComment, deleteComment, isAuthenticated, userData } = useContext(AppContext);
    const { t } = useTranslation();
    const { id } = useParams();

    const [article, setArticle] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchArticleAndComments = async () => {
            setLoading(true);
            const articleData = await getArticleById(id);
            if (articleData) {
                setArticle(articleData);
            }

            const commentsData = await getCommentsByArticle(id);
            setComments(commentsData);
            setLoading(false);
        };

        fetchArticleAndComments();
    }, [id, getArticleById, getCommentsByArticle]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error(t('login_to_comment'));
            return;
        }
        if (!newComment.trim()) {
            toast.error(t('comment_empty'));
            return;
        }

        const comment = await createComment(id, newComment);
        if (comment) {
            setComments([...comments, comment]);
            setNewComment('');
        }
    };

    const handleEditComment = (comment) => {
        setEditingCommentId(comment._id);
        setEditCommentText(comment.content);
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        if (!editCommentText.trim()) {
            toast.error(t('comment_empty'));
            return;
        }

        const updatedComment = await updateComment(editingCommentId, editCommentText);
        if (updatedComment) {
            console.log('Updated comment:', updatedComment);
            setComments(comments.map((c) => (c._id === editingCommentId ? updatedComment : c)));
            setEditingCommentId(null);
            setEditCommentText('');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm(t('delete_confirm'))) {
            const success = await deleteComment(commentId);
            if (success) {
                setComments(comments.filter((c) => c._id !== commentId));
            }
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    };

    if (loading) {
        return <div className='m-10 text-center'>{t('loading')}</div>;
    }

    if (!article) {
        return <div className='m-10 text-center'>{t('not_found')}</div>;
    }

    return (
        <div className='m-5'>
            <div className='max-w-4xl mx-auto'>
                <h2 className='text-2xl font-bold mb-4'>{article.title}</h2>
                {article.image && (
                    <img
                        src={article.image}
                        alt={article.title}
                        className='w-full max-w-md rounded mb-6'
                    />
                )}
                <p className='text-gray-600 mb-4'>{article.description}</p>
                <p className='text-gray-500 text-sm mb-6'>
                    {formatDate(article.createdAt)}
                </p>

                <div className='mt-8'>
                    <h3 className='text-lg font-medium mb-4'>{t('comments')}</h3>
                    {isAuthenticated && (
                        <form onSubmit={handleCommentSubmit} className='mb-6'>
                            <textarea
                                rows='4'
                                className='w-full p-2 border rounded'
                                placeholder={t('comment_placeholder')}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button
                                type='submit'
                                className='bg-primary text-white px-6 py-2 rounded-full mt-2'
                            >
                                {t('add_comment')}
                            </button>
                        </form>
                    )}
                    <div className='bg-white border rounded-md'>
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div
                                    key={comment._id}
                                    className='p-4 border-b last:border-b-0 flex justify-between items-start'
                                >
                                    {editingCommentId === comment._id ? (
                                        <form onSubmit={handleSubmitEdit} className='flex-1'>
                                            <textarea
                                                rows='4'
                                                className='w-full p-2 border rounded mb-2'
                                                value={editCommentText}
                                                onChange={(e) => setEditCommentText(e.target.value)}
                                            />
                                            <div className='flex gap-2'>
                                                <button
                                                    type='submit'
                                                    className='bg-primary text-white px-4 py-1 rounded-full'
                                                >
                                                    {t('save')}
                                                </button>
                                                <button
                                                    type='button'
                                                    onClick={() => setEditingCommentId(null)}
                                                    className='bg-gray-400 text-white px-4 py-1 rounded-full'
                                                >
                                                    {t('cancel')}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className='flex-1'>
                                            <p className='text-gray-700 font-medium'>{comment.user.name}</p>
                                            <p className='text-gray-700 mb-2'>{comment.content}</p>
                                            <p className='text-gray-500 text-sm'>
                                                {formatDate(comment.createdAt)}
                                                {comment.edited && (
                                                    <span>
                                                        {' '}
                                                        ({t('edited_at')} {formatDate(comment.editedAt)})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    )}
                                    {isAuthenticated && comment.user._id === userData?._id && editingCommentId !== comment._id && (
                                        <div className='flex gap-2 ml-4'>
                                            <button
                                                onClick={() => handleEditComment(comment)}
                                                className='bg-primary text-white px-3 py-1 rounded-full text-sm'
                                            >
                                                {t('edit')}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteComment(comment._id)}
                                                className='bg-red-600 text-white px-3 py-1 rounded-full text-sm'
                                            >
                                                {t('delete')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className='text-gray-500 p-4'>{t('no_comments')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Article;