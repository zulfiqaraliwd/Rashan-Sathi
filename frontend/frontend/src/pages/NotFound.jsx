import { Compass } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="animate-rise text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          <Compass className="size-8" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-8xl font-bold text-primary-900">404</h1>
        <p className="mt-3 text-xl text-gray-600">Page not found</p>
        <Button to="/" size="lg" className="mt-8">
          Go home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
