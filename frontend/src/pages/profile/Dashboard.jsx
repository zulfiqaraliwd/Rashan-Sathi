import { Link } from 'react-router-dom';
import {
  User,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatCurrency';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Trips Posted',
      value: user?.totalTripsPosted || 0,
      icon: Package,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Requests Made',
      value: user?.totalRequestsMade || 0,
      icon: ShoppingBag,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      label: 'Total Earned',
      value: formatCurrency(user?.totalEarnings || 0),
      icon: Wallet,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: 'Total Spent',
      value: formatCurrency(user?.totalSpent || 0),
      icon: TrendingUp,
      color: 'bg-yellow-100 text-yellow-700',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 sm:p-8 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{user?.name}</h1>
            <p className="text-primary-100">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
              <span className="text-sm">
                {user?.rating?.toFixed(1) || '0.0'} (
                {user?.reviewCount || 0} reviews)
              </span>
              {user?.isPhoneVerified && (
                <span className="bg-green-400 text-green-900 text-xs px-2 py-0.5 rounded-full font-medium">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-4">
            <div
              className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}
            >
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/post-trip">
            <Button variant="primary" fullWidth>
              <Package className="w-4 h-4" />
              Post Trip
            </Button>
          </Link>
          <Link to="/my-trips">
            <Button variant="outline" fullWidth>
              Meri Trips
            </Button>
          </Link>
          <Link to="/my-requests">
            <Button variant="outline" fullWidth>
              Meri Requests
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" fullWidth>
              <User className="w-4 h-4" />
              Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;