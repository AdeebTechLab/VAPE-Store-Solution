import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Reports = () => {
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState('');
    const [shopkeepers, setShopkeepers] = useState([]);
    const [selectedShopkeeper, setSelectedShopkeeper] = useState('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingShopkeepers, setLoadingShopkeepers] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');

    // Session reconciliation state (separate from sales report)
    const [sessionShop, setSessionShop] = useState('all');
    const [sessionReports, setSessionReports] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [depositInputs, setDepositInputs] = useState({}); // { reportId: amount }
    const [depositingId, setDepositingId] = useState(null);
    const [sessionError, setSessionError] = useState('');

    useEffect(() => {
        fetchShops();
        // Set default dates (last 7 days)
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        setToDate(today.toISOString().split('T')[0]);
        setFromDate(weekAgo.toISOString().split('T')[0]);
    }, []);

    const fetchShops = async () => {
        try {
            const response = await api.get('/admin/shops');
            if (response.data.success) {
                setShops(response.data.shops);
                if (response.data.shops.length > 0) {
                    setSelectedShop(response.data.shops[0]._id);
                }
            }
        } catch (error) {
            console.error('Error fetching shops:', error);
        }
    };

    // Fetch shopkeepers when shop changes (for sales report)
    useEffect(() => {
        if (selectedShop) {
            fetchShopkeepers(selectedShop);
        }
    }, [selectedShop]);

    // Fetch session reports when sessionShop changes or when shops are loaded
    useEffect(() => {
        if (shops.length > 0) {
            fetchSessionReports();
        }
    }, [sessionShop, shops]);

    const fetchShopkeepers = async (shopId) => {
        setLoadingShopkeepers(true);
        setSelectedShopkeeper('all');
        try {
            const response = await api.get(`/admin/shops/${shopId}/shopkeepers`);
            if (response.data.success) {
                setShopkeepers(response.data.shopkeepers || []);
            }
        } catch (error) {
            console.error('Error fetching shopkeepers:', error);
            setShopkeepers([]);
        } finally {
            setLoadingShopkeepers(false);
        }
    };

    const fetchSessionReports = async () => {
        setLoadingSessions(true);
        setSessionError('');
        try {
            let allReports = [];

            if (sessionShop === 'all') {
                // Fetch from all shops
                for (const shop of shops) {
                    try {
                        const response = await api.get(`/admin/shops/${shop._id}/session-reports?limit=50`);
                        if (response.data.success) {
                            const reportsWithShop = (response.data.reports || []).map(r => ({
                                ...r,
                                shopName: shop.name,
                                shopId: shop._id,
                            }));
                            allReports = [...allReports, ...reportsWithShop];
                        }
                    } catch (err) {
                        console.error(`Error fetching sessions for shop ${shop.name}:`, err);
                    }
                }
                // Sort by endTime descending
                allReports.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
            } else {
                // Fetch from specific shop
                const shop = shops.find(s => s._id === sessionShop);
                const response = await api.get(`/admin/shops/${sessionShop}/session-reports?limit=50`);
                if (response.data.success) {
                    allReports = (response.data.reports || []).map(r => ({
                        ...r,
                        shopName: shop?.name || 'Unknown',
                        shopId: sessionShop,
                    }));
                }
            }

            setSessionReports(allReports);
        } catch (error) {
            console.error('Error fetching session reports:', error);
            setSessionError('Failed to load session reports');
            setSessionReports([]);
        } finally {
            setLoadingSessions(false);
        }
    };

    const handlePreview = async () => {
        if (!selectedShop || !fromDate || !toDate) {
            setError('Please select shop and date range');
            return;
        }

        setLoading(true);
        setError('');
        setPreview(null);

        try {
            const response = await api.get(
                `/admin/shops/${selectedShop}/sales-report?from=${fromDate}&to=${toDate}&format=json&shopkeeper=${selectedShopkeeper}`
            );
            if (response.data.success) {
                setPreview(response.data);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!selectedShop || !fromDate || !toDate) {
            setError('Please select shop and date range');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.get(
                `/admin/shops/${selectedShop}/sales-report?from=${fromDate}&to=${toDate}&format=excel&shopkeeper=${selectedShopkeeper}`,
                { responseType: 'blob' }
            );

            // Create download link for Excel file
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const shop = shops.find(s => s._id === selectedShop);
            const filename = `${shop?.name || 'Shop'}_sales_${fromDate}_to_${toDate}.xlsx`;
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setError('Failed to download report');
        } finally {
            setLoading(false);
        }
    };

    // Session reconciliation handlers
    const handleDepositInputChange = (reportId, value) => {
        setDepositInputs(prev => ({
            ...prev,
            [reportId]: value
        }));
    };

    const handleDeposit = async (session) => {
        const depositAmount = parseFloat(depositInputs[session._id]) || 0;

        if (depositAmount <= 0) {
            alert('Please enter a valid deposit amount');
            return;
        }

        // Calculate remaining balance (what's still owed)
        const currentRemaining = session.totalAmount - (session.cashSubmitted || 0);

        if (depositAmount > currentRemaining) {
            alert(`Cannot deposit more than remaining balance (Rs ${currentRemaining.toFixed(2)})`);
            return;
        }

        setDepositingId(session._id);

        try {
            // New total cash submitted = current + deposit
            const newCashSubmitted = (session.cashSubmitted || 0) + depositAmount;

            const response = await api.put(
                `/admin/shops/${session.shopId}/session-reports/${session._id}/reconcile`,
                { cashSubmitted: newCashSubmitted }
            );

            if (response.data.success) {
                // Update the session in state
                setSessionReports(prev =>
                    prev.map(s =>
                        s._id === session._id
                            ? {
                                ...s,
                                cashSubmitted: response.data.report.cashSubmitted,
                                remainingBalance: response.data.report.remainingBalance,
                                isReconciled: response.data.report.isReconciled,
                                reconciledAt: response.data.report.reconciledAt,
                            }
                            : s
                    )
                );
                // Clear input
                setDepositInputs(prev => ({
                    ...prev,
                    [session._id]: ''
                }));
            }
        } catch (error) {
            alert('Failed to record deposit');
        } finally {
            setDepositingId(null);
        }
    };

    const handleDeleteSession = async (session) => {
        if (!confirm('Are you sure you want to delete this session report? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/admin/shops/${session.shopId}/session-reports/${session._id}`);
            setSessionReports(prev => prev.filter(s => s._id !== session._id));
        } catch (error) {
            alert('Failed to delete session report');
        }
    };

    const formatDateTime = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="max-w-7xl mx-auto">
                    <Link
                        to="/admin"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg mb-4 transition-all font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-white">📊 Sales Reports</h1>
                    <p className="text-gray-400 text-sm">Download detailed sales reports for any shop</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Report Configuration */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Generate Report</h2>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        {/* Shop Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Select Shop</label>
                            <select
                                value={selectedShop}
                                onChange={(e) => setSelectedShop(e.target.value)}
                                className="input"
                            >
                                {shops.map((shop) => (
                                    <option key={shop._id} value={shop._id}>
                                        {shop.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Shopkeeper Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Select Shopkeeper
                                {loadingShopkeepers && <span className="text-gray-500 ml-2">(loading...)</span>}
                            </label>
                            <select
                                value={selectedShopkeeper}
                                onChange={(e) => setSelectedShopkeeper(e.target.value)}
                                className="input"
                                disabled={loadingShopkeepers}
                            >
                                <option value="all">👥 All Shopkeepers</option>
                                {shopkeepers.map((sk) => (
                                    <option key={sk._id} value={sk.username}>
                                        {sk.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* From Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="input"
                            />
                        </div>

                        {/* To Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="input"
                            />
                        </div>

                        {/* Quick Date Presets */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Quick Select</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const today = new Date();
                                        const weekAgo = new Date();
                                        weekAgo.setDate(weekAgo.getDate() - 7);
                                        setFromDate(weekAgo.toISOString().split('T')[0]);
                                        setToDate(today.toISOString().split('T')[0]);
                                    }}
                                    className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
                                >
                                    7 Days
                                </button>
                                <button
                                    onClick={() => {
                                        const today = new Date();
                                        const monthAgo = new Date();
                                        monthAgo.setDate(monthAgo.getDate() - 30);
                                        setFromDate(monthAgo.toISOString().split('T')[0]);
                                        setToDate(today.toISOString().split('T')[0]);
                                    }}
                                    className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
                                >
                                    30 Days
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-400 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={handlePreview}
                            disabled={loading}
                            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {loading ? 'Loading...' : 'Preview Report'}
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={loading}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {loading ? 'Downloading...' : 'Download CSV'}
                        </button>
                    </div>
                </div>

                {/* Report Preview */}
                {preview && (
                    <div className="card mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Report Preview</h2>
                            <div className="text-right">
                                <p className="text-gray-400">
                                    {preview.shop.name} | {preview.period.from} to {preview.period.to}
                                </p>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                                <p className="text-gray-400 text-sm">Total Transactions</p>
                                <p className="text-3xl font-bold text-white">{preview.summary.totalTransactions}</p>
                            </div>
                            <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                                <p className="text-gray-400 text-sm">Items Sold</p>
                                <p className="text-3xl font-bold text-blue-400">{preview.summary.totalItems}</p>
                            </div>
                            <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                                <p className="text-gray-400 text-sm">Total Sales</p>
                                <p className="text-3xl font-bold text-green-400">Rs {preview.summary.totalSales.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        {preview.transactions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-gray-300">Date</th>
                                            <th className="px-4 py-3 text-left text-gray-300">Time</th>
                                            <th className="px-4 py-3 text-left text-gray-300">Product</th>
                                            <th className="px-4 py-3 text-left text-gray-300">Category</th>
                                            <th className="px-4 py-3 text-left text-gray-300">Qty</th>
                                            <th className="px-4 py-3 text-left text-gray-300">Unit Price</th>
                                            <th className="px-4 py-3 text-left text-gray-300">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {preview.transactions.slice(0, 50).map((tx, index) => (
                                            <tr key={index} className="hover:bg-gray-700/50">
                                                <td className="px-4 py-3 text-gray-300">{tx.date}</td>
                                                <td className="px-4 py-3 text-gray-400">{tx.time}</td>
                                                <td className="px-4 py-3 text-white font-medium">{tx.productName}</td>
                                                <td className="px-4 py-3">
                                                    <span className="badge badge-info">{tx.category}</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-300">{tx.quantity}</td>
                                                <td className="px-4 py-3 text-gray-300">Rs {tx.unitPrice.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-green-400 font-semibold">Rs {tx.totalPrice.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {preview.transactions.length > 50 && (
                                    <p className="text-center text-gray-500 py-4">
                                        Showing first 50 of {preview.transactions.length} transactions. Download CSV for full data.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                No transactions found for this date range.
                            </div>
                        )}
                    </div>
                )}

                {/* Session Reconciliation Section */}
                <div className="card">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                💰 Session Reconciliation
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                Track cash deposits from shopkeepers for each session
                            </p>
                        </div>

                        {/* Shop filter for sessions */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-400">Filter by Shop:</label>
                            <select
                                value={sessionShop}
                                onChange={(e) => setSessionShop(e.target.value)}
                                className="input w-48"
                            >
                                <option value="all">🏪 All Shops</option>
                                {shops.map((shop) => (
                                    <option key={shop._id} value={shop._id}>
                                        {shop.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {sessionError && (
                        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-400 rounded-lg">
                            {sessionError}
                        </div>
                    )}

                    {loadingSessions ? (
                        <div className="text-center py-12 text-gray-400">
                            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                            Loading session reports...
                        </div>
                    ) : sessionReports.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>No session reports found</p>
                            <p className="text-sm text-gray-500 mt-1">Reports are created when shopkeepers logout</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-gray-300">Shopkeeper</th>
                                        {sessionShop === 'all' && (
                                            <th className="px-4 py-3 text-left text-gray-300">Shop</th>
                                        )}
                                        <th className="px-4 py-3 text-left text-gray-300">Date & Time</th>
                                        <th className="px-4 py-3 text-right text-gray-300">Total Sales</th>
                                        <th className="px-4 py-3 text-right text-gray-300">Deposited</th>
                                        <th className="px-4 py-3 text-right text-gray-300">Remaining</th>
                                        <th className="px-4 py-3 text-center text-gray-300">Add Deposit</th>
                                        <th className="px-4 py-3 text-center text-gray-300">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {sessionReports.map((session) => {
                                        const remaining = session.totalAmount - (session.cashSubmitted || 0);
                                        const isFullyPaid = remaining <= 0;

                                        return (
                                            <tr key={session._id} className={`hover:bg-gray-700/50 ${isFullyPaid ? 'bg-green-900/10' : ''}`}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                                                            {session.shopkeeperUsername?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                        <span className="text-white font-medium">{session.shopkeeperUsername}</span>
                                                    </div>
                                                </td>
                                                {sessionShop === 'all' && (
                                                    <td className="px-4 py-3 text-gray-300">
                                                        <span className="px-2 py-1 bg-gray-700 rounded text-sm">{session.shopName}</span>
                                                    </td>
                                                )}
                                                <td className="px-4 py-3 text-gray-300">
                                                    <div>{formatDateTime(session.endTime)}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {session.totalItemsSold || 0} items sold
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right text-green-400 font-semibold">
                                                    Rs {session.totalAmount?.toFixed(2) || '0.00'}
                                                </td>
                                                <td className="px-4 py-3 text-right text-blue-400 font-medium">
                                                    Rs {(session.cashSubmitted || 0).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`font-semibold ${remaining > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                        Rs {remaining.toFixed(2)}
                                                    </span>
                                                    {isFullyPaid && (
                                                        <span className="ml-2 text-green-500">✓</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {!isFullyPaid && (
                                                        <div className="flex items-center gap-2 justify-center">
                                                            <input
                                                                type="number"
                                                                placeholder="Amount"
                                                                value={depositInputs[session._id] || ''}
                                                                onChange={(e) => handleDepositInputChange(session._id, e.target.value)}
                                                                className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-right text-sm"
                                                                min="0"
                                                                max={remaining}
                                                            />
                                                            <button
                                                                onClick={() => handleDeposit(session)}
                                                                disabled={depositingId === session._id || !depositInputs[session._id]}
                                                                className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
                                                            >
                                                                {depositingId === session._id ? '...' : 'Deposit'}
                                                            </button>
                                                        </div>
                                                    )}
                                                    {isFullyPaid && (
                                                        <span className="text-green-400 text-sm">Fully Paid</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => handleDeleteSession(session)}
                                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
