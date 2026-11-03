import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-bold text-gray-200">404</p>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Page not found</h1>
      <p className="mt-1 text-sm text-gray-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
      >
        Go to home
      </Link>
    </div>
  );
}

