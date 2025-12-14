const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createPdf() {
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 30;

    page.drawText('BoloSign Non-Disclosure Agreement', {
        x: 50,
        y: height - 4 * fontSize,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });

    page.drawText('This is a sample document for testing signature placement.', {
        x: 50,
        y: height - 6 * fontSize,
        size: 14,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });

    page.drawText('Sign Here:', {
        x: 50,
        y: height - 10 * fontSize,
        size: 14,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });

    // Draw a box placeholder for visual reference (optional)
    page.drawRectangle({
        x: 50,
        y: height - 12 * fontSize,
        width: 200,
        height: 50,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    });

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(__dirname, '../client/public/sample.pdf');

    // Ensure directory exists (client/public should exist from vite template)
    fs.writeFileSync(outputPath, pdfBytes);
    console.log('PDF created at', outputPath);
}

createPdf();
