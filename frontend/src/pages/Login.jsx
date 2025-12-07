import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const Login = () => {
    const [role, setRole] = useState('admin'); // 'admin' or 'shopkeeper'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [shopId, setShopId] = useState('');
    const [shops, setShops] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/shop');
            }
        }
    }, [isAuthenticated, user, navigate]);

    // Fetch shops for shopkeeper login
    useEffect(() => {
        if (role === 'shopkeeper') {
            fetchShops();
        }
    }, [role]);

    const fetchShops = async () => {
        try {
            const data = await authService.getShops();
            if (data.success) {
                setShops(data.shops);
                if (data.shops.length > 0) {
                    setShopId(data.shops[0]._id);
                }
            }
        } catch (error) {
            console.error('Error fetching shops:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const credentials = role === 'admin'
            ? { username, password }
            : { shopId, username, password };

        const result = await login(credentials, role);

        if (result.success) {
            if (result.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/shop');
            }
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4 py-4">
            <div className="max-w-sm w-full">
                {/* Logo/Header */}
                <div className="text-center mb-4">
                    <div className="inline-block p-2 bg-gradient-primary rounded-xl mb-2">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gradient">VapeShop POS</h1>
                    <p className="text-gray-400 text-xs">Inventory & Sales Management</p>
                </div>

                {/* Login Card */}
                <div className="card p-4">
                    {/* Role Selector */}
                    <div className="flex gap-2 mb-4">
                        <button
                            type="button"
                            onClick={() => setRole('admin')}
                            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${role === 'admin'
                                ? 'bg-primary text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('shopkeeper')}
                            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${role === 'shopkeeper'
                                ? 'bg-primary text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Shopkeeper
                        </button>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {role === 'shopkeeper' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Select Shop
                                </label>
                                <select
                                    value={shopId}
                                    onChange={(e) => setShopId(e.target.value)}
                                    className="input"
                                    required
                                >
                                    {shops.map((shop) => (
                                        <option key={shop._id} value={shop._id}>
                                            {shop.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input"
                                placeholder={role === 'admin' ? 'admin' : 'shopkeeper1'}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Logging in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <p className="text-xs text-gray-400 text-center mb-2">Demo Credentials:</p>
                        <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex justify-between">
                                <span>Admin:</span>
                                <span className="font-mono">admin / vapeshop121!</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shopkeeper:</span>
                                <span className="font-mono">shopkeeper1 / password123</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
