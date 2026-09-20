const Ring = ({ className }) => (
  <span
    role="status"
    aria-label="Loading"
    className={`block animate-spin rounded-full border-primary-100 border-t-primary-600 ${className}`}
  />
);

/** `fullScreen` now fills the page area (below the navbar) instead of
 *  covering the whole viewport with a white overlay. */
const Loader = ({ fullScreen = false, text = 'Loading...' }) => (
  <div
    className={`flex animate-fade items-center justify-center ${
      fullScreen ? 'min-h-[60vh]' : 'py-16'
    }`}
  >
    <div className="flex flex-col items-center gap-4 text-center">
      <Ring className={fullScreen ? 'size-11 border-[3px]' : 'size-8 border-[3px]'} />
      <p className="text-sm font-medium text-gray-500">{text}</p>
    </div>
  </div>
);

export default Loader;
