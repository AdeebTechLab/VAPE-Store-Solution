import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ShopkeeperReports = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const shopDbName = user?.shopDbName || 'shop_db_1';
            const response = await api.get(`/shop/${shopDbName}/reports`);
            if (response.data.success) {
                setReports(response.data.reports);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const shopDbName = user?.shopDbName || 'shop_db_1';
            await api.post(`/shop/${shopDbName}/logout`);
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Error during logout:', error);
            logout();
            navigate('/login');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading reports...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Navigation */}
            <nav className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/shop')}
                                className="text-gray-400 hover:text-white flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Shop
                            </button>
                            <h1 className="text-xl font-bold">My Session Reports</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-400 text-sm">{user?.username}</span>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1 bg-red-600/20 text-red-500 hover:bg-red-600/30 rounded-lg text-sm font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Reports List */}
                <div className="grid grid-cols-1 gap-6">
                    {reports.length === 0 ? (
                        <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400">
                            No session reports found.
                        </div>
                    ) : (
                        reports.map((report) => (
                            <div key={report._id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                                {/* Header */}
                                <div
                                    className="p-4 bg-gray-750 flex flex-wrap gap-4 justify-between items-center cursor-pointer hover:bg-gray-700 transition-colors"
                                    onClick={() => setSelectedReport(selectedReport?._id === report._id ? null : report)}
                                >
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider">Date</p>
                                            <p className="font-medium text-white">
                                                {new Date(report.startTime).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider">Duration</p>
                                            <p className="font-medium text-white">
                                                {new Date(report.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(report.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-8 items-center">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase tracking-wider">Items Sold</p>
                                            <p className="font-medium text-white">{report.totalItemsSold}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase tracking-wider">Total Sales</p>
                                            <p className="font-bold text-green-400 text-lg">Rs {report.totalAmount.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase tracking-wider">Cash Submitted</p>
                                            <p className={`font-medium ${report.isReconciled ? 'text-green-400' : 'text-yellow-400'}`}>
                                                Rs {report.cashSubmitted.toLocaleString()}
                                            </p>
                                        </div>
                                        <svg
                                            className={`w-5 h-5 text-gray-400 transform transition-transform ${selectedReport?._id === report._id ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {selectedReport?._id === report._id && (
                                    <div className="p-4 border-t border-gray-700 bg-gray-800/50">
                                        <h3 className="text-lg font-bold mb-4 text-white">Session Details</h3>

                                        {/* Sold Items Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="text-gray-400 text-sm border-b border-gray-700">
                                                        <th className="py-2 px-4">Item</th>
                                                        <th className="py-2 px-4 text-right">Qty</th>
                                                        <th className="py-2 px-4 text-right">Price</th>
                                                        <th className="py-2 px-4 text-right">Total</th>
                                                        <th className="py-2 px-4 text-right">Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm">
                                                    {report.soldItems.map((item, idx) => (
                                                        <tr key={idx} className="border-b border-gray-700/50 last:border-0 hover:bg-gray-700/30">
                                                            <td className="py-2 px-4 text-white">{item.productName}</td>
                                                            <td className="py-2 px-4 text-right text-gray-300">{item.qty}</td>
                                                            <td className="py-2 px-4 text-right text-gray-300">Rs {item.pricePerUnit}</td>
                                                            <td className="py-2 px-4 text-right font-medium text-green-400">Rs {item.totalPrice}</td>
                                                            <td className="py-2 px-4 text-right text-gray-500">
                                                                {new Date(item.soldAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Financial Summary */}
                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-700/30 p-4 rounded-lg">
                                                <h4 className="font-bold text-gray-300 mb-2">Spending</h4>
                                                {report.spendings && report.spendings.length > 0 ? (
                                                    <ul className="space-y-1">
                                                        {report.spendings.map((spending, idx) => (
                                                            <li key={idx} className="flex justify-between text-sm">
                                                                <span className="text-gray-400">{spending.reason}</span>
                                                                <span className="text-white">Rs {spending.amount}</span>
                                                            </li>
                                                        ))}
                                                        <li className="flex justify-between text-sm font-bold pt-2 mt-1 border-t border-gray-600">
                                                            <span className="text-gray-300">Total Spending</span>
                                                            <span className="text-white">Rs {report.totalSpending || 0}</span>
                                                        </li>
                                                    </ul>
                                                ) : (
                                                    <p className="text-sm text-gray-500">No spending recorded.</p>
                                                )}
                                            </div>

                                            <div className="bg-gray-700/30 p-4 rounded-lg">
                                                <h4 className="font-bold text-gray-300 mb-2">Balance</h4>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Total Sales</span>
                                                        <span className="text-white">Rs {report.totalAmount}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Total Spending</span>
                                                        <span className="text-red-400">- Rs {report.totalSpending || 0}</span>
                                                    </div>
                                                    <div className="flex justify-between font-bold pt-2 mt-1 border-t border-gray-600">
                                                        <span className="text-gray-300">Net Cash</span>
                                                        <span className="text-green-400">Rs {(report.totalAmount - (report.totalSpending || 0))}</span>
                                                    </div>
                                                    <div className="flex justify-between pt-2">
                                                        <span className="text-gray-400">Cash Submitted</span>
                                                        <span className="text-blue-400">Rs {report.cashSubmitted}</span>
                                                    </div>
                                                    {report.remainingBalance !== 0 && (
                                                        <div className="flex justify-between pt-1">
                                                            <span className="text-gray-400">Difference</span>
                                                            <span className={`${report.remainingBalance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                                {report.remainingBalance > 0 ? 'Short' : 'Excess'} Rs {Math.abs(report.remainingBalance)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopkeeperReports;
