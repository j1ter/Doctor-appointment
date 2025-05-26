import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctor',
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'appointment',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

const medicalRecordModel = mongoose.models.medicalRecord || mongoose.model('medicalRecord', medicalRecordSchema);
// hello
export default medicalRecordModel;