const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    pdfId: String,
    originalHash: String,
    finalHash: String,
    signedAt: { type: Date, default: Date.now },
    fields: Array, // Store the fields/coordinates used
    userAgent: String,
    ipAddress: String
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
