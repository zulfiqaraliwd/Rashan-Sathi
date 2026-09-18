// Order status
export const ORDER_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  SHOPPING: 'shopping',
  DELIVERED: 'delivered',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  DISPUTED: 'disputed',
};

// Status labels (Urdu/English)
export const STATUS_LABELS = {
  requested: { en: 'Requested', ur: 'Request Bheji', color: 'blue' },
  accepted: { en: 'Accepted', ur: 'Accept Kiya', color: 'green' },
  shopping: { en: 'Shopping', ur: 'Shopping Chal Rahi', color: 'yellow' },
  delivered: { en: 'Delivered', ur: 'Deliver Kiya', color: 'purple' },
  paid: { en: 'Paid', ur: 'Payment Ho Gayi', color: 'green' },
  cancelled: { en: 'Cancelled', ur: 'Cancel Kiya', color: 'red' },
  rejected: { en: 'Rejected', ur: 'Reject Kiya', color: 'red' },
  disputed: { en: 'Disputed', ur: 'Dispute', color: 'red' },
};

// Payment methods
export const PAYMENT_METHODS = [
  { value: 'jazzcash', label: 'JazzCash', icon: '📱' },
  { value: 'easypaisa', label: 'Easypaisa', icon: '📱' },
  { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
];

// Service fee (PKR)
export const DEFAULT_SERVICE_FEE = 100;

// Pakistani cities (for quick location set)
export const PAKISTANI_CITIES = [
  { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
  { name: 'Lahore', lat: 31.5204, lng: 74.3587 },
  { name: 'Islamabad', lat: 33.6844, lng: 73.0479 },
  { name: 'Rawalpindi', lat: 33.5974, lng: 73.0678 },
  { name: 'Faisalabad', lat: 31.4187, lng: 73.0791 },
  { name: 'Multan', lat: 30.1575, lng: 71.5249 },
  { name: 'Peshawar', lat: 34.0151, lng: 71.5249 },
  { name: 'Quetta', lat: 30.1798, lng: 66.9905 },
];

// Default coordinates
export const DEFAULT_COORDS = { lat: 24.8607, lng: 67.0011 };
export const DEFAULT_ZOOM = 13;
export const DEFAULT_RADIUS_KM = 5;
export const MAX_RADIUS_KM = 20;

// File upload
export const MAX_FILE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];