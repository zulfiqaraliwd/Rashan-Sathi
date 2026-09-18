import { useState, useEffect } from 'react';
import { AlertTriangle, Check, X, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import { timeAgo } from '../../utils/formatDate';

const DisputesManagement = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState('');
  const [escrowStatus, setEscrowStatus] = useState('released');

  const fetchDisputes = async () => {
    try {
      const response = await adminService.getAllDisputes();
      if (response.success) setDisputes(response.disputes);
    } catch (error) {
      toast.error('Disputes load nahi hue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async () => {
    if (!resolution.trim()) {
      toast.error('Resolution note zaroori hai');
      return;
    }
    try {
      const response = await adminService.resolveDispute(selected._id, {
        resolution,
        escrowStatus,
      });
      if (response.success) {
        toast.success('Dispute resolve ho gaya');
        setSelected(null);
        setResolution('');
        fetchDisputes();
      }
    } catch (error) {
      toast.error('Resolve fail');
    }
  };

  if (loading) return <Loader text="Disputes load ho rahe hain..." fullScreen />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Disputes</h1>
      <p className="text-gray-600 mb-6">{disputes.length} open disputes</p>

      {disputes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">
            Koi dispute nahi!
          </h3>
          <p className="text-gray-600">Sab kuch theek chal raha hai</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div
              key={dispute._id}
              className="bg-white rounded-xl shadow-sm p-5 border border-red-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      Rs. {formatCurrency(dispute.totalAmount).replace('Rs. ', '')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {timeAgo(dispute.createdAt)}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                  Disputed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Requester</p>
                  <p className="font-medium">{dispute.requesterId?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Shopper</p>
                  <p className="font-medium">{dispute.shopperId?.name}</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
                <p className="text-xs text-red-600 font-medium mb-1">
                  Reason:
                </p>
                <p className="text-sm text-red-800">
                  {dispute.disputeReason || 'No reason provided'}
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelected(dispute)}
              >
                Resolve Karo
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Dispute Resolve Karo</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Note
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={3}
                placeholder="Kya faisla hua? Note likhein..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Escrow Decision
              </label>
              <select
                value={escrowStatus}
                onChange={(e) => setEscrowStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="released">Release to Shopper</option>
                <option value="refunded">Refund to Requester</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setSelected(null)}
              >
                Cancel
              </Button>
              <Button variant="primary" fullWidth onClick={handleResolve}>
                Resolve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputesManagement;