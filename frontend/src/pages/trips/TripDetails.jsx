import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Store,
  MapPin,
  Clock,
  User,
  Star,
  Package,
  Plus,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import tripService from '../../services/tripService';
import requestService from '../../services/requestService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { formatDate, formatTimeWindow } from '../../utils/formatDate';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isVerified } = useAuth();

  const [trip, setTrip] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

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
        toast.error('Trip nahi mili');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchTrip();
  }, [id, isAuthenticated, user, navigate]);

  const handleCancel = async () => {
    if (!window.confirm('Kya aap ye trip cancel karna chahte hain?')) return;
    try {
      const response = await tripService.cancelTrip(id);
      if (response.success) {
        toast.success('Trip cancel ho gayi');
        navigate('/my-trips');
      }
    } catch (error) {
      toast.error('Cancel fail ho gaya');
    }
  };

  if (loading) return <Loader text="Trip load ho rahi hai..." fullScreen />;
  if (!trip) return null;

  const shopper = trip.shopperId;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-6 h-6 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-800">
                {trip.storeName}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{trip.address}</span>
            </div>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              trip.status === 'open'
                ? 'bg-green-100 text-green-700'
                : trip.status === 'full'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {trip.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Clock className="w-4 h-4" />
              Time Window
            </div>
            <p className="font-semibold text-gray-800">
              {formatDate(trip.departureTime)}
            </p>
            <p className="text-sm text-gray-600">
              {formatTimeWindow(trip.departureTime, trip.returnTime)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Package className="w-4 h-4" />
              Capacity
            </div>
            <p className="font-semibold text-gray-800">
              {trip.acceptedRequestsCount}/{trip.maxRequests} accepted
            </p>
            <p className="text-sm text-gray-600">
              Service Fee: Rs. {trip.serviceFee}
            </p>
          </div>
        </div>

        {trip.note && (
          <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-6">
            <p className="text-gray-700">{trip.note}</p>
          </div>
        )}

        {/* Shopper Info */}
        <div className="border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500 mb-3">Shopper</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              {shopper?.profileImage ? (
                <img
                  src={shopper.profileImage}
                  alt={shopper.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-primary-700 font-bold text-lg">
                  {shopper?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{shopper?.name}</p>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">
                  {shopper?.rating?.toFixed(1) || '0.0'} (
                  {shopper?.reviewCount || 0} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          {isOwner ? (
            <>
              <Link to="/my-trips" className="flex-1">
                <Button variant="outline" fullWidth>
                  Meri Trips
                </Button>
              </Link>
              {trip.status !== 'completed' && trip.status !== 'cancelled' && (
                <Button variant="danger" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                  Cancel Trip
                </Button>
              )}
            </>
          ) : (
            isAuthenticated &&
            trip.status === 'open' &&
            shopper?._id !== user?._id && (
              <Link to={`/request/${trip._id}`} className="flex-1">
                <Button variant="primary" fullWidth size="lg">
                  <Plus className="w-5 h-5" />
                  Request Bhejein
                </Button>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Requests (only for owner) */}
      {isOwner && requests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Requests ({requests.length})
          </h2>
          <div className="space-y-3">
            {requests.map((req) => (
              <Link
                key={req._id}
                to={`/request-details/${req._id}`}
                className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {req.requesterId?.name || 'Unknown'}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      req.status === 'requested'
                        ? 'bg-blue-100 text-blue-700'
                        : req.status === 'accepted'
                        ? 'bg-green-100 text-green-700'
                        : req.status === 'paid'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {req.itemList}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Budget: Rs. {req.budget}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetails;