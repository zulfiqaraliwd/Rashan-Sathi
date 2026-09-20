import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import { APP_NAME } from '../constants';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/post-trip', label: 'Post Trip' },
  { to: '/my-trips', label: 'My Trips' },
  { to: '/my-requests', label: 'My Requests' },
];

const Logo = ({ className = '' }) => (
  <span
    className={`flex size-10 items-center justify-center rounded-xl bg-primary-900 shadow-[inset_0_1px_0_rgb(255_255_255/0.15)] ${className}`}
  >
    <ShoppingCart className="size-5 text-white" aria-hidden="true" />
  </span>
);

const desktopLink = ({ isActive }) =>
  `rounded-full px-4 py-2 text-[0.95rem] font-medium transition-colors ${
    isActive
      ? 'bg-primary-50 text-primary-800'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`;

const mobileLink = ({ isActive }) =>
  `flex items-center rounded-xl px-4 py-3 text-base font-medium transition-colors ${
    isActive
      ? 'bg-primary-50 text-primary-800'
      : 'text-gray-700 hover:bg-gray-100'
  }`;

const MainLayout = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/login');
  };

  const navLinks = isAdmin
    ? [...links, { to: '/admin', label: 'Admin' }]
    : links;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Navbar */}
      <header
        className={`sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl transition-shadow duration-300 ${
          scrolled
            ? 'border-gray-200 shadow-[0_8px_24px_-16px_rgb(16_67_44/0.3)]'
            : 'border-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5">
              <Logo />
              <span className="font-display text-xl font-bold tracking-tight text-gray-900">
                {APP_NAME}
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              {navLinks.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={desktopLink}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Desktop user actions */}
            <div className="hidden items-center gap-2 md:flex">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-4 transition-colors hover:bg-gray-100"
                  >
                    <Avatar name={user?.name} size="sm" />
                    <span className="text-sm font-semibold text-gray-800">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Logout"
                    aria-label="Logout"
                    className="rounded-full p-2.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="size-5" />
                  </button>
                </>
              ) : (
                <>
                  <Button to="/login" variant="ghost" size="sm">
                    Login
                  </Button>
                  <Button to="/signup" size="sm">
                    Signup
                  </Button>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="-mr-2 rounded-xl p-2.5 text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
            >
              {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="animate-drop border-t border-gray-100 bg-white md:hidden">
            <nav className="mx-auto max-w-7xl space-y-1 px-4 py-3" aria-label="Mobile">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={closeMenu}
                  className={mobileLink}
                >
                  {item.to === '/admin' && (
                    <ShieldCheck className="mr-2 size-4" aria-hidden="true" />
                  )}
                  {item.label}
                </NavLink>
              ))}

              <div className="mt-2 border-t border-gray-100 pt-3">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      to="/dashboard"
                      onClick={closeMenu}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 hover:bg-gray-100"
                    >
                      <Avatar name={user?.name} size="md" />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-gray-900">
                          {user?.name}
                        </span>
                        <span className="block text-xs text-gray-500">View dashboard</span>
                      </span>
                    </Link>
                    <Button variant="secondary" size="sm" onClick={handleLogout}>
                      <LogOut className="size-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Button to="/login" variant="outline" onClick={closeMenu}>
                      Login
                    </Button>
                    <Button to="/signup" onClick={closeMenu}>
                      Signup
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main content — keyed by path so every page gets a soft fade-in */}
      <main className="flex-1">
        <div key={pathname} className="animate-fade">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-gray-500 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Logo className="size-7 rounded-lg" />
            <span className="font-display font-semibold text-gray-700">{APP_NAME}</span>
          </div>
          <p className="text-center">
            © 2026 {APP_NAME} — Pakistan's first peer-to-peer grocery platform
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
