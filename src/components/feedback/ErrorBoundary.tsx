import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches unhandled rendering errors and shows a recovery UI.
 * Keeps the rest of the application functional.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
          <p className="mt-1 max-w-md text-sm text-gray-500">
            An unexpected error occurred. Try refreshing the page or clicking the button below.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-4 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

