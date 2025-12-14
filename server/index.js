const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { signPdf } = require('./services/pdfService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const crypto = require('crypto');
const AuditLog = require('./models/AuditLog');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bolosign')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));


app.post('/sign-pdf', async (req, res) => {
    try {
        const { pdfId, pdfData, fields } = req.body;

        if (!fields || fields.length === 0) {
            return res.status(400).json({ error: 'No fields provided' });
        }

        console.log('Signing PDF:', pdfId, 'Fields:', fields.length, 'Has pdfData:', !!pdfData);

        const { signedPdfBuffer, originalHash, finalHash } = await signPdf(pdfId, pdfData, fields);

        // Save Audit Log
        const auditLog = new AuditLog({
            pdfId,
            originalHash,
            finalHash,
            fields: fields,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip
        });

        await auditLog.save().catch(err => console.error('Audit Log Save Error:', err));

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=signed_document.pdf');
        res.send(Buffer.from(signedPdfBuffer));

    } catch (error) {
        console.error('Signing Error:', error);
        res.status(500).json({ error: 'Failed to sign PDF', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
