import { useState, useEffect } from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import requestService from '../../services/requestService';
import RequestCard from '../../components/requests/RequestCard';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import { TripCardSkeleton } from '../../components/common/Skeleton';

const FILTERS = ['all', 'requested', 'accepted', 'delivered', 'paid'];

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await requestService.getMyRequests();
        if (response.success) setRequests(response.requests);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const filteredRequests =
    filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="My Requests"
        subtitle={`${requests.length} requests total`}
        actions={
          <Button to="/">
            <Plus className="size-4" aria-hidden="true" />
            New Request
          </Button>
        }
      />

      {/* Filter chips */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ${
              filter === f
                ? 'bg-primary-700 text-white shadow-[0_8px_16px_-8px_rgb(20_102_64/0.7)]'
                : 'border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-800'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[0, 1].map((i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No requests"
          description="Browse nearby trips and send a request"
          action={<Button to="/">Go Home</Button>}
        />
      ) : (
        <div key={filter} className="grid gap-5 md:grid-cols-2">
          {filteredRequests.map((request, i) => (
            <RequestCard key={request._id} request={request} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
