import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { timeAgo } from '../../utils/formatDate';

const th = 'px-5 py-3.5 text-left text-xs font-semibold text-gray-500';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await adminService.getAllTransactions(page, 20, statusFilter);
        if (response.success) {
          setTransactions(response.transactions);
          setTotal(response.total);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [page, statusFilter]);

  if (loading && transactions.length === 0)
    return <Loader text="Loading transactions..." fullScreen />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <PageHeader back title="Transactions" subtitle={`${total} total transactions`} />

      {/* Filter */}
      <div className="mb-4 w-full sm:w-56">
        <Select
          aria-label="Status filter"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="held">Held</option>
          <option value="confirmed">Confirmed</option>
          <option value="disputed">Disputed</option>
        </Select>
      </div>

      {/* Table */}
      <div className="animate-rise overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem]">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr>
                <th className={th}>Date</th>
                <th className={th}>Parties</th>
                <th className={th}>Amount</th>
                <th className={th}>Method</th>
                <th className={th}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((txn) => (
                <tr key={txn._id} className="transition-colors hover:bg-primary-50/30">
                  <td className="px-5 py-3.5 text-sm text-gray-600">{timeAgo(txn.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm">
                      <span className="text-gray-500">Requester:</span>{' '}
                      <span className="font-medium text-gray-900">{txn.requesterId?.name}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Shopper:</span>{' '}
                      <span className="font-medium text-gray-900">{txn.shopperId?.name}</span>
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-display font-bold tabular-nums text-gray-900">
                      {formatCurrency(txn.totalAmount)}
                    </p>
                    <p className="text-xs tabular-nums text-gray-500">
                      Fee: {formatCurrency(txn.serviceFee)}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-sm capitalize text-gray-700">
                    {txn.paymentMethod}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={txn.escrowStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="py-14 text-center text-gray-500">No transactions found</div>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-2 text-sm tabular-nums text-gray-600">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 20)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Transactions;
