const { format } = require('fast-csv');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate CSV report from session report data
 * @param {Object} sessionReport - Session report document
 * @returns {Promise<string>} CSV string
 */
const generateCSVReport = async (sessionReport) => {
    return new Promise((resolve, reject) => {
        const rows = [];

        // Add header information
        rows.push(['Session Report']);
        rows.push(['Shopkeeper', sessionReport.shopkeeperUsername]);
        rows.push(['Session ID', sessionReport.sessionId]);
        rows.push(['Start Time', sessionReport.startTime.toLocaleString()]);
        rows.push(['End Time', sessionReport.endTime.toLocaleString()]);
        rows.push([]);

        // Add sold items table
        rows.push(['Product Name', 'Quantity', 'Price Per Unit', 'Total Price']);

        sessionReport.soldItems.forEach(item => {
            rows.push([
                item.productName,
                item.qty,
                `$${item.pricePerUnit.toFixed(2)}`,
                `$${item.totalPrice.toFixed(2)}`
            ]);
        });

        rows.push([]);
        rows.push(['Total Items Sold', sessionReport.totalItemsSold]);
        rows.push(['Total Amount', `$${sessionReport.totalAmount.toFixed(2)}`]);

        // Convert to CSV
        const csvStream = format({ headers: false });
        const chunks = [];

        csvStream.on('data', chunk => chunks.push(chunk));
        csvStream.on('end', () => resolve(Buffer.concat(chunks).toString()));
        csvStream.on('error', reject);

        rows.forEach(row => csvStream.write(row));
        csvStream.end();
    });
};

/**
 * Generate PDF report from session report data
 * @param {Object} sessionReport - Session report document
 * @returns {Promise<Buffer>} PDF buffer
 */
const generatePDFReport = async (sessionReport) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(20).text('Session Report', { align: 'center' });
            doc.moveDown();

            // Session details
            doc.fontSize(12);
            doc.text(`Shopkeeper: ${sessionReport.shopkeeperUsername}`);
            doc.text(`Session ID: ${sessionReport.sessionId}`);
            doc.text(`Start Time: ${sessionReport.startTime.toLocaleString()}`);
            doc.text(`End Time: ${sessionReport.endTime.toLocaleString()}`);
            doc.moveDown();

            // Sold items table
            doc.fontSize(14).text('Sold Items', { underline: true });
            doc.moveDown(0.5);

            // Table header
            doc.fontSize(10);
            const tableTop = doc.y;
            const col1 = 50;
            const col2 = 250;
            const col3 = 350;
            const col4 = 450;

            doc.text('Product Name', col1, tableTop);
            doc.text('Qty', col2, tableTop);
            doc.text('Price/Unit', col3, tableTop);
            doc.text('Total', col4, tableTop);

            // Draw line
            doc.moveTo(col1, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            let yPos = tableTop + 25;

            // Table rows
            sessionReport.soldItems.forEach((item, index) => {
                if (yPos > 700) {
                    doc.addPage();
                    yPos = 50;
                }

                doc.text(item.productName, col1, yPos, { width: 190 });
                doc.text(item.qty.toString(), col2, yPos);
                doc.text(`$${item.pricePerUnit.toFixed(2)}`, col3, yPos);
                doc.text(`$${item.totalPrice.toFixed(2)}`, col4, yPos);

                yPos += 20;
            });

            // Summary
            doc.moveDown(2);
            doc.fontSize(12);
            doc.text(`Total Items Sold: ${sessionReport.totalItemsSold}`, { align: 'right' });
            doc.fontSize(14).text(`Total Amount: $${sessionReport.totalAmount.toFixed(2)}`, {
                align: 'right',
                underline: true,
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateCSVReport,
    generatePDFReport,
};
