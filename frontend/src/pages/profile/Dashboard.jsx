import { Package, ShoppingBag, Star, TrendingUp, Wallet, User, BadgeCheck } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import AnimatedNumber from '../../components/common/AnimatedNumber';
import { formatCurrency } from '../../utils/formatCurrency';

const money = (n) => formatCurrency(Math.round(n));

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Trips Posted', value: user?.totalTripsPosted || 0, icon: Package, tone: 'bg-sky-50 text-sky-700' },
    { label: 'Requests Made', value: user?.totalRequestsMade || 0, icon: ShoppingBag, tone: 'bg-violet-50 text-violet-700' },
    { label: 'Total Earned', value: user?.totalEarnings || 0, icon: Wallet, tone: 'bg-primary-50 text-primary-700', currency: true },
    { label: 'Total Spent', value: user?.totalSpent || 0, icon: TrendingUp, tone: 'bg-accent-50 text-accent-700', currency: true },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="animate-rise rounded-3xl bg-primary-900 p-6 text-white shadow-lift sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={user?.name} src={user?.profileImage} size="xl" className="ring-white/20!" />
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-bold sm:text-4xl">{user?.name}</h1>
            <p className="mt-1 truncate text-primary-100/80">{user?.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm">
                <Star className="size-4 fill-accent-400 text-accent-400" aria-hidden="true" />
                <span className="tabular-nums">
                  {user?.rating?.toFixed(1) || '0.0'} ({user?.reviewCount || 0} reviews)
                </span>
              </span>
              {user?.isPhoneVerified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-400 px-3 py-1 text-sm font-semibold text-primary-950">
                  <BadgeCheck className="size-4" aria-hidden="true" />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            style={{ '--i': i + 2 }}
            className="stagger animate-rise rounded-2xl border border-gray-200/80 bg-white p-5 shadow-card"
          >
            <span className={`flex size-10 items-center justify-center rounded-xl ${stat.tone}`}>
              <stat.icon className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-gray-900">
              <AnimatedNumber value={stat.value} format={stat.currency ? money : undefined} />
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        className="stagger mt-6 animate-rise rounded-3xl border border-gray-200/80 bg-white p-6 shadow-card"
        style={{ '--i': 6 }}
      >
        <h2 className="mb-4 text-xl font-bold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Button to="/post-trip" fullWidth>
            <Package className="size-4" aria-hidden="true" />
            Post Trip
          </Button>
          <Button to="/my-trips" variant="outline" fullWidth>
            My Trips
          </Button>
          <Button to="/my-requests" variant="outline" fullWidth>
            My Requests
          </Button>
          <Button to="/profile" variant="outline" fullWidth>
            <User className="size-4" aria-hidden="true" />
            Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
