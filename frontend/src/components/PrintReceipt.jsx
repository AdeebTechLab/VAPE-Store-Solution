import { useRef } from 'react';

const PrintReceipt = ({ receipt, onClose }) => {
    const printRef = useRef(null);

    const handlePrint = () => {
        const printContent = printRef.current;
        const printWindow = window.open('', '_blank', 'width=300,height=600');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Receipt</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                            font-family: 'Courier New', monospace;
                        }
                        body {
                            width: 80mm;
                            padding: 10px;
                            font-size: 12px;
                        }
                        .receipt {
                            text-align: center;
                        }
                        .header {
                            border-bottom: 2px dashed #000;
                            padding-bottom: 10px;
                            margin-bottom: 10px;
                        }
                        .shop-name {
                            font-size: 18px;
                            font-weight: bold;
                            margin-bottom: 5px;
                        }
                        .shop-tagline {
                            font-size: 10px;
                            color: #555;
                        }
                        .info {
                            text-align: left;
                            margin: 10px 0;
                            font-size: 11px;
                        }
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            margin: 3px 0;
                        }
                        .items {
                            border-top: 1px dashed #000;
                            border-bottom: 1px dashed #000;
                            padding: 10px 0;
                            margin: 10px 0;
                        }
                        .item {
                            display: flex;
                            justify-content: space-between;
                            margin: 5px 0;
                        }
                        .item-name {
                            text-align: left;
                            flex: 1;
                        }
                        .item-qty {
                            width: 30px;
                            text-align: center;
                        }
                        .item-price {
                            width: 60px;
                            text-align: right;
                        }
                        .total-section {
                            border-top: 2px solid #000;
                            padding-top: 10px;
                            margin-top: 10px;
                        }
                        .total-row {
                            display: flex;
                            justify-content: space-between;
                            font-size: 14px;
                            font-weight: bold;
                            margin: 5px 0;
                        }
                        .footer {
                            margin-top: 20px;
                            text-align: center;
                            font-size: 10px;
                            border-top: 1px dashed #000;
                            padding-top: 10px;
                        }
                        .thank-you {
                            font-size: 14px;
                            font-weight: bold;
                            margin-bottom: 5px;
                        }
                        .barcode {
                            margin: 10px 0;
                            font-size: 8px;
                            letter-spacing: 2px;
                        }
                        @media print {
                            body { width: 80mm; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const generateReceiptNo = () => {
        return `RCP-${Date.now().toString(36).toUpperCase()}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-2xl">
                {/* Preview Header */}
                <div className="bg-gray-800 text-white p-4 text-center">
                    <h3 className="text-lg font-bold">Receipt Preview</h3>
                    <p className="text-xs text-gray-400">Click Print to send to printer</p>
                </div>

                {/* Receipt Content (for printing) */}
                <div ref={printRef} className="p-6 bg-white text-black">
                    <div className="receipt">
                        {/* Header */}
                        <div className="header">
                            <div className="shop-name">{receipt.shopName || 'VAPESHOP'}</div>
                            <div className="shop-tagline">Your Premium Vape Store</div>
                        </div>

                        {/* Info */}
                        <div className="info">
                            <div className="info-row">
                                <span>Date:</span>
                                <span>{formatDate(receipt.date)}</span>
                            </div>
                            <div className="info-row">
                                <span>Time:</span>
                                <span>{formatTime(receipt.date)}</span>
                            </div>
                            <div className="info-row">
                                <span>Receipt #:</span>
                                <span>{receipt.receiptNo || generateReceiptNo()}</span>
                            </div>
                            <div className="info-row">
                                <span>Cashier:</span>
                                <span>{receipt.cashier || 'Staff'}</span>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="items">
                            <div className="item" style={{ fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                                <span className="item-name">ITEM</span>
                                <span className="item-qty">QTY</span>
                                <span className="item-price">PRICE</span>
                            </div>
                            {receipt.items.map((item, index) => (
                                <div key={index} className="item">
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-qty">x{item.qty}</span>
                                    <span className="item-price">${(item.price * item.qty).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="total-section">
                            <div className="info-row">
                                <span>Subtotal:</span>
                                <span>${receipt.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="info-row">
                                <span>Tax (0%):</span>
                                <span>$0.00</span>
                            </div>
                            <div className="total-row">
                                <span>TOTAL:</span>
                                <span>${receipt.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="footer">
                            <div className="thank-you">Thank You!</div>
                            <div>Please come again</div>
                            <div className="barcode">
                                ||||| {receipt.receiptNo || generateReceiptNo()} |||||
                            </div>
                            <div style={{ marginTop: '10px', fontSize: '8px' }}>
                                Powered by VapeShop POS
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrintReceipt;
