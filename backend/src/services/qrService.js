const QRCode = require('qrcode');


/**
 * Generate QR code data and image
 * @param {string} productId - Product ID to encode
 * @returns {Promise<{qrCodeData: string, qrCodeImage: string}>}
 */
const generateQRCode = async (productId) => {
    try {
        // Generate unique QR data (combination of productId and timestamp)
        const qrCodeData = `VAPE_${productId}_${Date.now()}`;

        // Generate QR code image as Data URL
        const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
        });

        return {
            qrCodeData,
            qrCodeImage,
        };
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};

/**
 * Generate QR code from custom data
 * @param {string} data - Custom data to encode
 * @returns {Promise<string>} QR code Data URL
 */
const generateQRCodeFromData = async (data) => {
    try {
        const qrCodeImage = await QRCode.toDataURL(data, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
        });

        return qrCodeImage;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};

module.exports = {
    generateQRCode,
    generateQRCodeFromData,
};
