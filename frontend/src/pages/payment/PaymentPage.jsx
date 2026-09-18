import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import requestService from '../../services/requestService';
import paymentService from '../../services/paymentService';
import uploadService from '../../services/uploadService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const PaymentPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        toast.success('Screenshot upload ho gaya');
      }
    } catch (error) {
      toast.error('Upload fail');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.trxId || !formData.screenshotUrl) {
      toast.error('TRX ID aur screenshot dono chahiye');
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
        toast.success('Payment claim ho gayi! Shopper confirm karega');
        navigate('/my-requests');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment fail');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!window.confirm('Kya aapne payment receive kar li hai?')) return;
    setSubmitting(true);
    try {
      const response = await paymentService.confirmPayment(requestId);
      if (response.success) {
        toast.success('Payment confirm! Order complete 🎉');
        navigate('/my-trips');
      }
    } catch (error) {
      toast.error('Confirm fail');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Payment load ho rahi hai..." fullScreen />;
  if (!request) return null;

  const totalAmount = request.totalAmount || request.actualAmount || 0;
  const shopperPayment = request.shopperId?.paymentMethods;

  // Shopper view — showing received payment
  if (isShopper && request.status === 'delivered') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Ka Intezar</h1>
          <p className="text-gray-600 mb-6">
            Requester payment karega, phir aap confirm karein
          </p>
          <p className="text-sm text-gray-500">
            Amount: Rs. {totalAmount}
          </p>
        </div>
      </div>
    );
  }

  // Shopper view — payment received, confirm karo
  if (isShopper && request.status === 'paid') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Confirmed ✅</h1>
          <p className="text-gray-600">
            Order complete ho gaya!
          </p>
        </div>
      </div>
    );
  }

  // Requester view — payment karo
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Karein
        </h1>
        <p className="text-gray-600 mb-6">
          Shopper ko payment bhejein aur TRX ID upload karein
        </p>

        {/* Amount */}
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-primary-700">Total Amount</p>
          <p className="text-3xl font-bold text-primary-700">
            Rs. {totalAmount}
          </p>
          <p className="text-xs text-primary-600 mt-1">
            Saman: Rs. {request.actualAmount} + Service: Rs. {request.serviceFee}
          </p>
        </div>

        {/* Shopper's Payment Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            Shopper Ki Payment Info
          </h3>
          {shopperPayment?.jazzcash?.number && (
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-500">JazzCash</p>
                <p className="font-medium">
                  {shopperPayment.jazzcash.number}
                </p>
                <p className="text-xs text-gray-500">
                  {shopperPayment.jazzcash.accountName}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shopperPayment.jazzcash.number);
                  toast.success('Copy ho gaya');
                }}
                className="p-2 hover:bg-gray-200 rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          )}
          {shopperPayment?.easypaisa?.number && (
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-gray-500">Easypaisa</p>
                <p className="font-medium">
                  {shopperPayment.easypaisa.number}
                </p>
                <p className="text-xs text-gray-500">
                  {shopperPayment.easypaisa.accountName}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shopperPayment.easypaisa.number);
                  toast.success('Copy ho gaya');
                }}
                className="p-2 hover:bg-gray-200 rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentMethod: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="jazzcash">JazzCash</option>
              <option value="easypaisa">Easypaisa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TRX ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.trxId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, trxId: e.target.value }))
              }
              placeholder="JZ123456789"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Screenshot <span className="text-red-500">*</span>
            </label>
            {formData.screenshotUrl ? (
              <div className="border-2 border-green-500 rounded-lg p-3 flex items-center gap-2 bg-green-50">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">
                  Screenshot uploaded
                </span>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:border-primary-500 transition">
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Screenshot upload karein
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={!formData.trxId || !formData.screenshotUrl}
          >
            {submitting ? 'Bhej rahe hain...' : 'Payment Confirm Karein'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;