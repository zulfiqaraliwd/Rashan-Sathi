import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/** Consistent page title block. `back` shows a "Back" link above the title. */
const PageHeader = ({ title, subtitle, actions, back = false }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8 animate-rise">
      {back && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="-ml-2 mb-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </button>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-gray-600">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
