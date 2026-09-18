import { Link } from 'react-router-dom';
import { MapPin, Clock, Store, User, Star } from 'lucide-react';
import { formatTimeWindow, formatDate } from '../../utils/formatDate';

const TripCard = ({ trip }) => {
  const shopper = trip.shopperId;

  return (
    <Link
      to={`/trip/${trip._id}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-5 border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-4 h-4 text-primary-600" />
            <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
              {trip.storeName}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{trip.address}</span>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            trip.status === 'open'
              ? 'bg-green-100 text-green-700'
              : trip.status === 'full'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {trip.status === 'open' ? 'Open' : trip.status}
        </span>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <Clock className="w-4 h-4" />
        <span>
          {formatDate(trip.departureTime)} •{' '}
          {formatTimeWindow(trip.departureTime, trip.returnTime)}
        </span>
      </div>

      {/* Note */}
      {trip.note && (
        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-3 line-clamp-2">
          {trip.note}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            {shopper?.profileImage ? (
              <img
                src={shopper.profileImage}
                alt={shopper.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary-700 font-semibold text-sm">
                {shopper?.name?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {shopper?.name || 'Unknown'}
            </p>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-500">
                {shopper?.rating?.toFixed(1) || '0.0'} (
                {shopper?.reviewCount || 0})
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">Service Fee</p>
          <p className="text-sm font-bold text-primary-600">
            Rs. {trip.serviceFee}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default TripCard;