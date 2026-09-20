import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyOTP from './pages/auth/VerifyOTP';

// Trip Pages
import Home from './pages/trips/Home';
import PostTrip from './pages/trips/PostTrip';
import TripDetails from './pages/trips/TripDetails';
import MyTrips from './pages/trips/MyTrips';

// Request Pages
import CreateRequest from './pages/requests/CreateRequest';
import MyRequests from './pages/requests/MyRequests';
import RequestDetails from './pages/requests/RequestDetails';

// Chat & Payment
import ChatPage from './pages/chat/ChatPage';
import PaymentPage from './pages/payment/PaymentPage';

// Profile
import Profile from './pages/profile/Profile';
import Dashboard from './pages/profile/Dashboard';
import OrderHistory from './pages/profile/OrderHistory';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import DisputesManagement from './pages/admin/DisputesManagement';
import Transactions from './pages/admin/Transactions';

// Not Found
import NotFound from './pages/NotFound';

/** New page → start at the top (React Router doesn't do this by itself). */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const toastOptions = {
  duration: 3500,
  style: {
    background: '#ffffff',
    color: '#17231c',
    border: '1px solid #e1e7e3',
    borderRadius: '16px',
    padding: '12px 16px',
    fontSize: '0.9rem',
    fontWeight: 500,
    boxShadow: '0 18px 40px -16px rgba(16, 67, 44, 0.32)',
  },
  success: { iconTheme: { primary: '#17804d', secondary: '#ffffff' } },
  error: { iconTheme: { primary: '#dc2626', secondary: '#ffffff' } },
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster
        position="top-center"
        gutter={10}
        containerStyle={{ top: 76 }}
        toastOptions={toastOptions}
      />
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
        </Route>

        {/* Main routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/post-trip" element={<PostTrip />} />
          <Route path="/trip/:id" element={<TripDetails />} />
          <Route path="/my-trips" element={<MyTrips />} />
          <Route path="/request/:tripId" element={<CreateRequest />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/request-details/:id" element={<RequestDetails />} />
          <Route path="/chat/:requestId" element={<ChatPage />} />
          <Route path="/payment/:requestId" element={<PaymentPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<OrderHistory />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/admin/disputes" element={<DisputesManagement />} />
          <Route path="/admin/transactions" element={<Transactions />} />

          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
