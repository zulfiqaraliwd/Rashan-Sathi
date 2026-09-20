import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  MapPin,
  Phone,
  MessageCircle,
  Check,
  X,
  ShoppingCart,
  Truck,
  StickyNote,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import requestService from '../../services/requestService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import Avatar from '../../components/common/Avatar';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import { timeAgo } from '../../utils/formatDate';

const Person = ({ label, name }) => (
  <div className="rounded-2xl bg-gray-50 p-4">
    <p className="mb-2 text-xs text-gray-500">{label}</p>
    <div className="flex items-center gap-2.5">
      <Avatar name={name} size="sm" />
      <span className="min-w-0 break-words text-sm font-semibold leading-tight text-gray-900">{name}</span>
    </div>
  </div>
);

const Amount = ({ label, value, highlight = false }) => (
  <div className={`rounded-2xl p-4 ${highlight ? 'bg-primary-50' : 'bg-gray-50'}`}>
    <p className="mb-1 text-xs text-gray-500">{label}</p>
    <p
      className={`font-display text-xl font-bold tabular-nums ${
        highlight ? 'text-primary-700' : 'text-gray-900'
      }`}
    >
      Rs. {value}
    </p>
  </div>
);

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Which confirmation dialog is open: 'reject' | 'cancel' | 'delivered' | null
  const [dialog, setDialog] = useState(null);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');

  // Derive these at render time (not in state): after a refresh, `user` loads later
  const isRequester = !!user && request?.requesterId?._id === user._id;
  const isShopper = !!user && request?.shopperId?._id === user._id;

  const fetchRequest = async () => {
    try {
      const response = await requestService.getRequestById(id);
      if (response.success) {
        setRequest(response.request);
      }
    } catch (error) {
      toast.error('Request not found');
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
        toast.error(response.message || 'Action failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Fail');
    } finally {
      setActionLoading(false);
      setDialog(null);
    }
  };

  const handleAccept = () =>
    handleAction(() => requestService.acceptRequest(id), 'Request accepted');

  const handleReject = () =>
    handleAction(
      () => requestService.rejectRequest(id, 'Rejected by the shopper'),
      'Request rejected'
    );

  const handleStartShopping = () =>
    handleAction(() => requestService.startShopping(id), 'Shopping started!');

  const openDelivered = () => {
    setAmount('');
    setAmountError('');
    setDialog('delivered');
  };

  const handleMarkDelivered = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setAmountError('Enter a valid amount');
      return;
    }
    handleAction(
      () => requestService.markDelivered(id, Number(amount)),
      'Marked as delivered'
    );
  };

  const handleCancel = () =>
    handleAction(
      () => requestService.cancelRequest(id, 'Cancelled by the requester'),
      'Request cancelled'
    );

  if (loading) return <Loader text="Loading request..." fullScreen />;
  if (!request) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader back title="Request Details" subtitle={timeAgo(request.createdAt)} />

      <div className="animate-rise space-y-6 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">Status</h2>
          <StatusBadge status={request.status} size="md" />
        </div>

        {/* Users */}
        <div className="grid grid-cols-2 gap-4">
          <Person label="Requester" name={request.requesterId?.name} />
          <Person label="Shopper" name={request.shopperId?.name} />
        </div>

        {/* Items */}
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Package className="size-4" aria-hidden="true" />
            Items
          </h3>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
              {request.itemList || 'Image list'}
            </p>
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Amount label="Budget" value={request.budget} />
          {request.actualAmount > 0 && <Amount label="Actual" value={request.actualAmount} />}
          {request.totalAmount > 0 && <Amount label="Total" value={request.totalAmount} highlight />}
        </div>

        {/* Delivery */}
        <div className="space-y-3 rounded-2xl border border-gray-200 p-4">
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden="true" />
            <span className="text-gray-800">{request.deliveryAddress}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="size-4 shrink-0 text-primary-600" aria-hidden="true" />
            <span className="tabular-nums text-gray-800">{request.contactPhone}</span>
          </div>
        </div>

        {/* Instructions */}
        {request.specialInstructions && (
          <div className="flex items-start gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-4">
            <StickyNote className="mt-0.5 size-4 shrink-0 text-accent-700" aria-hidden="true" />
            <p className="text-sm text-accent-700">
              <strong className="font-semibold">Note:</strong> {request.specialInstructions}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
          {['accepted', 'shopping', 'delivered', 'paid'].includes(request.status) && (
            <Button to={`/chat/${request._id}`} variant="outline">
              <MessageCircle className="size-4" aria-hidden="true" />
              Chat
            </Button>
          )}

          {isShopper && request.status === 'requested' && (
            <>
              <Button onClick={handleAccept} loading={actionLoading && !dialog}>
                <Check className="size-4" aria-hidden="true" />
                Accept
              </Button>
              <Button variant="danger" onClick={() => setDialog('reject')}>
                <X className="size-4" aria-hidden="true" />
                Reject
              </Button>
            </>
          )}

          {isShopper && request.status === 'accepted' && (
            <Button onClick={handleStartShopping} loading={actionLoading}>
              <ShoppingCart className="size-4" aria-hidden="true" />
              Start Shopping
            </Button>
          )}

          {isShopper && request.status === 'shopping' && (
            <Button onClick={openDelivered}>
              <Truck className="size-4" aria-hidden="true" />
              Mark Delivered
            </Button>
          )}

          {isShopper && request.status === 'delivered' && (
            <Button to={`/payment/${request._id}`}>View Payment</Button>
          )}

          {isRequester && request.status === 'delivered' && (
            <Button to={`/payment/${request._id}`}>Make Payment</Button>
          )}

          {isRequester && request.status === 'requested' && (
            <Button variant="danger" onClick={() => setDialog('cancel')}>
              Cancel Request
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={dialog === 'reject'}
        onClose={() => setDialog(null)}
        onConfirm={handleReject}
        loading={actionLoading}
        title="Reject this request?"
        message="The requester will be told that you rejected this request."
        confirmText="Yes, reject"
      />

      <ConfirmDialog
        isOpen={dialog === 'cancel'}
        onClose={() => setDialog(null)}
        onConfirm={handleCancel}
        loading={actionLoading}
        title="Cancel this request?"
        message="This action cannot be undone."
        confirmText="Yes, cancel"
        cancelText="No, keep it"
      />

      <ConfirmDialog
        isOpen={dialog === 'delivered'}
        onClose={() => setDialog(null)}
        onConfirm={handleMarkDelivered}
        loading={actionLoading}
        variant="primary"
        title="Mark as delivered"
        message="Enter the actual cost of the items. The payment will be calculated from this."
        confirmText="Mark Delivered"
      >
        <Input
          label="Actual amount (PKR)"
          name="actualAmount"
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setAmountError('');
          }}
          placeholder="1050"
          error={amountError}
          autoFocus
        />
      </ConfirmDialog>
    </div>
  );
};

export default RequestDetails;
