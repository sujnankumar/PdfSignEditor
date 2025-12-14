/**
 * Coordinate System Consistensy:
 * - Browsers: Top-Left origin (0,0) is top-left.
 * - PDFs: Bottom-Left origin (0,0) is bottom-left (Usually).
 * 
 * However, we store coordinates normalized to the RENDERED dimension.
 * When sending to backend, we send normalized top-left relative coords.
 * The Backend is responsible for converting Normalized Top-Left to PDF Point Bottom-Left.
 */

/**
 * Convert pixel coordinates to normalized coordinates (0-1).
 * @param {number} x - Left position in pixels relative to PDF container
 * @param {number} y - Top position in pixels relative to PDF container
 * @param {number} width - Element width in pixels
 * @param {number} height - Element height in pixels
 * @param {number} pdfWidth - Rendered PDF width in pixels
 * @param {number} pdfHeight - Rendered PDF height in pixels
 * @returns {Object} { x: number, y: number, w: number, h: number }
 */
export const toNormalized = (x, y, width, height, pdfWidth, pdfHeight) => {
    if (!pdfWidth || !pdfHeight) return { x: 0, y: 0, w: 0, h: 0 };

    // Ensure we don't divide by zero and clamp if necessary (though UI should prevent it)
    const xPct = x / pdfWidth;
    const yPct = y / pdfHeight;
    const wPct = width / pdfWidth;
    const hPct = height / pdfHeight;

    return { x: xPct, y: yPct, w: wPct, h: hPct };
};

/**
 * Convert normalized coordinates to pixel coordinates.
 * @param {Object} normalized - { x, y, w, h }
 * @param {number} pdfWidth 
 * @param {number} pdfHeight 
 * @returns {Object} { x: number, y: number, width: number, height: number }
 */
export const toPixel = (normalized, pdfWidth, pdfHeight) => {
    if (!pdfWidth || !pdfHeight) return { x: 0, y: 0, width: 0, height: 0 };

    return {
        x: normalized.x * pdfWidth,
        y: normalized.y * pdfHeight,
        width: normalized.w * pdfWidth,
        height: normalized.h * pdfHeight,
    };
};
