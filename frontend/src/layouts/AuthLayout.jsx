import { Link, Outlet } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { APP_NAME } from '../constants';

const points = [
  'Browse trips from shoppers in your area',
  'Send your item list and set your own budget',
  'Easy payment via JazzCash or Easypaisa',
];

const AuthLayout = () => {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden bg-primary-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="relative z-10 flex w-fit items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <ShoppingCart className="size-5" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">{APP_NAME}</span>
        </Link>

        {/* Quiet map motif — static, echoes the animated route on the home page */}
        <svg
          aria-hidden="true"
          viewBox="0 0 400 300"
          className="pointer-events-none absolute -bottom-6 -right-10 w-[130%] max-w-none opacity-60"
          fill="none"
        >
          <path
            d="M20 260 C 110 260 110 170 190 160 S 300 90 380 40"
            stroke="rgb(255 255 255 / 0.16)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="2 10"
          />
          <circle cx="20" cy="260" r="7" fill="rgb(255 255 255 / 0.5)" />
          <circle cx="380" cy="40" r="9" fill="#f7b32b" />
        </svg>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold leading-[1.1] xl:text-5xl">
            Is your neighbour heading to the market?
          </h2>
          <p className="mt-4 text-lg text-primary-100/85">
            Pakistan's first peer-to-peer grocery platform
          </p>
          <ul className="mt-8 space-y-3.5">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-primary-50">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-400 text-primary-950">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-primary-200/70">© 2026 {APP_NAME}</p>
      </aside>

      {/* Form side */}
      <main className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-10 flex w-fit items-center gap-2.5 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-900">
              <ShoppingCart className="size-5 text-white" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-gray-900">
              {APP_NAME}
            </span>
          </Link>

          <div className="animate-rise">
            <Outlet />
          </div>

          <p className="mt-10 text-center text-sm text-gray-400 lg:hidden">
            © 2026 {APP_NAME}
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
