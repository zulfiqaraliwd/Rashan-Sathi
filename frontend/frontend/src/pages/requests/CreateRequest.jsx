import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DollarSign, MapPin, Phone, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import tripService from '../../services/tripService';
import requestService from '../../services/requestService';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { PAKISTANI_CITIES } from '../../utils/constants';

const CreateRequest = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    itemList: '',
    budget: '',
    deliveryAddress: user?.address || '',
    city: 'Karachi',
    contactPhone: user?.phone || '',
    specialInstructions: '',
  });

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await tripService.getTripById(tripId);
        if (response.success) {
          setTrip(response.trip);
          if (response.trip.shopperId._id === user?._id) {
            toast.error('You cannot send a request to your own trip');
            navigate('/');
          }
        }
      } catch (error) {
        toast.error('Trip not found');
        navigate('/');
      } finally {
        setLoadingTrip(false);
      }
    };
    fetchTrip();
  }, [tripId, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.itemList.trim())
      newErrors.itemList = 'Item list is required';
    if (!formData.budget) newErrors.budget = 'Budget is required';
    else if (Number(formData.budget) < 1)
      newErrors.budget = 'Budget must be greater than 0';
    if (!formData.deliveryAddress.trim())
      newErrors.deliveryAddress = 'Delivery address is required';
    if (!formData.contactPhone.trim())
      newErrors.contactPhone = 'Contact phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const city = PAKISTANI_CITIES.find((c) => c.name === formData.city);
      const coords = city
        ? [city.lng, city.lat]
        : user?.location?.coordinates || [67.0011, 24.8607];

      const response = await requestService.createRequest({
        tripId,
        itemList: formData.itemList.trim(),
        budget: Number(formData.budget),
        deliveryAddress: formData.deliveryAddress.trim(),
        deliveryCoordinates: coords,
        contactPhone: formData.contactPhone.trim(),
        specialInstructions: formData.specialInstructions.trim(),
      });

      if (response.success) {
        toast.success('Request sent!');
        navigate('/my-requests');
      } else {
        toast.error(response.message || 'Request failed');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || 'Request failed'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTrip) return <Loader text="Loading trip..." fullScreen />;
  if (!trip) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        back
        title="Send Request"
        subtitle="Tell us your item list and budget"
      />

      {/* Trip Info Card */}
      <div className="mb-6 flex animate-rise items-center gap-4 rounded-2xl bg-primary-900 p-5 text-white">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <Store className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg font-bold">Trip to {trip.storeName}</p>
          <p className="truncate text-sm text-primary-100/80">{trip.address}</p>
          <p className="mt-1 text-sm text-primary-100/80">
            Shopper: <span className="font-semibold text-white">{trip.shopperId?.name}</span>
            {' '}&nbsp;|&nbsp; Fee:{' '}
            <span className="font-semibold text-accent-300">Rs. {trip.serviceFee}</span>
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="stagger animate-rise space-y-5 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-card sm:p-8"
        style={{ '--i': 2 }}
      >
        <Textarea
          label="Item List"
          name="itemList"
          value={formData.itemList}
          onChange={handleChange}
          rows={4}
          placeholder={'2 kg flour\n1 dozen eggs\n1 litre milk\n1 packet sugar'}
          error={errors.itemList}
          required
        />

        <Input
          label="Budget (PKR)"
          name="budget"
          type="number"
          value={formData.budget}
          onChange={handleChange}
          placeholder="800"
          icon={DollarSign}
          error={errors.budget}
          required
        />

        <Input
          label="Delivery Address"
          name="deliveryAddress"
          value={formData.deliveryAddress}
          onChange={handleChange}
          placeholder="DHA Phase 5, Street 4, House 12"
          icon={MapPin}
          error={errors.deliveryAddress}
          required
        />

        <Select label="City" name="city" value={formData.city} onChange={handleChange}>
          {PAKISTANI_CITIES.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </Select>

        <Input
          label="Contact Phone"
          name="contactPhone"
          type="tel"
          value={formData.contactPhone}
          onChange={handleChange}
          placeholder="03001234567"
          icon={Phone}
          error={errors.contactPhone}
          required
        />

        <Textarea
          label="Special Instructions (Optional)"
          name="specialInstructions"
          value={formData.specialInstructions}
          onChange={handleChange}
          rows={2}
          placeholder="Please pick fresh milk and check the expiry date..."
        />

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          {submitting ? 'Sending...' : 'Send Request'}
        </Button>
      </form>
    </div>
  );
};

export default CreateRequest;
