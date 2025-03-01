const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
    test_name: {
        type: String,
        required: true,
        trim: true
    },
    test_type: {
        type: String,
        required: true,
        enum: ["Blood Test", "MRI", "X-Ray", "CT-Scan", "ECG", "Ultrasound"]
    },
    test_status: {
        type: String,
        enum: ["Pending", "Completed", "In Progress"],
        default: "Pending"
    },
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },
    result_value: {
        type: String,
        default: null
    },
    unit: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Create index for better querying performance
labTestSchema.index({ test_name: 1, test_type: 1, patient_id: 1 });

module.exports = mongoose.model("LabTest", labTestSchema);
