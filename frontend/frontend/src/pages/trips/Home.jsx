import { useState, useEffect, lazy, Suspense } from 'react';
import { MapPin, Plus, Search, Route, ShoppingBasket, Wallet } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useGeolocation from '../../hooks/useGeolocation';
import tripService from '../../services/tripService';
import TripCard from '../../components/trips/TripCard';
import HeroRoute from '../../components/home/HeroRoute';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import EmptyState from '../../components/common/EmptyState';
import { Skeleton, TripCardSkeleton } from '../../components/common/Skeleton';
import { PAKISTANI_CITIES, DEFAULT_COORDS } from '../../utils/constants';

// Loaded on demand so the map library isn't part of the first page load
const TripMap = lazy(() => import('../../components/maps/TripMap'));

const steps = [
  {
    icon: Route,
    title: 'Post a trip',
    text: 'Before heading to the store, post your trip with the time and service fee.',
  },
  {
    icon: ShoppingBasket,
    title: 'Send a request',
    text: 'Find a trip from a shopper in your area and send your item list and budget.',
  },
  {
    icon: Wallet,
    title: 'Delivery and payment',
    text: 'Once you receive your items, pay easily via JazzCash or Easypaisa.',
  },
];

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const { location, loading: geoLoading } = useGeolocation();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(5);
  const [searchCoords, setSearchCoords] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');

  // Set the location — the user's location, or the default
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

  // Fetch trips
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-primary-900 text-white shadow-lift">
        <div className="grid items-center lg:grid-cols-[1.05fr_1fr]">
          <div className="relative z-10 p-8 sm:p-12 lg:p-14">
            <h1
              className="animate-rise text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl"
              style={{ letterSpacing: '-0.035em' }}
            >
              Rashan Sathi
            </h1>
            <p
              className="stagger mt-5 max-w-md animate-rise text-lg leading-relaxed text-primary-100/90 sm:text-xl"
              style={{ '--i': 2 }}
            >
              Pakistan's first peer-to-peer grocery platform
            </p>
            <div
              className="stagger mt-9 flex flex-wrap gap-3 animate-rise"
              style={{ '--i': 4 }}
            >
              {isAuthenticated ? (
                <Button to="/post-trip" variant="accent" size="lg">
                  <Plus className="size-5" aria-hidden="true" />
                  Post a Trip
                </Button>
              ) : (
                <>
                  <Button to="/signup" variant="accent" size="lg">
                    Sign Up Now
                  </Button>
                  <Button to="/login" variant="glass" size="lg">
                    Login
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="relative px-4 pb-6 sm:px-10 lg:p-8">
            <HeroRoute className="mx-auto h-auto w-full max-w-md lg:max-w-none" />
          </div>
        </div>
      </section>

      {!isAuthenticated ? (
        <>
          {/* How it works — a real sequence, so numbering is meaningful here */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              How it works
            </h2>
            <ol className="mt-8 grid gap-5 md:grid-cols-3">
              {steps.map((step, i) => (
                <li
                  key={step.title}
                  style={{ '--i': i }}
                  className="stagger animate-rise rounded-2xl border border-gray-200/80 bg-white p-6 shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                      <step.icon className="size-6" aria-hidden="true" />
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-display text-5xl font-bold text-primary-100"
                    >
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-600">{step.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-12 rounded-3xl border border-gray-200/80 bg-white px-6 py-12 text-center shadow-card">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Log in to see nearby trips
            </h2>
            <p className="mt-2 text-gray-600">Find grocery trips in your area</p>
            <div className="mt-7 flex justify-center gap-3">
              <Button to="/login">Login</Button>
              <Button to="/signup" variant="outline">
                Signup
              </Button>
            </div>
          </section>
        </>
      ) : (
        <section className="mt-10">
          {/* Filters */}
          <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white p-3 shadow-card sm:flex-row sm:items-center">
            <Select
              icon={MapPin}
              aria-label="City"
              value={selectedCity}
              onChange={handleCityChange}
              className="flex-1"
            >
              <option value="">
                {geoLoading ? 'Finding your location...' : 'Select a city'}
              </option>
              {PAKISTANI_CITIES.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </Select>

            <div className="flex items-center gap-3 sm:pl-2">
              <span className="text-sm font-medium text-gray-600">Radius</span>
              <Select
                aria-label="Radius"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="flex-1 sm:w-32 sm:flex-none"
              >
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={15}>15 km</option>
                <option value={20}>20 km</option>
              </Select>
            </div>
          </div>

          {/* Map */}
          {searchCoords && !loading && trips.length > 0 && (
            <div className="mb-8 animate-fade">
              <Suspense fallback={<Skeleton className="h-72 rounded-2xl sm:h-80" />}>
                <TripMap
                  key={`${searchCoords.lat}-${searchCoords.lng}-${radius}`}
                  trips={trips}
                  center={[searchCoords.lat, searchCoords.lng]}
                  radiusKm={radius}
                  className="h-72 sm:h-80"
                />
              </Suspense>
            </div>
          )}

          {/* Trips */}
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Nearby Trips</h2>
            <span className="text-sm text-gray-500">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} found
            </span>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <TripCardSkeleton key={i} />
              ))}
            </div>
          ) : trips.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No trips found"
              description={`There are no active trips within ${radius}km`}
              action={
                <Button to="/post-trip">
                  <Plus className="size-4" aria-hidden="true" />
                  Post Your Own Trip
                </Button>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip, i) => (
                <TripCard key={trip._id} trip={trip} index={i} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;
