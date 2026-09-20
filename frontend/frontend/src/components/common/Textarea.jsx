import { AlertCircle } from 'lucide-react';
import { fieldBase, fieldOk, fieldError, labelClass } from './fieldStyles';

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
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
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      aria-invalid={error ? true : undefined}
      className={`${fieldBase} ${error ? fieldError : fieldOk} resize-none leading-relaxed`}
      {...props}
    />
    {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    {error && (
      <p className="mt-1.5 flex animate-fade items-center gap-1.5 text-sm text-red-600">
        <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
        {error}
      </p>
    )}
  </div>
);

export default Textarea;
