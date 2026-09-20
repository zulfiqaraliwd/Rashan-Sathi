const EmptyState = ({ icon: Icon, title, description, action, className = '' }) => (
  <div
    className={`animate-rise rounded-3xl border border-dashed border-gray-300 bg-white/70 px-6 py-16 text-center ${className}`}
  >
    {Icon && (
      <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
        <Icon className="size-8" aria-hidden="true" />
      </span>
    )}
    <h3 className="mt-5 text-xl font-bold text-gray-900">{title}</h3>
    {description && (
      <p className="mx-auto mt-2 max-w-sm text-gray-600">{description}</p>
    )}
    {action && <div className="mt-6 flex justify-center gap-3">{action}</div>}
  </div>
);

export default EmptyState;
