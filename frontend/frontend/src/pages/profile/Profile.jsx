import { useState } from 'react';
import { User, MapPin, Wallet, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import useGeolocation from '../../hooks/useGeolocation';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import { PAKISTANI_CITIES } from '../../utils/constants';

const SectionTitle = ({ icon: Icon, children }) => (
  <h3 className="mb-4 flex items-center gap-3 text-lg font-bold text-gray-900">
    <span className="flex size-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
      <Icon className="size-[1.15rem]" aria-hidden="true" />
    </span>
    {children}
  </h3>
);

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

      if (response.success) toast.success('Profile updated');
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader back title="Profile Settings" subtitle="Update your information" />

      <form
        onSubmit={handleSubmit}
        className="animate-rise divide-y divide-gray-100 rounded-3xl border border-gray-200/80 bg-white shadow-card"
      >
        {/* Basic Info */}
        <section className="p-6 sm:p-8">
          <SectionTitle icon={User}>Basic Info</SectionTitle>
          <div className="space-y-5">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ali Khan"
            />
            <Textarea
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={2}
              placeholder="Write something about yourself..."
            />
          </div>
        </section>

        {/* Location */}
        <section className="p-6 sm:p-8">
          <SectionTitle icon={MapPin}>Location</SectionTitle>
          <div className="space-y-5">
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="DHA Phase 5, Karachi"
            />
            <Select label="City" name="city" value={formData.city} onChange={handleChange}>
              {PAKISTANI_CITIES.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </Select>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="p-6 sm:p-8">
          <SectionTitle icon={Wallet}>Payment Methods</SectionTitle>
          <p className="-mt-2 mb-5 text-sm text-gray-500">
            Required to become a shopper — this is where you will receive money
          </p>
          <div className="space-y-4">
            <div className="grid gap-4 rounded-2xl bg-gray-50 p-4 sm:grid-cols-2">
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
            <div className="grid gap-4 rounded-2xl bg-gray-50 p-4 sm:grid-cols-2">
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
        </section>

        <div className="p-6 sm:p-8">
          <Button type="submit" size="lg" fullWidth loading={loading}>
            {!loading && <Save className="size-5" aria-hidden="true" />}
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
