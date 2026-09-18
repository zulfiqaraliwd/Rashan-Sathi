import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Package,
  DollarSign,
  MapPin,
  Phone,
  MessageCircle,
  Check,
  X,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import requestService from '../../services/requestService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { formatDate, timeAgo } from '../../utils/formatDate';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRequester, setIsRequester] = useState(false);
  const [isShopper, setIsShopper] = useState(false);

  const fetchRequest = async () => {
    try {
      const response = await requestService.getRequestById(id);
      if (response.success) {
        setRequest(response.request);
        setIsRequester(response.request.requesterId._id === user?._id);
        setIsShopper(response.request.shopperId._id === user?._id);
      }
    } catch (error) {
      toast.error('Request nahi mili');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleAction = async (action, successMsg) => {
    setActionLoading(true);
    try {
      const response = await action();
      if (response.success) {
        toast.success(successMsg);
        fetchRequest();
      } else {
        toast.error(response.message || 'Action fail');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Fail');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = () =>
    handleAction(() => requestService.acceptRequest(id), 'Request accept ho gayi');

  const handleReject = () => {
    if (!window.confirm('Request reject karni hai?')) return;
    handleAction(() => requestService.rejectRequest(id, 'Shopper ne reject kiya'), 'Request reject ho gayi');
  };

  const handleStartShopping = () =>
    handleAction(() => requestService.startShopping(id), 'Shopping shuru!');

  const handleMarkDelivered = () => {
    const amount = window.prompt('Actual amount kitna laga? (PKR)');
    if (!amount || isNaN(amount)) return;
    handleAction(
      () => requestService.markDelivered(id, Number(amount)),
      'Delivered mark ho gaya'
    );
  };

  const handleConfirmDelivery = () =>
    handleAction(
      () => requestService.confirmDelivery(id),
      'Delivery confirm ho gayi'
    );

  const handleCancel = () => {
    if (!window.confirm('Request cancel karni hai?')) return;
    handleAction(
      () => requestService.cancelRequest(id, 'Requester ne cancel kiya'),
      'Request cancel ho gayi'
    );
  };

  if (loading) return <Loader text="Request load ho rahi hai..." fullScreen />;
  if (!request) return null;

  const statusColors = {
    requested: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    shopping: 'bg-yellow-100 text-yellow-700',
    delivered: 'bg-purple-100 text-purple-700',
    paid: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
    disputed: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              Request Details
            </h1>
            <p className="text-sm text-gray-500">{timeAgo(request.createdAt)}</p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[request.status]}`}
          >
            {request.status}
          </span>
        </div>

        {/* Users */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-2">Requester</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">
                  {request.requesterId?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium text-sm">
                {request.requesterId?.name}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-2">Shopper</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">
                  {request.shopperId?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium text-sm">
                {request.shopperId?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Saman
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">
              {request.itemList || 'Image list'}
            </p>
          </div>
        </div>

        {/* Budget */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Budget</p>
            <p className="font-bold text-gray-800">Rs. {request.budget}</p>
          </div>
          {request.actualAmount > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Actual</p>
              <p className="font-bold text-gray-800">
                Rs. {request.actualAmount}
              </p>
            </div>
          )}
          {request.totalAmount > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="font-bold text-primary-600">
                Rs. {request.totalAmount}
              </p>
            </div>
          )}
        </div>

        {/* Delivery */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{request.deliveryAddress}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{request.contactPhone}</span>
          </div>
        </div>

        {/* Instructions */}
        {request.specialInstructions && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> {request.specialInstructions}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
          {/* Chat button — always if accepted or later */}
          {['accepted', 'shopping', 'delivered', 'paid'].includes(
            request.status
          ) && (
            <Link to={`/chat/${request._id}`}>
              <Button variant="outline">
                <MessageCircle className="w-4 h-4" />
                Chat
              </Button>
            </Link>
          )}

          {/* Shopper actions */}
          {isShopper && request.status === 'requested' && (
            <>
              <Button
                variant="primary"
                onClick={handleAccept}
                loading={actionLoading}
              >
                <Check className="w-4 h-4" />
                Accept
              </Button>
              <Button variant="danger" onClick={handleReject}>
                <X className="w-4 h-4" />
                Reject
              </Button>
            </>
          )}

          {isShopper && request.status === 'accepted' && (
            <Button variant="primary" onClick={handleStartShopping}>
              <ShoppingCart className="w-4 h-4" />
              Shopping Shuru
            </Button>
          )}

          {isShopper && request.status === 'shopping' && (
            <Button variant="primary" onClick={handleMarkDelivered}>
              <Truck className="w-4 h-4" />
              Delivered Mark
            </Button>
          )}

          {isShopper && request.status === 'delivered' && (
            <Link to={`/payment/${request._id}`}>
              <Button variant="primary">Payment Dekhein</Button>
            </Link>
          )}

          {/* Requester actions */}
          {isRequester && request.status === 'delivered' && (
            <Link to={`/payment/${request._id}`}>
              <Button variant="primary">Payment Karein</Button>
            </Link>
          )}

          {isRequester && request.status === 'requested' && (
            <Button variant="danger" onClick={handleCancel}>
              Cancel Request
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;