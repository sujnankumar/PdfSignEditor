const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Embed all fields into PDF
 * @param {string} pdfId - Identifier for the PDF
 * @param {string} pdfData - Base64 data URL of uploaded PDF (or null for sample)
 * @param {Array} fields - Array of field objects with type, value, rect, pageNumber
 * @param {number} pageNumber - Deprecated, use fields array instead
 * @returns {Promise<Object>} - { signedPdfBuffer, originalHash, finalHash }
 */
exports.signPdf = async (pdfId, pdfData, fields, pageNumber = 1) => {
    let existingPdfBytes;

    if (pdfData) {
        existingPdfBytes = Buffer.from(pdfData.split(',')[1], 'base64');
    } else {
        const pdfPath = path.join(__dirname, '../../client/public/sample.pdf');
        existingPdfBytes = fs.readFileSync(pdfPath);
    }

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Process each field
    for (const field of fields) {
        const pages = pdfDoc.getPages();
        const targetPage = pages[field.pageNumber - 1] || pages[0];
        const { width: pageWidth, height: pageHeight } = targetPage.getSize();

        // Calculate position and size in points
        const boxW = field.rect.w * pageWidth;
        const boxH = field.rect.h * pageHeight;
        const x = field.rect.x * pageWidth;
        // Y-axis flip: PDF is bottom-left origin
        const y = pageHeight - (field.rect.y * pageHeight) - boxH;

        switch (field.type) {
            case 'signature':
                // Signature image handling
                if (field.value) {
                    const signatureImageBytes = Buffer.from(field.value.split(',')[1], 'base64');
                    const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

                    // Aspect ratio preservation
                    const imgDims = signatureImage.scale(1);
                    const imgAspect = imgDims.width / imgDims.height;
                    const boxAspect = boxW / boxH;

                    let drawW, drawH;
                    if (imgAspect > boxAspect) {
                        drawW = boxW;
                        drawH = boxW / imgAspect;
                    } else {
                        drawH = boxH;
                        drawW = boxH * imgAspect;
                    }

                    const drawX = x + (boxW - drawW) / 2;
                    const drawY = y + (boxH - drawH) / 2;

                    targetPage.drawImage(signatureImage, {
                        x: drawX,
                        y: drawY,
                        width: drawW,
                        height: drawH,
                    });
                }
                break;

            case 'image':
                // Image field handling (same as signature but for uploaded images)
                if (field.value) {
                    const imageBytes = Buffer.from(field.value.split(',')[1], 'base64');
                    let embeddedImage;

                    // Detect image type from data URL
                    if (field.value.startsWith('data:image/png')) {
                        embeddedImage = await pdfDoc.embedPng(imageBytes);
                    } else if (field.value.startsWith('data:image/jpeg') || field.value.startsWith('data:image/jpg')) {
                        embeddedImage = await pdfDoc.embedJpg(imageBytes);
                    } else {
                        // Default to PNG
                        embeddedImage = await pdfDoc.embedPng(imageBytes);
                    }

                    const imgDims = embeddedImage.scale(1);
                    const imgAspect = imgDims.width / imgDims.height;
                    const boxAspect = boxW / boxH;

                    let drawW, drawH;
                    if (imgAspect > boxAspect) {
                        drawW = boxW;
                        drawH = boxW / imgAspect;
                    } else {
                        drawH = boxH;
                        drawW = boxH * imgAspect;
                    }

                    const drawX = x + (boxW - drawW) / 2;
                    const drawY = y + (boxH - drawH) / 2;

                    targetPage.drawImage(embeddedImage, {
                        x: drawX,
                        y: drawY,
                        width: drawW,
                        height: drawH,
                    });
                }
                break;

            case 'text':
                // Text field handling
                if (field.value && field.value !== 'Text Field') {
                    const fontSize = Math.min(boxH * 0.6, 12); // Adaptive font size
                    targetPage.drawText(field.value, {
                        x: x + 4,
                        y: y + (boxH - fontSize) / 2,
                        size: fontSize,
                        font: font,
                        color: rgb(0, 0, 0),
                        maxWidth: boxW - 8
                    });
                }
                break;

            case 'date':
                // Date field handling
                if (field.value) {
                    const fontSize = Math.min(boxH * 0.6, 11);
                    targetPage.drawText(field.value, {
                        x: x + 4,
                        y: y + (boxH - fontSize) / 2,
                        size: fontSize,
                        font: font,
                        color: rgb(0, 0, 0),
                    });
                }
                break;

            case 'radio':
                // Radio button handling
                const isSelected = field.value === 'true';
                const radius = Math.min(boxW, boxH) / 2;
                const centerX = x + boxW / 2;
                const centerY = y + boxH / 2;

                // Draw outer circle
                targetPage.drawCircle({
                    x: centerX,
                    y: centerY,
                    size: radius * 0.8,
                    borderColor: rgb(0.2, 0.2, 0.2),
                    borderWidth: 1.5,
                });

                // Draw filled circle if selected
                if (isSelected) {
                    targetPage.drawCircle({
                        x: centerX,
                        y: centerY,
                        size: radius * 0.4,
                        color: rgb(0.15, 0.4, 0.9), // Blue fill
                    });
                }
                break;
        }
    }

    const signedPdfBytes = await pdfDoc.save();

    // Hashing
    const originalHash = crypto.createHash('sha256').update(existingPdfBytes).digest('hex');
    const finalHash = crypto.createHash('sha256').update(signedPdfBytes).digest('hex');

    return { signedPdfBuffer: signedPdfBytes, originalHash, finalHash };
};
