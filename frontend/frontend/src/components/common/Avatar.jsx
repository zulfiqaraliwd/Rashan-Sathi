const sizes = {
  xs: 'size-6 text-[0.65rem]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-2xl',
};

const Avatar = ({ name, src, size = 'md', className = '' }) => {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || '?';
  const shared = `${sizes[size] ?? sizes.md} shrink-0 rounded-full ring-2 ring-white ${className}`;

  if (src) {
    return <img src={src} alt={name || ''} className={`${shared} object-cover`} />;
  }

  return (
    <span
      aria-hidden="true"
      className={`${shared} inline-flex items-center justify-center bg-primary-100 font-display font-semibold text-primary-800`}
    >
      {initial}
    </span>
  );
};

export default Avatar;
