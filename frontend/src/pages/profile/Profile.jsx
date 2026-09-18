import { useState } from 'react';
import { User, MapPin, Wallet, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import useGeolocation from '../../hooks/useGeolocation';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { PAKISTANI_CITIES } from '../../utils/constants';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { location } = useGeolocation();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    address: user?.address || '',
    city: 'Karachi',
    jazzcash: user?.paymentMethods?.jazzcash?.number || '',
    jazzcashName: user?.paymentMethods?.jazzcash?.accountName || '',
    easypaisa: user?.paymentMethods?.easypaisa?.number || '',
    easypaisaName: user?.paymentMethods?.easypaisa?.accountName || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const city = PAKISTANI_CITIES.find((c) => c.name === formData.city);
      const coordinates = location
        ? [location.lng, location.lat]
        : city
        ? [city.lng, city.lat]
        : user?.location?.coordinates;

      const response = await updateProfile({
        name: formData.name,
        bio: formData.bio,
        address: formData.address,
        location: coordinates ? { coordinates } : undefined,
        paymentMethods: {
          jazzcash: {
            number: formData.jazzcash,
            accountName: formData.jazzcashName,
          },
          easypaisa: {
            number: formData.easypaisa,
            accountName: formData.easypaisaName,
          },
        },
      });

      if (response.success) toast.success('Profile update ho gayi');
    } catch (error) {
      toast.error('Update fail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600 mb-6">Apni info update karein</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              Basic Info
            </h3>
            <div className="space-y-4">
              <Input
                label="Poora Naam"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ali Khan"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Apne baare mein kuch likhein..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              Location
            </h3>
            <div className="space-y-4">
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="DHA Phase 5, Karachi"
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
            </div>
          </div>

          {/* Payment Methods */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary-600" />
              Payment Methods
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Shopper banne ke liye zaroori hai — yahan paisa milega
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="JazzCash Number"
                  name="jazzcash"
                  value={formData.jazzcash}
                  onChange={handleChange}
                  placeholder="03001234567"
                />
                <Input
                  label="JazzCash Name"
                  name="jazzcashName"
                  value={formData.jazzcashName}
                  onChange={handleChange}
                  placeholder="Ali Khan"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Easypaisa Number"
                  name="easypaisa"
                  value={formData.easypaisa}
                  onChange={handleChange}
                  placeholder="03451234567"
                />
                <Input
                  label="Easypaisa Name"
                  name="easypaisaName"
                  value={formData.easypaisaName}
                  onChange={handleChange}
                  placeholder="Ali Khan"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            <Save className="w-5 h-5" />
            {loading ? 'Save ho raha hai...' : 'Save Karo'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;