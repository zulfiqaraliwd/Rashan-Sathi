import { AlertCircle } from 'lucide-react';
import { fieldBase, fieldOk, fieldError, labelClass } from './fieldStyles';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  hint,
  icon: Icon,
  iconPosition = 'left',
  rightElement,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const leftIcon = Icon && iconPosition === 'left';
  const rightIcon = Icon && iconPosition === 'right';

  const padding = [
    leftIcon ? 'pl-11' : '',
    rightIcon || rightElement ? 'pr-12' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className={labelClass}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-[1.15rem] -translate-y-1/2 text-gray-400"
          />
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          className={`${fieldBase} ${error ? fieldError : fieldOk} ${padding}`}
          {...props}
        />

        {rightIcon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 size-[1.15rem] -translate-y-1/2 text-gray-400"
          />
        )}

        {rightElement && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
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
};

export default Input;
