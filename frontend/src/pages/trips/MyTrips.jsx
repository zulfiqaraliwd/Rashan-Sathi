import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Clock } from 'lucide-react';
import tripService from '../../services/tripService';

import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTrips = async () => {
      try {
        const response = await tripService.getMyTrips();
        if (response.success) setTrips(response.trips);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTrips();
  }, []);

  if (loading) return <Loader text="Trips load ho rahi hain..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Meri Trips</h1>
          <p className="text-gray-600 mt-1">{trips.length} trips total</p>
        </div>
        <Link to="/post-trip">
          <Button variant="primary">
            <Plus className="w-4 h-4" />
            Nayi Trip
          </Button>
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Abhi koi trip nahi
          </h3>
          <p className="text-gray-600 mb-6">
            Apni pehli grocery trip post karein
          </p>
          <Link to="/post-trip">
            <Button variant="primary">
              <Plus className="w-4 h-4" />
              Trip Post Karein
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div
              key={trip._id}
              className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{trip.storeName}</h3>
                  <p className="text-sm text-gray-600">{trip.address}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    trip.status === 'open'
                      ? 'bg-green-100 text-green-700'
                      : trip.status === 'full'
                      ? 'bg-yellow-100 text-yellow-700'
                      : trip.status === 'completed'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {trip.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Clock className="w-4 h-4" />
                <span>
                  {new Date(trip.departureTime).toLocaleString('en-PK')} -{' '}
                  {new Date(trip.returnTime).toLocaleTimeString('en-PK')}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-600">
                    Accepted:{' '}
                    <span className="font-semibold text-gray-800">
                      {trip.acceptedRequestsCount}/{trip.maxRequests}
                    </span>
                  </span>
                  <span className="text-gray-600">
                    Fee:{' '}
                    <span className="font-semibold text-primary-600">
                      Rs. {trip.serviceFee}
                    </span>
                  </span>
                </div>
                <Link to={`/trip/${trip._id}`}>
                  <Button variant="outline" size="sm">
                    Dekhein
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrips;