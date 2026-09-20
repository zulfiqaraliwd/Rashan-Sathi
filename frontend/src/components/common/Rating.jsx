import { Star } from 'lucide-react';
import { useState } from 'react';

const sizes = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
};

const Rating = ({ value = 0, onChange, size = 'md', readonly = false }) => {
  const [hover, setHover] = useState(0);
  const displayValue = hover || value;

  return (
    <div className="flex items-center gap-1" role={readonly ? 'img' : 'group'} aria-label={`Rating: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          aria-label={`${star} star`}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`rounded transition-transform ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
        >
          <Star
            className={`${sizes[size]} transition-colors ${
              star <= displayValue
                ? 'fill-accent-400 text-accent-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default Rating;
