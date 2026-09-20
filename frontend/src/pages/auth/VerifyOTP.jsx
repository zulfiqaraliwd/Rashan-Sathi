import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';

const OTP_LENGTH = 6;

/** Six separate boxes that behave like one field (typing, backspace, paste). */
const OtpBoxes = ({ value, onChange, disabled }) => {
  const refs = useRef([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] || '');

  const focusAt = (i) => refs.current[Math.max(0, Math.min(OTP_LENGTH - 1, i))]?.focus();

  const handleChange = (i, e) => {
    const typed = e.target.value.replace(/\D/g, '');
    if (!typed) return;
    const next = value.split('');
    next[i] = typed.slice(-1);
    onChange(next.join('').slice(0, OTP_LENGTH));
    focusAt(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = value.split('');
      if (next[i]) {
        next[i] = '';
        onChange(next.join(''));
      } else {
        next[i - 1] = '';
        onChange(next.join(''));
        focusAt(i - 1);
      }
    } else if (e.key === 'ArrowLeft') focusAt(i - 1);
    else if (e.key === 'ArrowRight') focusAt(i + 1);
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    focusAt(pasted.length);
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={i === 0}
          aria-label={`OTP digit ${i + 1}`}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={`h-14 w-full min-w-0 rounded-xl border bg-white text-center font-display text-2xl font-bold tabular-nums text-gray-900 shadow-xs transition duration-200 focus:outline-none focus:ring-4 disabled:bg-gray-100 sm:h-16 sm:text-3xl ${
            digit
              ? 'border-primary-500 bg-primary-50/50 focus:ring-primary-500/15'
              : 'border-gray-300 hover:border-gray-400 focus:border-primary-500 focus:ring-primary-500/15'
          }`}
        />
      ))}
    </div>
  );
};

const VerifyOTP = () => {
  const navigate = useNavigate();
  const { user, verifyOTP, resendOTP, isAuthenticated, loading: authLoading } = useAuth();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60); // 60 seconds countdown

  // If the user is not logged in, send them to the login page
  // (authLoading: wait for the user to load after a refresh, otherwise we redirect wrongly)
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // If the phone is already verified, send them home
    if (user?.isPhoneVerified) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, user, navigate]);

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
      toast.error('Enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOTP(otp);
      if (response.success) {
        toast.success('Phone verified!');
        navigate('/');
      } else {
        toast.error(response.message || 'Incorrect OTP');
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Verification failed';
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
        toast.success('A new OTP has been sent!');
        setTimer(60);
        setOtp('');
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
          <ShieldCheck className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-4xl font-bold text-gray-900">Verify OTP</h1>
        <p className="mt-2 text-gray-600">
          We have sent a 6-digit code to your phone
        </p>
        {user?.phone && (
          <p className="mt-1 font-semibold tabular-nums text-gray-900">{user.phone}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Check the terminal for the OTP</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <OtpBoxes value={otp} onChange={setOtp} disabled={loading} />

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={loading}
          disabled={otp.length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        {timer > 0 ? (
          <p className="text-sm text-gray-500">
            Resend OTP in{' '}
            <span className="font-semibold tabular-nums text-gray-800">{timer}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-sm font-semibold text-primary-700 underline-offset-4 hover:underline disabled:opacity-60"
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyOTP;
