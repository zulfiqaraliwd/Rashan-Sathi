import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error as the user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or phone is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await login(formData.identifier, formData.password);

      if (response.success) {
        toast.success(`Welcome back, ${response.user.name}!`);

        // If the phone is not verified, send them to the OTP page
        if (!response.user.isPhoneVerified) {
          navigate('/verify-otp');
        } else {
          navigate('/');
        }
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-2 text-gray-600">Log in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          label="Email or Phone"
          name="identifier"
          value={formData.identifier}
          onChange={handleChange}
          placeholder="ali@example.com or 03001234567"
          icon={Mail}
          error={errors.identifier}
          disabled={loading}
          autoComplete="username"
        />

        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          icon={Lock}
          error={errors.password}
          disabled={loading}
          autoComplete="current-password"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          }
        />

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <p className="mt-8 text-center text-gray-600">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-semibold text-primary-700 underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
