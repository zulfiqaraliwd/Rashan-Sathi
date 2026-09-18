import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Clock, Users, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import useGeolocation from '../../hooks/useGeolocation';
import tripService from '../../services/tripService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { PAKISTANI_CITIES, DEFAULT_COORDS } from '../../utils/constants';

const PostTrip = () => {
  const navigate = useNavigate();
  const { isVerified } = useAuth();
  const { location } = useGeolocation();

  const [formData, setFormData] = useState({
    storeName: '',
    address: '',
    city: 'Karachi',
    departureTime: '',
    returnTime: '',
    serviceRadiusKm: 5,
    maxRequests: 5,
    note: '',
    serviceFee: 100,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.storeName.trim()) newErrors.storeName = 'Store ka naam zaroori hai';
    if (!formData.address.trim()) newErrors.address = 'Address zaroori hai';
    if (!formData.departureTime) newErrors.departureTime = 'Departure time zaroori hai';
    if (!formData.returnTime) newErrors.returnTime = 'Return time zaroori hai';

    if (formData.departureTime && formData.returnTime) {
      if (new Date(formData.departureTime) >= new Date(formData.returnTime)) {
        newErrors.returnTime = 'Return time departure ke baad honi chahiye';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // City se coordinates lo
      const city = PAKISTANI_CITIES.find((c) => c.name === formData.city);
      const coords = city
        ? [city.lng, city.lat]
        : location
        ? [location.lng, location.lat]
        : [DEFAULT_COORDS.lng, DEFAULT_COORDS.lat];

      const response = await tripService.createTrip({
        storeName: formData.storeName.trim(),
        address: formData.address.trim(),
        coordinates: coords,
        departureTime: new Date(formData.departureTime).toISOString(),
        returnTime: new Date(formData.returnTime).toISOString(),
        serviceRadiusKm: Number(formData.serviceRadiusKm),
        maxRequests: Number(formData.maxRequests),
        note: formData.note.trim(),
        serviceFee: Number(formData.serviceFee),
      });

      if (response.success) {
        toast.success('Trip post ho gayi! ✅');
        navigate('/my-trips');
      } else {
        toast.error(response.message || 'Trip post fail ho gayi');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || 'Trip post fail'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">
            Phone Verify Karein
          </h2>
          <p className="text-yellow-700 mb-4">
            Trip post karne ke liye pehle apna phone verify karein
          </p>
          <Button onClick={() => navigate('/verify-otp')}>Verify Karein</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Trip Post Karein</h1>
          <p className="text-gray-600">
            Apni grocery trip post karein aur doosron ka saman bhi le aayein
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Store Ka Naam"
            name="storeName"
            value={formData.storeName}
            onChange={handleChange}
            placeholder="Imtiaz Super Market"
            icon={Store}
            error={errors.storeName}
            required
          />

          <Input
            label="Store Ka Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="DHA Phase 6, Karachi"
            icon={MapPin}
            error={errors.address}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shehar
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {PAKISTANI_CITIES.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kab Ja Rahe Hain?
              </label>
              <input
                type="datetime-local"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${
                  errors.departureTime ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.departureTime && (
                <p className="mt-1 text-sm text-red-600">{errors.departureTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kab Wapas Aayenge?
              </label>
              <input
                type="datetime-local"
                name="returnTime"
                value={formData.returnTime}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${
                  errors.returnTime ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.returnTime && (
                <p className="mt-1 text-sm text-red-600">{errors.returnTime}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Radius (km)
              </label>
              <select
                name="serviceRadiusKm"
                value={formData.serviceRadiusKm}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                {[2, 3, 5, 10, 15, 20].map((r) => (
                  <option key={r} value={r}>
                    {r} km
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Requests
              </label>
              <select
                name="maxRequests"
                value={formData.maxRequests}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                {[1, 2, 3, 5, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} orders
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Service Fee (PKR per order)"
            name="serviceFee"
            type="number"
            value={formData.serviceFee}
            onChange={handleChange}
            placeholder="100"
            icon={DollarSign}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extra Note (Optional)
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              placeholder="Imtiaz ja raha hoon, kuch chahiye to batao..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            {loading ? 'Post ho rahi hai...' : 'Trip Post Karein'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PostTrip;