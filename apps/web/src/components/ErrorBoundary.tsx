import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 * Prevents the entire app from crashing due to component errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-lg border border-red-500/30"
        >
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-xl font-bold text-white mb-2">
            Oops! Something short-circuited
          </h2>
          <p className="text-gray-400 text-center mb-4 max-w-md">
            Don't worry, your circuit is safe. We just hit a small bump.
          </p>
          {this.state.error && (
            <details className="mb-4 text-sm text-gray-500 max-w-md">
              <summary className="cursor-pointer hover:text-gray-400">
                Technical details
              </summary>
              <pre className="mt-2 p-2 bg-gray-800 rounded text-xs overflow-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Canvas-specific error boundary with circuit-themed fallback
 */
export function CanvasErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center h-full bg-gray-900/50">
          <div className="text-8xl mb-4 animate-pulse">⚡</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Canvas Error
          </h2>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            The circuit canvas encountered an issue. Try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Refresh Page
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Panel error boundary with minimal fallback
 */
export function PanelErrorBoundary({
  children,
  panelName
}: {
  children: ReactNode;
  panelName: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="text-4xl mb-2">🔧</div>
          <p className="text-sm text-gray-400">
            {panelName} panel needs a quick fix
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Refresh
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
