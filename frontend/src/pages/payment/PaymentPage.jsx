import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Upload, Hourglass } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import requestService from '../../services/requestService';
import paymentService from '../../services/paymentService';
import uploadService from '../../services/uploadService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';

const PaymentPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState('');

  const [formData, setFormData] = useState({
    trxId: '',
    paymentMethod: 'jazzcash',
    screenshot: null,
    screenshotUrl: '',
  });

  const [isRequester, setIsRequester] = useState(false);
  const [isShopper, setIsShopper] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await requestService.getRequestById(requestId);
        if (response.success) {
          setRequest(response.request);
          setIsRequester(response.request.requesterId._id === user?._id);
          setIsShopper(response.request.shopperId._id === user?._id);
        }
      } catch (error) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [requestId, user, navigate]);

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadService.uploadSingle(file, 'screenshots');
      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          screenshotUrl: response.image.url,
        }));
        toast.success('Screenshot uploaded');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.trxId || !formData.screenshotUrl) {
      toast.error('Both the TRX ID and a screenshot are required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await paymentService.markPaid(requestId, {
        trxId: formData.trxId,
        paymentScreenshot: formData.screenshotUrl,
        paymentMethod: formData.paymentMethod,
      });

      if (response.success) {
        toast.success('Payment submitted! The shopper will confirm it');
        navigate('/my-requests');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  // NOTE: the shopper's "payment received" confirm button is not rendered in any view
  // yet — this handler is never called (same in the original code).
  // eslint-disable-next-line no-unused-vars
  const handleConfirmPayment = async () => {
    if (!window.confirm('Have you received the payment?')) return;
    setSubmitting(true);
    try {
      const response = await paymentService.confirmPayment(requestId);
      if (response.success) {
        toast.success('Payment confirmed! Order complete');
        navigate('/my-trips');
      }
    } catch (error) {
      toast.error('Failed to confirm');
    } finally {
      setSubmitting(false);
    }
  };

  const copyNumber = (key, number) => {
    navigator.clipboard.writeText(number);
    toast.success('Copied');
    setCopied(key);
    setTimeout(() => setCopied(''), 1600);
  };

  if (loading) return <Loader text="Loading payment..." fullScreen />;
  if (!request) return null;

  const totalAmount = request.totalAmount || request.actualAmount || 0;
  const shopperPayment = request.shopperId?.paymentMethods;

  // Shopper view — showing received payment
  if (isShopper && request.status === 'delivered') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="animate-rise rounded-3xl border border-gray-200/80 bg-white p-8 text-center shadow-card sm:p-10">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-accent-50 text-accent-600">
            <Hourglass className="size-8" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-gray-900">Awaiting Payment</h1>
          <p className="mx-auto mt-2 max-w-sm text-gray-600">
            The requester will pay, then you can confirm
          </p>
          <p className="mt-6 font-display text-3xl font-bold tabular-nums text-primary-700">
            Rs. {totalAmount}
          </p>
        </div>
      </div>
    );
  }

  // Shopper view — payment received, confirm it
  if (isShopper && request.status === 'paid') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="animate-rise rounded-3xl border border-gray-200/80 bg-white p-8 text-center shadow-card sm:p-10">
          <span className="mx-auto flex size-16 animate-tick items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <Check className="size-8" strokeWidth={3} aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-gray-900">Payment Confirmed</h1>
          <p className="mt-2 text-gray-600">Order complete!</p>
        </div>
      </div>
    );
  }

  const canSubmit = formData.trxId && formData.screenshotUrl;

  // Requester view — make the payment
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        back
        title="Make Payment"
        subtitle="Send the payment to the shopper and upload the TRX ID"
      />

      {/* Amount */}
      <div className="animate-rise rounded-3xl bg-primary-900 p-6 text-white shadow-lift sm:p-8">
        <p className="text-sm text-primary-100/80">Total Amount</p>
        <p className="mt-1 font-display text-5xl font-bold tabular-nums">Rs. {totalAmount}</p>
        <p className="mt-3 text-sm text-primary-100/80">
          Items: <span className="font-semibold tabular-nums text-white">Rs. {request.actualAmount}</span>
          {' '}+ Service:{' '}
          <span className="font-semibold tabular-nums text-accent-300">Rs. {request.serviceFee}</span>
        </p>
      </div>

      {/* Shopper's Payment Info */}
      <div
        className="stagger mt-6 animate-rise rounded-3xl border border-gray-200/80 bg-white p-6 shadow-card"
        style={{ '--i': 2 }}
      >
        <h3 className="mb-2 text-lg font-bold text-gray-900">Shopper's Payment Info</h3>
        <div className="divide-y divide-gray-100">
          {[
            ['jazzcash', 'JazzCash'],
            ['easypaisa', 'Easypaisa'],
          ].map(([key, label]) =>
            shopperPayment?.[key]?.number ? (
              <div key={key} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="font-semibold tabular-nums text-gray-900">
                    {shopperPayment[key].number}
                  </p>
                  <p className="text-xs text-gray-500">{shopperPayment[key].accountName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyNumber(key, shopperPayment[key].number)}
                  aria-label={`Copy ${label} number`}
                  className={`flex size-10 items-center justify-center rounded-xl border transition ${
                    copied === key
                      ? 'border-primary-300 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-700'
                  }`}
                >
                  {copied === key ? (
                    <Check key="ok" className="size-4 animate-tick" strokeWidth={3} />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            ) : null
          )}
          {!shopperPayment?.jazzcash?.number && !shopperPayment?.easypaisa?.number && (
            <p className="py-3 text-sm text-gray-500">
              The shopper has not added payment info yet.
            </p>
          )}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="stagger mt-6 animate-rise space-y-5 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-card sm:p-8"
        style={{ '--i': 4 }}
      >
        <Select
          label="Payment Method"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))
          }
        >
          <option value="jazzcash">JazzCash</option>
          <option value="easypaisa">Easypaisa</option>
        </Select>

        <Input
          label="TRX ID"
          name="trxId"
          value={formData.trxId}
          onChange={(e) => setFormData((prev) => ({ ...prev, trxId: e.target.value }))}
          placeholder="JZ123456789"
          required
        />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-gray-700">
            Screenshot <span className="text-red-500">*</span>
          </span>
          {formData.screenshotUrl ? (
            <div className="flex animate-fade items-center gap-3 rounded-2xl border border-primary-300 bg-primary-50 p-4">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary-600 text-white">
                <Check className="size-5" strokeWidth={3} aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-primary-800">Screenshot uploaded</span>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/60 p-8 transition duration-200 hover:border-primary-400 hover:bg-primary-50/50">
              {uploading ? (
                <span className="size-8 animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-600" />
              ) : (
                <>
                  <span className="flex size-12 items-center justify-center rounded-xl bg-white text-primary-600 shadow-card">
                    <Upload className="size-6" aria-hidden="true" />
                  </span>
                  <span className="mt-3 text-sm font-medium text-gray-700">
                    Upload screenshot
                  </span>
                  <span className="mt-0.5 text-xs text-gray-500">JPG, PNG or WebP</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="sr-only"
                disabled={uploading}
              />
            </label>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={submitting}
          disabled={!canSubmit}
        >
          {submitting ? 'Sending...' : 'Confirm Payment'}
        </Button>
      </form>
    </div>
  );
};

export default PaymentPage;
