import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DollarSign, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import tripService from '../../services/tripService';
import requestService from '../../services/requestService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
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
            toast.error('Apni trip pe request nahi kar sakte');
            navigate('/');
          }
        }
      } catch (error) {
        toast.error('Trip nahi mili');
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
      newErrors.itemList = 'Saman ki list zaroori hai';
    if (!formData.budget) newErrors.budget = 'Budget zaroori hai';
    else if (Number(formData.budget) < 1)
      newErrors.budget = 'Budget 0 se zyada ho';
    if (!formData.deliveryAddress.trim())
      newErrors.deliveryAddress = 'Delivery address zaroori hai';
    if (!formData.contactPhone.trim())
      newErrors.contactPhone = 'Contact phone zaroori hai';

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
        toast.success('Request bhej di gayi! ✅');
        navigate('/my-requests');
      } else {
        toast.error(response.message || 'Request fail');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || 'Request fail'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTrip) return <Loader text="Trip load ho rahi hai..." fullScreen />;
  if (!trip) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Trip Info Card */}
      <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-6">
        <p className="text-sm text-primary-700 font-medium mb-1">
          Trip to {trip.storeName}
        </p>
        <p className="text-xs text-primary-600">{trip.address}</p>
        <p className="text-xs text-primary-600 mt-1">
          Shopper: {trip.shopperId?.name} • Fee: Rs. {trip.serviceFee}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Request Bhejein
          </h1>
          <p className="text-gray-600 text-sm">
            Apna saman ki list aur budget batayein
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Item list */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Saman Ki List <span className="text-red-500">*</span>
            </label>
            <textarea
              name="itemList"
              value={formData.itemList}
              onChange={handleChange}
              rows={4}
              placeholder="2 kg aata&#10;1 dozen anda&#10;1 litre doodh&#10;1 packet cheeni"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none ${
                errors.itemList ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.itemList && (
              <p className="mt-1 text-sm text-red-600">{errors.itemList}</p>
            )}
          </div>

          {/* Budget */}
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

          {/* Delivery Address */}
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

          {/* City */}
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

          {/* Phone */}
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

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleChange}
              rows={2}
              placeholder="Fresh doodh lena, expiry check karna..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
          >
            {submitting ? 'Bhej rahe hain...' : 'Request Bhejein'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateRequest;