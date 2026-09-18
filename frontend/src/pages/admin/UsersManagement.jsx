import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, BadgeCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { timeAgo } from '../../utils/formatDate';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers(page, 20, search);
      if (response.success) {
        setUsers(response.users);
        setTotal(response.total);
      }
    } catch (error) {
      toast.error('Users load nahi hue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleActive = async (userId, currentStatus) => {
    if (!window.confirm(`${currentStatus ? 'Ban' : 'Unban'} karna hai?`)) return;
    try {
      const response = await adminService.toggleUserActive(userId);
      if (response.success) {
        toast.success(response.message);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Action fail');
    }
  };

  const handleVerification = async (userId, status) => {
    try {
      const response = await adminService.updateVerification(userId, status);
      if (response.success) {
        toast.success(`Verification: ${status}`);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Update fail');
    }
  };

  if (loading && users.length === 0)
    return <Loader text="Users load ho rahe hain..." fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Users Management</h1>
      <p className="text-gray-600 mb-6">{total} total users</p>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Naam, email ya phone se dhundho..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <Button type="submit" variant="primary">
          Search
        </Button>
      </form>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rating
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 text-sm font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">
                          {timeAgo(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">
                      ⭐ {user.rating?.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.reviewCount || 0} reviews
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {user.isActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        Banned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          handleToggleActive(user._id, user.isActive)
                        }
                        className="p-1.5 hover:bg-gray-100 rounded"
                        title={user.isActive ? 'Ban' : 'Unban'}
                      >
                        {user.isActive ? (
                          <UserX className="w-4 h-4 text-red-600" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-green-600" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleVerification(
                            user._id,
                            user.verificationBadge === 'verified'
                              ? 'none'
                              : 'verified'
                          )
                        }
                        className="p-1.5 hover:bg-gray-100 rounded"
                        title="Toggle verification"
                      >
                        <BadgeCheck
                          className={`w-4 h-4 ${
                            user.verificationBadge === 'verified'
                              ? 'text-primary-600'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">Koi user nahi mila</div>
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

export default UsersManagement;