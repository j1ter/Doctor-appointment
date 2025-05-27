import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: [true, 'Article ID is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User ID is required']
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    edited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Update `editedAt` and `edited` flag on update
commentSchema.pre('findOneAndUpdate', function(next) {
    this.set({ edited: true, editedAt: Date.now() });
    next();
});

const commentModel = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

export default commentModel;