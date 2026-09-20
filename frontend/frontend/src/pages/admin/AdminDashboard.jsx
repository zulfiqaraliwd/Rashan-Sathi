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
  ChevronRight,
} from 'lucide-react';
import adminService from '../../services/adminService';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import AnimatedNumber from '../../components/common/AnimatedNumber';
import { formatCurrency } from '../../utils/formatCurrency';

const money = (n) => formatCurrency(Math.round(n));

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

  if (loading) return <Loader text="Loading stats..." fullScreen />;
  if (!stats) return null;

  const cards = [
    { label: 'Total Users', value: stats.users?.total || 0, sub: `${stats.users?.verified || 0} verified`, icon: Users, tone: 'bg-sky-50 text-sky-700' },
    { label: 'Total Trips', value: stats.trips?.total || 0, sub: `${stats.trips?.active || 0} active`, icon: Package, tone: 'bg-violet-50 text-violet-700' },
    { label: 'Total Requests', value: stats.requests?.total || 0, sub: `${stats.requests?.completed || 0} completed`, icon: ShoppingBag, tone: 'bg-primary-50 text-primary-700' },
    { label: 'Reviews', value: stats.reviews || 0, sub: 'Total', icon: Star, tone: 'bg-accent-50 text-accent-700' },
  ];

  const actions = [
    { to: '/admin/users', icon: Users, title: 'Users', text: 'Manage users', tone: 'bg-primary-50 text-primary-700' },
    { to: '/admin/disputes', icon: AlertTriangle, title: 'Disputes', text: 'Resolve disputes', tone: 'bg-red-50 text-red-600' },
    { to: '/admin/transactions', icon: Wallet, title: 'Transactions', text: 'View all', tone: 'bg-accent-50 text-accent-700' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <PageHeader title="Admin Dashboard" subtitle="Platform overview" />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card, i) => (
          <div
            key={card.label}
            style={{ '--i': i }}
            className="stagger animate-rise rounded-2xl border border-gray-200/80 bg-white p-5 shadow-card"
          >
            <span className={`flex size-10 items-center justify-center rounded-xl ${card.tone}`}>
              <card.icon className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm text-gray-500">{card.label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-gray-900">
              <AnimatedNumber value={card.value} />
            </p>
            <p className="mt-1 text-xs text-gray-500">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div
          className="stagger animate-rise rounded-3xl bg-primary-900 p-6 text-white shadow-lift sm:p-8"
          style={{ '--i': 4 }}
        >
          <div className="flex items-center gap-2.5 text-primary-100/90">
            <Wallet className="size-5" aria-hidden="true" />
            <span className="font-medium">Total Volume</span>
          </div>
          <p className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            <AnimatedNumber value={stats.revenue?.totalVolume || 0} format={money} />
          </p>
          <p className="mt-2 text-sm text-primary-100/75">
            {stats.revenue?.count || 0} transactions
          </p>
        </div>

        <div
          className="stagger animate-rise rounded-3xl border border-accent-200 bg-accent-50 p-6 sm:p-8"
          style={{ '--i': 5 }}
        >
          <div className="flex items-center gap-2.5 text-accent-700">
            <TrendingUp className="size-5" aria-hidden="true" />
            <span className="font-medium">Platform Commission</span>
          </div>
          <p className="mt-3 font-display text-4xl font-bold text-gray-900 sm:text-5xl">
            <AnimatedNumber value={stats.revenue?.totalCommission || 0} format={money} />
          </p>
          <p className="mt-2 text-sm text-accent-700">Total earned</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className="stagger mt-6 animate-rise rounded-3xl border border-gray-200/80 bg-white p-6 shadow-card"
        style={{ '--i': 6 }}
      >
        <h2 className="mb-4 text-xl font-bold text-gray-900">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="group flex items-center gap-4 rounded-2xl border border-gray-200 p-4 transition hover:border-primary-300 hover:bg-primary-50/40"
            >
              <span className={`flex size-11 items-center justify-center rounded-xl ${a.tone}`}>
                <a.icon className="size-5" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-500">{a.text}</p>
              </div>
              <ChevronRight
                className="size-4 text-gray-400 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
