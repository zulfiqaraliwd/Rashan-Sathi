import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { timeAgo } from '../../utils/formatDate';
import Avatar from '../common/Avatar';
import StatusBadge from '../common/StatusBadge';

const RequestCard = ({ request, index = 0 }) => (
  <Link
    to={`/request-details/${request._id}`}
    style={{ '--i': Math.min(index, 8) }}
    className="stagger group flex animate-rise flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lift"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar
          name={request.shopperId?.name}
          src={request.shopperId?.profileImage}
          size="md"
        />
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">
            {request.shopperId?.name || 'Unknown'}
          </p>
          <p className="text-xs text-gray-500">{timeAgo(request.createdAt)}</p>
        </div>
      </div>
      <StatusBadge status={request.status} />
    </div>

    <div className="mt-4 rounded-xl bg-gray-50 px-3 py-2.5">
      <p className="line-clamp-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
        {request.itemList || 'Image list'}
      </p>
    </div>

    <div className="mt-auto flex items-center justify-between pt-4">
      <div>
        <p className="text-xs text-gray-500">Budget</p>
        <p className="font-display text-lg font-bold tabular-nums text-gray-900">
          Rs. {request.budget}
        </p>
      </div>
      <span className="inline-flex items-center gap-0.5 text-sm font-medium text-primary-700">
        Details
        <ChevronRight
          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </div>
  </Link>
);

export default RequestCard;
