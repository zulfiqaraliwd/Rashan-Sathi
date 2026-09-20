import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, BadgeCheck, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Avatar from '../../components/common/Avatar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { fieldBase, fieldOk } from '../../components/common/fieldStyles';
import { timeAgo } from '../../utils/formatDate';

const th = 'px-5 py-3.5 text-left text-xs font-semibold text-gray-500';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [banTarget, setBanTarget] = useState(null); // { id, isActive }
  const [banning, setBanning] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers(page, 20, search);
      if (response.success) {
        setUsers(response.users);
        setTotal(response.total);
      }
    } catch (error) {
      toast.error('Failed to load users');
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

  const handleToggleActive = async () => {
    setBanning(true);
    try {
      const response = await adminService.toggleUserActive(banTarget.id);
      if (response.success) {
        toast.success(response.message);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setBanning(false);
      setBanTarget(null);
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
      toast.error('Update failed');
    }
  };

  if (loading && users.length === 0)
    return <Loader text="Loading users..." fullScreen />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <PageHeader back title="Users Management" subtitle={`${total} total users`} />

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-[1.15rem] -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            aria-label="Users search"
            className={`${fieldBase} ${fieldOk} pl-11`}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Users Table */}
      <div className="animate-rise overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem]">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr>
                <th className={th}>User</th>
                <th className={th}>Contact</th>
                <th className={th}>Rating</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className="transition-colors hover:bg-primary-50/30">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{timeAgo(u.createdAt)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-gray-800">{u.email}</p>
                    <p className="text-xs tabular-nums text-gray-500">{u.phone}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="flex items-center gap-1 text-sm font-medium tabular-nums text-gray-800">
                      <Star className="size-3.5 fill-accent-400 text-accent-400" aria-hidden="true" />
                      {u.rating?.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-xs text-gray-500">{u.reviewCount || 0} reviews</p>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.isActive ? (
                      <StatusBadge status="accepted" label="Active" />
                    ) : (
                      <StatusBadge status="rejected" label="Banned" />
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setBanTarget({ id: u._id, isActive: u.isActive })}
                        className="rounded-xl p-2 transition hover:bg-gray-100"
                        title={u.isActive ? 'Ban' : 'Unban'}
                        aria-label={u.isActive ? 'Ban user' : 'Unban user'}
                      >
                        {u.isActive ? (
                          <UserX className="size-[1.15rem] text-red-600" />
                        ) : (
                          <UserCheck className="size-[1.15rem] text-primary-600" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleVerification(
                            u._id,
                            u.verificationBadge === 'verified' ? 'none' : 'verified'
                          )
                        }
                        className="rounded-xl p-2 transition hover:bg-gray-100"
                        title="Toggle verification"
                        aria-label="Toggle verification"
                      >
                        <BadgeCheck
                          className={`size-[1.15rem] ${
                            u.verificationBadge === 'verified'
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
          <div className="py-14 text-center text-gray-500">No users found</div>
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

      <ConfirmDialog
        isOpen={!!banTarget}
        onClose={() => setBanTarget(null)}
        onConfirm={handleToggleActive}
        loading={banning}
        variant={banTarget?.isActive ? 'danger' : 'primary'}
        title={banTarget?.isActive ? 'Ban this user?' : 'Unban this user?'}
        message={
          banTarget?.isActive
            ? 'A banned user will no longer be able to use the platform.'
            : 'An unbanned user will be able to use the platform again.'
        }
        confirmText={banTarget?.isActive ? 'Yes, ban' : 'Yes, unban'}
      />
    </div>
  );
};

export default UsersManagement;
