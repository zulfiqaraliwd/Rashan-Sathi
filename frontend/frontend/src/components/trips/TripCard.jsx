import { Link } from 'react-router-dom';
import { MapPin, Clock, Store, Star } from 'lucide-react';
import { formatTimeWindow, formatDate } from '../../utils/formatDate';
import Avatar from '../common/Avatar';
import StatusBadge from '../common/StatusBadge';
import SlotMeter from './SlotMeter';

const TripCard = ({ trip, index = 0 }) => {
  const shopper = trip.shopperId;

  return (
    <Link
      to={`/trip/${trip._id}`}
      style={{ '--i': Math.min(index, 8) }}
      className="stagger group flex animate-rise flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lift"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-600 group-hover:text-white">
          <Store className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-lg font-bold text-gray-900">
            {trip.storeName}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{trip.address}</span>
          </p>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      {/* Time */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <Clock className="size-4 shrink-0 text-gray-400" aria-hidden="true" />
        <span className="font-medium text-gray-800">{formatDate(trip.departureTime)}</span>
        <span className="text-gray-400">/</span>
        <span>{formatTimeWindow(trip.departureTime, trip.returnTime)}</span>
      </div>

      {/* Note */}
      {trip.note && (
        <div className="mt-3 rounded-xl bg-gray-50 px-3 py-2">
          <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">{trip.note}</p>
        </div>
      )}

      {/* Slots */}
      {trip.maxRequests > 0 && (
        <div className="mt-4">
          <SlotMeter used={trip.acceptedRequestsCount || 0} total={trip.maxRequests} />
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={shopper?.name} src={shopper?.profileImage} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">
              {shopper?.name || 'Unknown'}
            </p>
            <p className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="size-3 fill-accent-400 text-accent-400" aria-hidden="true" />
              <span className="tabular-nums">
                {shopper?.rating?.toFixed(1) || '0.0'} ({shopper?.reviewCount || 0})
              </span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">Service Fee</p>
          <p className="font-display text-lg font-bold tabular-nums text-primary-700">
            Rs. {trip.serviceFee}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default TripCard;
