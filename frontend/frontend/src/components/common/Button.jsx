import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const base =
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold select-none transition duration-200 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100';

const variants = {
  primary:
    'bg-primary-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_8px_16px_-8px_rgb(20_102_64/0.7)] hover:bg-primary-700 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_12px_22px_-8px_rgb(20_102_64/0.8)]',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  outline:
    'border border-primary-300 bg-white text-primary-800 hover:border-primary-500 hover:bg-primary-50',
  danger:
    'bg-red-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.15),0_8px_16px_-8px_rgb(185_28_28/0.6)] hover:bg-red-700',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  light: 'bg-white text-primary-900 hover:bg-primary-50',
  accent:
    'bg-accent-400 text-primary-950 shadow-[0_10px_24px_-10px_rgb(247_179_43/0.75)] hover:bg-accent-300',
  glass: 'border border-white/20 bg-white/10 text-white hover:bg-white/20',
};

const sizes = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-2.5 text-[0.95rem]',
  lg: 'px-7 py-3.5 text-base',
};

/**
 * Pass `to` to render a router link that looks like a button
 * (avoids nesting <button> inside <a>).
 */
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  to,
  ...props
}) => {
  const classes = [
    base,
    variants[variant] ?? variants.primary,
    sizes[size] ?? sizes.md,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
};

export default Button;
