import { AlertCircle, ChevronDown } from 'lucide-react';
import { fieldBase, fieldOk, fieldError, labelClass } from './fieldStyles';

const Select = ({
  label,
  name,
  value,
  onChange,
  children,
  icon: Icon,
  error,
  hint,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => (
  <div className={className}>
    {label && (
      <label htmlFor={name} className={labelClass}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
    )}

    <div className="relative">
      {Icon && (
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 size-[1.15rem] -translate-y-1/2 text-primary-600"
        />
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        className={`${fieldBase} ${error ? fieldError : fieldOk} appearance-none pr-10 ${
          Icon ? 'pl-11' : ''
        }`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400"
      />
    </div>

    {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    {error && (
      <p className="mt-1.5 flex animate-fade items-center gap-1.5 text-sm text-red-600">
        <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
        {error}
      </p>
    )}
  </div>
);

export default Select;
