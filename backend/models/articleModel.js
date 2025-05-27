import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    author: {
        type: String, // Store admin email or name
        required: [true, 'Author is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update `updatedAt` on save or update
articleSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

articleSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

const articleModel = mongoose.models.Article || mongoose.model('Article', articleSchema);

export default articleModel;