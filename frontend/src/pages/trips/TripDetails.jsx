import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Store, MapPin, Clock, Star, Package, Plus, X, ChevronRight, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import tripService from '../../services/tripService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Avatar from '../../components/common/Avatar';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import SlotMeter from '../../components/trips/SlotMeter';
import { Skeleton } from '../../components/common/Skeleton';
import { toLatLng } from '../../utils/geo';
import { formatDate, formatTimeWindow } from '../../utils/formatDate';

const TripMap = lazy(() => import('../../components/maps/TripMap'));

const InfoTile = ({ icon: Icon, label, children }) => (
  <div className="rounded-2xl bg-gray-50 p-4">
    <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </div>
    {children}
  </div>
);

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [trip, setTrip] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await tripService.getTripById(id);
        if (response.success) {
          setTrip(response.trip);
          setRequests(response.requests || []);
          setIsOwner(response.trip.shopperId._id === user?._id);
        }
      } catch (error) {
        toast.error('Trip not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchTrip();
  }, [id, isAuthenticated, user, navigate]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const response = await tripService.cancelTrip(id);
      if (response.success) {
        toast.success('Trip cancelled');
        navigate('/my-trips');
      }
    } catch (error) {
      toast.error('Failed to cancel');
    } finally {
      setCancelling(false);
      setConfirmOpen(false);
    }
  };

  if (loading) return <Loader text="Loading trip..." fullScreen />;
  if (!trip) return null;

  const shopper = trip.shopperId;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader back title={trip.storeName} />

      {/* Header Card */}
      <div className="animate-rise rounded-3xl border border-gray-200/80 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-900 text-white">
              <Store className="size-7" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-gray-600">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                <span>{trip.address}</span>
              </p>
            </div>
          </div>
          <StatusBadge status={trip.status} size="md" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <InfoTile icon={Clock} label="Time Window">
            <p className="font-semibold text-gray-900">{formatDate(trip.departureTime)}</p>
            <p className="text-sm text-gray-600">
              {formatTimeWindow(trip.departureTime, trip.returnTime)}
            </p>
          </InfoTile>

          <InfoTile icon={Package} label="Capacity">
            <p className="mb-2 font-semibold text-gray-900">
              {trip.acceptedRequestsCount}/{trip.maxRequests} accepted
            </p>
            <SlotMeter used={trip.acceptedRequestsCount || 0} total={trip.maxRequests} showLabel={false} />
          </InfoTile>

          <InfoTile icon={Wallet} label="Service Fee">
            <p className="font-display text-2xl font-bold tabular-nums text-primary-700">
              Rs. {trip.serviceFee}
            </p>
          </InfoTile>
        </div>

        {toLatLng(trip) && (
          <div className="mt-6">
            <Suspense fallback={<Skeleton className="h-56 rounded-2xl" />}>
              <TripMap
                trips={[trip]}
                center={toLatLng(trip)}
                zoom={15}
                linkToTrip={false}
                className="h-56"
              />
            </Suspense>
          </div>
        )}

        {trip.note && (
          <div className="mt-6 rounded-2xl border border-primary-100 bg-primary-50 p-4">
            <p className="leading-relaxed text-gray-800">{trip.note}</p>
          </div>
        )}

        {/* Shopper Info */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <p className="mb-3 text-sm text-gray-500">Shopper</p>
          <div className="flex items-center gap-3">
            <Avatar name={shopper?.name} src={shopper?.profileImage} size="lg" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{shopper?.name}</p>
              <p className="flex items-center gap-1 text-sm text-gray-600">
                <Star className="size-4 fill-accent-400 text-accent-400" aria-hidden="true" />
                <span className="tabular-nums">
                  {shopper?.rating?.toFixed(1) || '0.0'} ({shopper?.reviewCount || 0} reviews)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          {isOwner ? (
            <>
              <Button to="/my-trips" variant="outline" className="flex-1">
                My Trips
              </Button>
              {trip.status !== 'completed' && trip.status !== 'cancelled' && (
                <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                  <X className="size-4" aria-hidden="true" />
                  Cancel Trip
                </Button>
              )}
            </>
          ) : (
            isAuthenticated &&
            trip.status === 'open' &&
            shopper?._id !== user?._id && (
              <Button to={`/request/${trip._id}`} size="lg" fullWidth>
                <Plus className="size-5" aria-hidden="true" />
                Send Request
              </Button>
            )
          )}
        </div>
      </div>

      {/* Requests (only for owner) */}
      {isOwner && requests.length > 0 && (
        <div
          className="stagger mt-6 animate-rise rounded-3xl border border-gray-200/80 bg-white p-6 shadow-card"
          style={{ '--i': 2 }}
        >
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Requests ({requests.length})
          </h2>
          <div className="space-y-3">
            {requests.map((req) => (
              <Link
                key={req._id}
                to={`/request-details/${req._id}`}
                className="group block rounded-2xl border border-gray-200 p-4 transition hover:border-primary-300 hover:bg-primary-50/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={req.requesterId?.name} size="sm" />
                    <span className="truncate font-semibold text-gray-900">
                      {req.requesterId?.name || 'Unknown'}
                    </span>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <p className="mt-3 line-clamp-2 whitespace-pre-line text-sm text-gray-600">
                  {req.itemList}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Budget: <span className="font-semibold tabular-nums text-gray-800">Rs. {req.budget}</span>
                  </p>
                  <ChevronRight
                    className="size-4 text-gray-400 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancel this trip?"
        message="Are you sure you want to cancel this trip? This action cannot be undone."
        confirmText="Yes, cancel"
        cancelText="No, keep it"
      />
    </div>
  );
};

export default TripDetails;
