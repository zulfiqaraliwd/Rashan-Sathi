import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingBag,
  Star,
  Wallet,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import adminService from '../../services/adminService';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatCurrency';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getStats();
        if (response.success) setStats(response.stats);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader text="Stats load ho rahi hain..." fullScreen />;
  if (!stats) return null;

  const cards = [
    {
      label: 'Total Users',
      value: stats.users?.total || 0,
      sub: `${stats.users?.verified || 0} verified`,
      icon: Users,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Total Trips',
      value: stats.trips?.total || 0,
      sub: `${stats.trips?.active || 0} active`,
      icon: Package,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      label: 'Total Requests',
      value: stats.requests?.total || 0,
      sub: `${stats.requests?.completed || 0} completed`,
      icon: ShoppingBag,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: 'Reviews',
      value: stats.reviews || 0,
      sub: 'Total',
      icon: Star,
      color: 'bg-yellow-100 text-yellow-700',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Platform ka overview</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-5">
            <div
              className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}
            >
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-6 h-6" />
            <span className="font-medium">Total Volume</span>
          </div>
          <p className="text-3xl font-bold">
            {formatCurrency(stats.revenue?.totalVolume || 0)}
          </p>
          <p className="text-sm text-primary-100 mt-1">
            {stats.revenue?.count || 0} transactions
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-6 h-6" />
            <span className="font-medium">Platform Commission</span>
          </div>
          <p className="text-3xl font-bold">
            {formatCurrency(stats.revenue?.totalCommission || 0)}
          </p>
          <p className="text-sm text-green-100 mt-1">Total earned</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/admin/users"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Users className="w-6 h-6 text-primary-600" />
            <div>
              <p className="font-medium">Users</p>
              <p className="text-xs text-gray-500">Manage users</p>
            </div>
          </Link>

          <Link
            to="/admin/disputes"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-medium">Disputes</p>
              <p className="text-xs text-gray-500">Resolve disputes</p>
            </div>
          </Link>

          <Link
            to="/admin/transactions"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Wallet className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium">Transactions</p>
              <p className="text-xs text-gray-500">View all</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;