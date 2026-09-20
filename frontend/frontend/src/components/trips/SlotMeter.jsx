/** Segmented bar showing how many request slots of a trip are taken. */
const SlotMeter = ({ used = 0, total = 0, showLabel = true }) => {
  if (!total) return null;
  const segments = Math.min(total, 10);

  return (
    <div
      className="flex items-center gap-2.5"
      role="img"
      aria-label={`${used} of ${total} slots taken`}
    >
      <div className="flex flex-1 gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < used ? 'bg-primary-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs font-medium tabular-nums text-gray-500">
          {used}/{total}
        </span>
      )}
    </div>
  );
};

export default SlotMeter;
