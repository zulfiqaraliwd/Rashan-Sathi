import { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { timeAgo } from '../../utils/formatDate';

const DisputesManagement = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState('');
  const [escrowStatus, setEscrowStatus] = useState('released');
  const [resolving, setResolving] = useState(false);

  const fetchDisputes = async () => {
    try {
      const response = await adminService.getAllDisputes();
      if (response.success) setDisputes(response.disputes);
    } catch (error) {
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const closeModal = () => {
    setSelected(null);
    setResolution('');
  };

  const handleResolve = async () => {
    if (!resolution.trim()) {
      toast.error('A resolution note is required');
      return;
    }
    setResolving(true);
    try {
      const response = await adminService.resolveDispute(selected._id, {
        resolution,
        escrowStatus,
      });
      if (response.success) {
        toast.success('Dispute resolved');
        closeModal();
        fetchDisputes();
      }
    } catch (error) {
      toast.error('Failed to resolve');
    } finally {
      setResolving(false);
    }
  };

  if (loading) return <Loader text="Loading disputes..." fullScreen />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader back title="Disputes" subtitle={`${disputes.length} open disputes`} />

      {disputes.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No disputes!"
          description="Everything is running smoothly"
        />
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute, i) => (
            <div
              key={dispute._id}
              style={{ '--i': Math.min(i, 8) }}
              className="stagger animate-rise rounded-2xl border border-red-100 bg-white p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <AlertTriangle className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-display text-xl font-bold tabular-nums text-gray-900">
                      {formatCurrency(dispute.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500">{timeAgo(dispute.createdAt)}</p>
                  </div>
                </div>
                <StatusBadge status="disputed" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                {[
                  ['Requester', dispute.requesterId?.name],
                  ['Shopper', dispute.shopperId?.name],
                ].map(([role, name]) => (
                  <div key={role} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                    <Avatar name={name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">{role}</p>
                      <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="mb-1 text-xs font-semibold text-red-700">Reason</p>
                <p className="text-sm text-red-900">
                  {dispute.disputeReason || 'No reason provided'}
                </p>
              </div>

              <Button className="mt-4" size="sm" onClick={() => setSelected(dispute)}>
                Resolve
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      <Modal isOpen={!!selected} onClose={closeModal} title="Resolve Dispute">
        <div className="space-y-5">
          <Textarea
            label="Resolution Note"
            name="resolution"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            rows={3}
            placeholder="What was decided? Write a note..."
          />
          <Select
            label="Escrow Decision"
            name="escrowStatus"
            value={escrowStatus}
            onChange={(e) => setEscrowStatus(e.target.value)}
          >
            <option value="released">Release to Shopper</option>
            <option value="refunded">Refund to Requester</option>
          </Select>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" fullWidth onClick={closeModal} disabled={resolving}>
              Cancel
            </Button>
            <Button fullWidth onClick={handleResolve} loading={resolving}>
              Resolve
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DisputesManagement;
