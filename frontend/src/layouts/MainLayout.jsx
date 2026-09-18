import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, Home, Plus, List, User, LogOut } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { APP_NAME } from '../constants';

const MainLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800 hidden sm:block">
                {APP_NAME}
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-gray-600 hover:text-primary-600 font-medium transition"
              >
                Home
              </Link>
              <Link
                to="/post-trip"
                className="text-gray-600 hover:text-primary-600 font-medium transition"
              >
                Post Trip
              </Link>
              <Link
                to="/my-trips"
                className="text-gray-600 hover:text-primary-600 font-medium transition"
              >
                My Trips
              </Link>
              <Link
                to="/my-requests"
                className="text-gray-600 hover:text-primary-600 font-medium transition"
              >
                My Requests
              </Link>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-semibold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:block font-medium">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 transition"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-primary-600 font-medium transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2026 {APP_NAME} — Pakistan ka pehla peer-to-peer grocery platform</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;