import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const { user, verifyOTP, resendOTP, isAuthenticated } = useAuth();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60); // 60 seconds countdown

  // Agar user logged in nahi hai, login page pe bhejo
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Agar phone already verified hai, home pe bhejo
    if (user?.isPhoneVerified) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('6 digit OTP daalein');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOTP(otp);
      if (response.success) {
        toast.success('Phone verify ho gaya! 🎉');
        navigate('/');
      } else {
        toast.error(response.message || 'OTP galat hai');
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Verify fail ho gaya';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await resendOTP();
      if (response.success) {
        toast.success('Naya OTP bheja gaya!');
        setTimer(60);
        setOtp('');
      }
    } catch (error) {
      toast.error('OTP resend fail ho gaya');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">OTP Verify Karein</h1>
        <p className="text-gray-600 text-sm">
          Humne aapke phone pe 6 digit ka code bheja hai
        </p>
        {user?.phone && (
          <p className="text-gray-800 font-medium mt-2">{user.phone}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Terminal mein OTP check karein
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input */}
        <div>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full text-center text-3xl tracking-[1em] py-4 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition font-mono"
            disabled={loading}
            autoFocus
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verify ho raha hai...
            </>
          ) : (
            'Verify Karein'
          )}
        </button>
      </form>

      {/* Resend */}
      <div className="text-center mt-6">
        {timer > 0 ? (
          <p className="text-gray-500 text-sm">
            Naya OTP bhejne mein <span className="font-medium">{timer}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            {resending ? 'Bhej raha hai...' : 'Naya OTP bhejein'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyOTP;