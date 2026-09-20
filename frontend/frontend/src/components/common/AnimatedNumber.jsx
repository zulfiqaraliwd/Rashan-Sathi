import useCountUp from '../../hooks/useCountUp';

const defaultFormat = (n) => Math.round(n).toLocaleString('en-PK');

/** Counts up to `value` once. Pass `format` for currency etc. */
const AnimatedNumber = ({ value, format = defaultFormat, className = '' }) => {
  const current = useCountUp(value);
  return <span className={`tabular-nums ${className}`}>{format(current)}</span>;
};

export default AnimatedNumber;
