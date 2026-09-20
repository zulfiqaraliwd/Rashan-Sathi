import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, History } from 'lucide-react';
import requestService from '../../services/requestService';
import tripService from '../../services/tripService';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { RowSkeleton } from '../../components/common/Skeleton';
import { timeAgo } from '../../utils/formatDate';

const OrderHistory = () => {
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [reqRes, tripRes] = await Promise.all([
          requestService.getMyRequests(),
          tripService.getMyTrips(),
        ]);
        if (reqRes.success) setRequests(reqRes.requests);
        if (tripRes.success) setTrips(tripRes.trips);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const items = tab === 'requests' ? requests : trips;
  const tabs = [
    { value: 'requests', label: 'Requests', count: requests.length, icon: ShoppingBag },
    { value: 'trips', label: 'Trips', count: trips.length, icon: Package },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader title="Order History" />

      {/* Segmented control with a sliding thumb */}
      <div
        role="tablist"
        className="relative mb-6 grid w-full max-w-sm grid-cols-2 rounded-2xl bg-gray-100 p-1"
      >
        <span
          aria-hidden="true"
          className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-white shadow-card transition-transform duration-300 ease-out ${
            tab === 'trips' ? 'translate-x-full' : ''
          }`}
        />
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={`relative z-10 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.value ? 'text-primary-800' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <t.icon className="size-4" aria-hidden="true" />
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={History} title="No history yet" />
      ) : (
        <div key={tab} className="space-y-3">
          {items.map((item, i) => (
            <Link
              key={item._id}
              to={tab === 'requests' ? `/request-details/${item._id}` : `/trip/${item._id}`}
              style={{ '--i': Math.min(i, 8) }}
              className="stagger flex animate-rise items-center justify-between gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lift"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">
                  {tab === 'requests'
                    ? item.itemList?.replace(/\s+/g, ' ').substring(0, 50)
                    : item.storeName}
                </p>
                <p className="mt-1 text-sm text-gray-500">{timeAgo(item.createdAt)}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <p className="font-display font-bold tabular-nums text-primary-700">
                  Rs. {item.totalAmount || item.budget || item.serviceFee}
                </p>
                <StatusBadge status={item.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
