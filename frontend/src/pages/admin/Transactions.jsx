import { useState, useEffect } from 'react';
import { Wallet, Search, Filter } from 'lucide-react';
import adminService from '../../services/adminService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { timeAgo } from '../../utils/formatDate';

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
    return <Loader text="Transactions load ho rahe hain..." fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Transactions</h1>
      <p className="text-gray-600 mb-6">{total} total transactions</p>

      {/* Filter */}
      <div className="mb-4 flex gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="held">Held</option>
          <option value="confirmed">Confirmed</option>
          <option value="disputed">Disputed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Parties
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((txn) => (
                <tr key={txn._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {timeAgo(txn.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">
                      <span className="text-gray-500">R:</span>{' '}
                      {txn.requesterId?.name}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">S:</span>{' '}
                      {txn.shopperId?.name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-gray-800">
                      {formatCurrency(txn.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Fee: {formatCurrency(txn.serviceFee)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">
                    {txn.paymentMethod}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        txn.escrowStatus === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : txn.escrowStatus === 'disputed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {txn.escrowStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Koi transaction nahi
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-gray-600">
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