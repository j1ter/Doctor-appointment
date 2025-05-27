import commentModel from '../models/commentModel.js';

// API: Create a comment
const createComment = async (req, res) => {
    try {
        const { articleId, content } = req.body;
        const userId = req.user._id;

        if (!articleId || !content) {
            return res.status(400).json({ success: false, message: 'Article ID and content are required' });
        }

        const commentData = {
            article: articleId,
            user: userId,
            content
        };

        const newComment = new commentModel(commentData);
        await newComment.save();

        // Популяция user после сохранения
        const populatedComment = await commentModel
            .findById(newComment._id)
            .populate('user', 'name email');

        res.status(201).json({ success: true, message: 'Comment created successfully', comment: populatedComment });
    } catch (error) {
        console.log('Error in createComment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API: Get comments for an article
const getCommentsByArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        const comments = await commentModel
            .find({ article: articleId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, comments });
    } catch (error) {
        console.log('Error in getCommentsByArticle:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API: Update a comment
const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        if (!content) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }

        const comment = await commentModel.findById(id);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized to edit this comment' });
        }

        const updatedComment = await commentModel
            .findByIdAndUpdate(id, { content }, { new: true })
            .populate('user', 'name email');

        res.json({ success: true, message: 'Comment updated successfully', comment: updatedComment });
    } catch (error) {
        console.log('Error in updateComment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API: Delete a comment (user-owned)
const deleteOwnComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const comment = await commentModel.findById(id);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this comment' });
        }

        await commentModel.findByIdAndDelete(id);
        res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        console.log('Error in deleteOwnComment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    createComment,
    getCommentsByArticle,
    updateComment,
    deleteOwnComment
};