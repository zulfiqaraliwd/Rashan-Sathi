import { Link, Outlet } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { APP_NAME } from '../constants';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <header className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/" className="flex items-center gap-2 w-fit mx-auto">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">{APP_NAME}</span>
          </Link>
        </div>
      </header>

      {/* Content — YE SECTION ZAROORI HAI */}
<main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
  <div className="w-full max-w-md">
    <Outlet />
  </div>
</main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>© 2026 {APP_NAME}</p>
      </footer>
    </div>
  );
};

export default AuthLayout;