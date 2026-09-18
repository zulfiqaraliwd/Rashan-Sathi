import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, ShoppingBag } from 'lucide-react';
import requestService from '../../services/requestService';
import RequestCard from '../../components/requests/RequestCard';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

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
    filter === 'all'
      ? requests
      : requests.filter((r) => r.status === filter);

  if (loading) return <Loader text="Requests load ho rahi hain..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Meri Requests</h1>
          <p className="text-gray-600 mt-1">{requests.length} requests total</p>
        </div>
        <Link to="/">
          <Button variant="primary">
            <Plus className="w-4 h-4" />
            Nayi Request
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'requested', 'accepted', 'delivered', 'paid'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'Sab' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Koi request nahi
          </h3>
          <p className="text-gray-600 mb-6">
            Nearby trips dekhen aur request bhejein
          </p>
          <Link to="/">
            <Button variant="primary">Home Pe Jao</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((request) => (
            <RequestCard key={request._id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;