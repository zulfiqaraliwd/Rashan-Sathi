import { Link } from 'react-router-dom';
import { User, Clock, Package, DollarSign } from 'lucide-react';
import { formatDate, timeAgo } from '../../utils/formatDate';

const RequestCard = ({ request }) => {
  const getStatusColor = (status) => {
    const colors = {
      requested: 'bg-blue-100 text-blue-700',
      accepted: 'bg-green-100 text-green-700',
      shopping: 'bg-yellow-100 text-yellow-700',
      delivered: 'bg-purple-100 text-purple-700',
      paid: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-700',
      rejected: 'bg-red-100 text-red-700',
      disputed: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Link
      to={`/request-details/${request._id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 border border-gray-100"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            {request.shopperId?.profileImage ? (
              <img
                src={request.shopperId.profileImage}
                alt={request.shopperId.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary-700 font-semibold">
                {request.shopperId?.name?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">
              {request.shopperId?.name || 'Unknown'}
            </p>
            <p className="text-xs text-gray-500">
              {timeAgo(request.createdAt)}
            </p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
            request.status
          )}`}
        >
          {request.status}
        </span>
      </div>

      <p className="text-sm text-gray-700 line-clamp-2 mb-3">
        {request.itemList || 'Image list'}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span>Budget: Rs. {request.budget}</span>
        </div>
        <span className="text-xs text-gray-500">Details →</span>
      </div>
    </Link>
  );
};

export default RequestCard;