import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Analytics = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    const fetchAnalyticsData = async () => {
        try {
            const response = await api.get('/admin/shops');
            if (response.data.success) {
                setShops(response.data.shops);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setLoading(false);
        }
    };

    // Generate colors for charts
    const colors = [
        { bg: 'rgba(139, 92, 246, 0.7)', border: 'rgb(139, 92, 246)' },  // Purple
        { bg: 'rgba(59, 130, 246, 0.7)', border: 'rgb(59, 130, 246)' },  // Blue
        { bg: 'rgba(16, 185, 129, 0.7)', border: 'rgb(16, 185, 129)' },  // Green
        { bg: 'rgba(245, 158, 11, 0.7)', border: 'rgb(245, 158, 11)' },  // Yellow
        { bg: 'rgba(239, 68, 68, 0.7)', border: 'rgb(239, 68, 68)' },    // Red
        { bg: 'rgba(236, 72, 153, 0.7)', border: 'rgb(236, 72, 153)' },  // Pink
        { bg: 'rgba(6, 182, 212, 0.7)', border: 'rgb(6, 182, 212)' },    // Cyan
        { bg: 'rgba(251, 146, 60, 0.7)', border: 'rgb(251, 146, 60)' },  // Orange
    ];

    // Sales by Shop (Bar Chart)
    const salesByShopData = {
        labels: shops.map(shop => shop.name),
        datasets: [
            {
                label: "Today's Sales ($)",
                data: shops.map(shop => shop.stats?.todaysSales || 0),
                backgroundColor: shops.map((_, i) => colors[i % colors.length].bg),
                borderColor: shops.map((_, i) => colors[i % colors.length].border),
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    // All-Time Total Sales by Shop (Doughnut Chart) - Total profit since shop creation
    const allTimeSalesData = {
        labels: shops.map(shop => shop.name),
        datasets: [
            {
                label: 'All-Time Sales ($)',
                data: shops.map(shop => shop.stats?.allTimeSales || 0),
                backgroundColor: shops.map((_, i) => colors[i % colors.length].bg),
                borderColor: shops.map((_, i) => colors[i % colors.length].border),
                borderWidth: 2,
            },
        ],
    };

    // Total Stock Value by Shop (Bar Chart)
    const stockValueData = {
        labels: shops.map(shop => shop.name),
        datasets: [
            {
                label: 'Total Stock Value ($)',
                data: shops.map(shop => shop.stats?.totalStockValue || 0),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    // Chart options
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#fff' },
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
                ticks: { color: '#9ca3af' },
                grid: { color: 'rgba(75, 85, 99, 0.3)' },
            },
            y: {
                ticks: { color: '#9ca3af' },
                grid: { color: 'rgba(75, 85, 99, 0.3)' },
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: { color: '#fff', padding: 15 },
            },
        },
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading Analytics...</div>
            </div>
        );
    }

    // Calculate totals
    const totalSalesToday = shops.reduce((sum, shop) => sum + (shop.stats?.todaysSales || 0), 0);
    const totalProducts = shops.reduce((sum, shop) => sum + (shop.stats?.productCount || 0), 0);
    const totalStockValue = shops.reduce((sum, shop) => sum + (shop.stats?.totalStockValue || 0), 0);
    const totalAllTimeSales = shops.reduce((sum, shop) => sum + (shop.stats?.allTimeSales || 0), 0);

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </Link>
                        <h1 className="text-2xl font-bold text-white">📊 Analytics Dashboard</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <div className="card bg-gradient-to-br from-purple-900/50 to-purple-600/30 border border-purple-500/30">
                        <p className="text-gray-400 text-sm">Total Shops</p>
                        <p className="text-3xl font-bold text-purple-400">{shops.length}</p>
                    </div>
                    <div className="card bg-gradient-to-br from-blue-900/50 to-blue-600/30 border border-blue-500/30">
                        <p className="text-gray-400 text-sm">Today's Sales</p>
                        <p className="text-3xl font-bold text-blue-400">${totalSalesToday.toFixed(2)}</p>
                    </div>
                    <div className="card bg-gradient-to-br from-green-900/50 to-green-600/30 border border-green-500/30">
                        <p className="text-gray-400 text-sm">All-Time Sales</p>
                        <p className="text-3xl font-bold text-green-400">${totalAllTimeSales.toFixed(2)}</p>
                    </div>
                    <div className="card bg-gradient-to-br from-cyan-900/50 to-cyan-600/30 border border-cyan-500/30">
                        <p className="text-gray-400 text-sm">Total Products</p>
                        <p className="text-3xl font-bold text-cyan-400">{totalProducts}</p>
                    </div>
                    <div className="card bg-gradient-to-br from-yellow-900/50 to-yellow-600/30 border border-yellow-500/30">
                        <p className="text-gray-400 text-sm">Total Stock Value</p>
                        <p className="text-3xl font-bold text-yellow-400">${totalStockValue.toFixed(2)}</p>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Sales by Shop */}
                    <div className="card">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">💰</span>
                            Today's Sales by Shop
                        </h2>
                        <div className="h-64">
                            <Bar data={salesByShopData} options={barOptions} />
                        </div>
                    </div>

                    {/* All-Time Total Sales */}
                    <div className="card">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">🏆</span>
                            All-Time Total Sales (Profit Since Creation)
                        </h2>
                        <div className="h-64">
                            <Doughnut data={allTimeSalesData} options={doughnutOptions} />
                        </div>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 gap-6 mb-6">
                    {/* Stock Value by Shop */}
                    <div className="card">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">📈</span>
                            Stock Value by Shop
                        </h2>
                        <div className="h-64">
                            <Bar data={stockValueData} options={barOptions} />
                        </div>
                    </div>
                </div>

                {/* Shop Details Table */}
                <div className="card">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">🏪</span>
                        Shop Details
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-gray-300">Shop</th>
                                    <th className="px-4 py-3 text-left text-gray-300">Location</th>
                                    <th className="px-4 py-3 text-left text-gray-300">Products</th>
                                    <th className="px-4 py-3 text-left text-gray-300">Today's Sales</th>
                                    <th className="px-4 py-3 text-left text-gray-300">All-Time Sales</th>
                                    <th className="px-4 py-3 text-left text-gray-300">Stock Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {shops.map((shop, index) => (
                                    <tr key={shop._id} className="hover:bg-gray-700/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: colors[index % colors.length].border }}
                                                />
                                                <span className="text-white font-medium">{shop.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">{shop.location || 'N/A'}</td>
                                        <td className="px-4 py-3">
                                            <span className="badge badge-info">{shop.stats?.productCount || 0}</span>
                                        </td>
                                        <td className="px-4 py-3 text-blue-400 font-semibold">
                                            ${(shop.stats?.todaysSales || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">
                                            ${(shop.stats?.allTimeSales || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-yellow-400 font-semibold">
                                            ${(shop.stats?.totalStockValue || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
