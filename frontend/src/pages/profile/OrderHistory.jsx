import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';
import requestService from '../../services/requestService';
import tripService from '../../services/tripService';
import Loader from '../../components/common/Loader';
import { timeAgo } from '../../utils/formatDate';

const OrderHistory = () => {
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [reqRes, tripRes] = await Promise.all([
          requestService.getMyRequests(),
          tripService.getMyTrips(),
        ]);
        if (reqRes.success) setRequests(reqRes.requests);
        if (tripRes.success) setTrips(tripRes.trips);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader text="History load ho rahi hai..." />;

  const items = tab === 'requests' ? requests : trips;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Order History</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('requests')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tab === 'requests'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4 inline mr-2" />
          Requests ({requests.length})
        </button>
        <button
          onClick={() => setTab('trips')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tab === 'trips'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Trips ({trips.length})
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <p className="text-gray-500">Koi history nahi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item._id}
              to={
                tab === 'requests'
                  ? `/request-details/${item._id}`
                  : `/trip/${item._id}`
              }
              className="block bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">
                    {tab === 'requests'
                      ? item.itemList?.substring(0, 50)
                      : item.storeName}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {timeAgo(item.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary-600">
                    Rs. {item.totalAmount || item.budget || item.serviceFee}
                  </p>
                  <span className="text-xs text-gray-500">{item.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;