import { useEffect, useState } from 'react';
import usePrefersReducedMotion from './usePrefersReducedMotion';

/** Eases a number from 0 to `target`. Returns the target instantly if the
 *  user prefers reduced motion. */
const useCountUp = (target, duration = 900) => {
  const reduce = usePrefersReducedMotion();
  const end = Number(target) || 0;
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (reduce) return undefined;
    let frame;
    const startedAt = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      setValue(end * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [end, duration, reduce]);

  return reduce ? end : value;
};

export default useCountUp;
