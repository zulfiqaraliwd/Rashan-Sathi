import { useState, useEffect } from 'react';
import { Plus, Package, Clock, ChevronRight, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import tripService from '../../services/tripService';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { RowSkeleton } from '../../components/common/Skeleton';
import SlotMeter from '../../components/trips/SlotMeter';
import { formatDateTime, formatTimeWindow } from '../../utils/formatDate';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTrips = async () => {
      try {
        const response = await tripService.getMyTrips();
        if (response.success) setTrips(response.trips);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTrips();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="My Trips"
        subtitle={`${trips.length} trips total`}
        actions={
          <Button to="/post-trip">
            <Plus className="size-4" aria-hidden="true" />
            New Trip
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No trips yet"
          description="Post your first grocery trip"
          action={
            <Button to="/post-trip">
              <Plus className="size-4" aria-hidden="true" />
              Post a Trip
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {trips.map((trip, i) => (
            <div
              key={trip._id}
              style={{ '--i': Math.min(i, 8) }}
              className="stagger animate-rise rounded-2xl border border-gray-200/80 bg-white p-5 shadow-card transition duration-300 hover:border-primary-200 hover:shadow-lift"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                    <Store className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold text-gray-900">{trip.storeName}</h3>
                    <p className="truncate text-sm text-gray-500">{trip.address}</p>
                  </div>
                </div>
                <StatusBadge status={trip.status} />
              </div>

              <p className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Clock className="size-4 shrink-0 text-gray-400" aria-hidden="true" />
                <span className="font-medium text-gray-800">{formatDateTime(trip.departureTime)}</span>
                <span className="text-gray-400">/</span>
                <span>{formatTimeWindow(trip.departureTime, trip.returnTime)}</span>
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
                <div className="flex flex-1 items-center gap-6">
                  <div className="w-40 max-w-full">
                    <p className="mb-1.5 text-xs text-gray-500">Accepted</p>
                    <SlotMeter used={trip.acceptedRequestsCount || 0} total={trip.maxRequests} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fee</p>
                    <p className="font-display font-bold tabular-nums text-primary-700">
                      Rs. {trip.serviceFee}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/trip/${trip._id}`}
                  className="group inline-flex items-center gap-0.5 rounded-xl border border-primary-300 px-4 py-2 text-sm font-semibold text-primary-800 transition hover:border-primary-500 hover:bg-primary-50"
                >
                  View
                  <ChevronRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrips;
