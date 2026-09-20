/** Tiny className joiner: cn('a', cond && 'b') → 'a b' */
export const cn = (...classes) => classes.filter(Boolean).join(' ');
export default cn;
