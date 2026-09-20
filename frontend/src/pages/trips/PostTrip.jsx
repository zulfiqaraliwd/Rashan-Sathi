import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Clock, DollarSign, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import useGeolocation from '../../hooks/useGeolocation';
import tripService from '../../services/tripService';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
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
    if (!formData.storeName.trim()) newErrors.storeName = 'Store name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.departureTime) newErrors.departureTime = 'Departure time is required';
    if (!formData.returnTime) newErrors.returnTime = 'Return time is required';

    if (formData.departureTime && formData.returnTime) {
      if (new Date(formData.departureTime) >= new Date(formData.returnTime)) {
        newErrors.returnTime = 'Return time must be after departure';
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
      // Get coordinates from the city
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
        toast.success('Trip posted!');
        navigate('/my-trips');
      } else {
        toast.error(response.message || 'Failed to post trip');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || 'Failed to post trip'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="animate-rise rounded-3xl border border-accent-200 bg-accent-50 p-8 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
            <ShieldAlert className="size-7" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Verify Your Phone</h2>
          <p className="mx-auto mt-2 max-w-sm text-gray-700">
            Please verify your phone number before posting a trip
          </p>
          <Button className="mt-6" onClick={() => navigate('/verify-otp')}>
            Verify
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        back
        title="Post a Trip"
        subtitle="Post your grocery trip and pick up items for others too"
      />

      <form
        onSubmit={handleSubmit}
        className="animate-rise space-y-6 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-card sm:p-8"
      >
        <Input
          label="Store Name"
          name="storeName"
          value={formData.storeName}
          onChange={handleChange}
          placeholder="Imtiaz Super Market"
          icon={Store}
          error={errors.storeName}
          required
        />

        <Input
          label="Store Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="DHA Phase 6, Karachi"
          icon={MapPin}
          error={errors.address}
          required
        />

        <Select label="City" name="city" value={formData.city} onChange={handleChange}>
          {PAKISTANI_CITIES.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </Select>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="When are you leaving?"
            name="departureTime"
            type="datetime-local"
            value={formData.departureTime}
            onChange={handleChange}
            icon={Clock}
            error={errors.departureTime}
            required
          />
          <Input
            label="When will you be back?"
            name="returnTime"
            type="datetime-local"
            value={formData.returnTime}
            onChange={handleChange}
            icon={Clock}
            error={errors.returnTime}
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label="Service Radius (km)"
            name="serviceRadiusKm"
            value={formData.serviceRadiusKm}
            onChange={handleChange}
          >
            {[2, 3, 5, 10, 15, 20].map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </Select>

          <Select
            label="Max Requests"
            name="maxRequests"
            value={formData.maxRequests}
            onChange={handleChange}
          >
            {[1, 2, 3, 5, 10].map((n) => (
              <option key={n} value={n}>
                {n} orders
              </option>
            ))}
          </Select>
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

        <Textarea
          label="Extra Note (Optional)"
          name="note"
          value={formData.note}
          onChange={handleChange}
          rows={3}
          placeholder="Heading to Imtiaz, let me know if you need anything..."
        />

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? 'Posting...' : 'Post a Trip'}
        </Button>
      </form>
    </div>
  );
};

export default PostTrip;
