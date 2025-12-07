import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

const ShopkeeperManagement = () => {
    const { shopId } = useParams();
    const [shopkeepers, setShopkeepers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newShopkeeper, setNewShopkeeper] = useState({ username: '' });

    useEffect(() => {
        fetchShopkeepers();
    }, [shopId]);

    const fetchShopkeepers = async () => {
        try {
            const response = await api.get(`/admin/shops/${shopId}/shopkeepers`);
            if (response.data.success) {
                setShopkeepers(response.data.shopkeepers);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching shopkeepers:', error);
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/admin/shops/${shopId}/shopkeepers`, newShopkeeper);
            if (response.data.success) {
                // Refresh list to get new shopkeeper with plainPassword
                fetchShopkeepers();
                setNewShopkeeper({ username: '' });
                setShowAddForm(false);
                alert('Shopkeeper created successfully!');
            }
        } catch (error) {
            const data = error.response?.data;
            let errorMessage = data?.message || 'Failed to create shopkeeper';

            if (data?.errors && Array.isArray(data.errors)) {
                errorMessage += ':\n' + data.errors.join('\n');
            }

            alert(errorMessage);
        }
    };

    const handleDelete = async (shopkeeperId) => {
        if (!confirm('Are you sure you want to delete this shopkeeper?')) return;

        try {
            await api.delete(`/admin/shops/${shopId}/shopkeepers/${shopkeeperId}`);
            setShopkeepers(shopkeepers.filter(s => s._id !== shopkeeperId));
            alert('Shopkeeper deleted successfully!');
        } catch (error) {
            alert('Failed to delete shopkeeper');
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <Link
                            to="/admin"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg mb-4 transition-all font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-white">Shopkeeper Management</h1>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn-primary"
                    >
                        {showAddForm ? 'Cancel' : '+ Add Shopkeeper'}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Add Shopkeeper Form */}
                {showAddForm && (
                    <div className="card mb-6">
                        <h2 className="text-xl font-bold text-white mb-4">Add New Shopkeeper</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Username *</label>
                                <input
                                    type="text"
                                    value={newShopkeeper.username}
                                    onChange={(e) => setNewShopkeeper({ ...newShopkeeper, username: e.target.value })}
                                    className="input max-w-md"
                                    placeholder="e.g., shopkeeper4"
                                    required
                                />
                                <p className="text-sm text-gray-400 mt-1">A random password will be generated automatically and displayed in the table.</p>
                            </div>
                            <button type="submit" className="btn-primary">Create Shopkeeper</button>
                        </form>
                    </div>
                )}

                {/* Shopkeepers List */}
                <div className="card">
                    <h2 className="text-xl font-bold text-white mb-4">Shopkeepers ({shopkeepers.length})</h2>

                    {shopkeepers.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No shopkeepers found. Add your first shopkeeper!</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-gray-300">Username</th>
                                        <th className="px-4 py-3 text-left text-gray-300">Password</th>
                                        <th className="px-4 py-3 text-left text-gray-300">Status</th>
                                        <th className="px-4 py-3 text-left text-gray-300">Created</th>
                                        <th className="px-4 py-3 text-left text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {shopkeepers.map((shopkeeper) => (
                                        <tr key={shopkeeper._id} className="hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-white font-medium">{shopkeeper.username}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-green-400 bg-gray-800 px-2 py-1 rounded">
                                                        {shopkeeper.plainPassword}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(shopkeeper.plainPassword);
                                                            alert('Password copied to clipboard!');
                                                        }}
                                                        className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-all"
                                                        title="Copy password"
                                                    >
                                                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`badge ${shopkeeper.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                    {shopkeeper.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">
                                                {new Date(shopkeeper.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDelete(shopkeeper._id)}
                                                    className="btn-danger text-sm px-3 py-1"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopkeeperManagement;
