import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { AppRouter } from './router';

export function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}

