import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import useGeolocation from '../../hooks/useGeolocation';
import tripService from '../../services/tripService';
import TripCard from '../../components/trips/TripCard';
import Button from '../../components/common/Button';
import { PAKISTANI_CITIES, DEFAULT_COORDS } from '../../utils/constants';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const { location, error: geoError, loading: geoLoading } = useGeolocation();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(5);
  const [searchCoords, setSearchCoords] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');

  // Location set karo — user ki location ya default
  useEffect(() => {
    if (location) {
      setSearchCoords({ lat: location.lat, lng: location.lng });
    } else if (user?.location?.coordinates?.[0]) {
      setSearchCoords({
        lng: user.location.coordinates[0],
        lat: user.location.coordinates[1],
      });
    } else {
      setSearchCoords(DEFAULT_COORDS);
    }
  }, [location, user]);

  // Trips fetch karo
  useEffect(() => {
    const fetchTrips = async () => {
      if (!searchCoords) return;
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await tripService.getNearbyTrips(
          searchCoords.lng,
          searchCoords.lat,
          radius
        );
        if (response.success) {
          setTrips(response.trips);
        }
      } catch (error) {
        console.error('Trips fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [searchCoords, radius, isAuthenticated]);

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
    const city = PAKISTANI_CITIES.find((c) => c.name === cityName);
    if (city) {
      setSearchCoords({ lat: city.lat, lng: city.lng });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 sm:p-10 text-white mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Rashan Sathi
        </h1>
        <p className="text-primary-50 mb-6 text-lg">
          Pakistan ka pehla peer-to-peer grocery platform
        </p>
        {isAuthenticated ? (
          <Link to="/post-trip">
            <Button
              variant="secondary"
              size="lg"
              className="!bg-white !text-primary-700 hover:!bg-primary-50"
            >
              <Plus className="w-5 h-5" />
              Trip Post Karein
            </Button>
          </Link>
        ) : (
          <Link to="/signup">
            <Button
              variant="secondary"
              size="lg"
              className="!bg-white !text-primary-700 hover:!bg-primary-50"
            >
              Abhi Signup Karein
            </Button>
          </Link>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Login karein nearby trips dekhne ke liye
          </h2>
          <p className="text-gray-600 mb-6">
            Apne ilaqe mein grocery trips dhundhein
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/login">
              <Button variant="primary">Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline">Signup</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <MapPin className="w-5 h-5 text-primary-600" />
              <select
                value={selectedCity}
                onChange={handleCityChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">
                  {geoLoading ? 'Location dhundh raha...' : 'Shehar select karein'}
                </option>
                {PAKISTANI_CITIES.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Radius:
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={15}>15 km</option>
                <option value={20}>20 km</option>
              </select>
            </div>
          </div>

          {/* Trips */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Nearby Trips
            </h2>
            <span className="text-sm text-gray-500">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} mili
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Koi trip nahi mili
              </h3>
              <p className="text-gray-600 mb-6">
                {radius}km ke andar koi active trip nahi hai
              </p>
              <Link to="/post-trip">
                <Button variant="primary">
                  <Plus className="w-4 h-4" />
                  Khud Trip Post Karein
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trips.map((trip) => (
                <TripCard key={trip._id} trip={trip} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;