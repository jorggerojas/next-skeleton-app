"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const isDev = process.env.NODE_ENV === "development";

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (isDev) {
        return (
          <div className="min-h-screen bg-red-50 p-8">
            <div className="mx-auto max-w-4xl">
              <div className="rounded-lg border border-red-200 bg-white p-6 shadow-lg">
                <h1 className="mb-4 text-2xl font-bold text-red-600">
                  Error in Development Mode
                </h1>

                <div className="mb-4">
                  <h2 className="mb-2 text-lg font-semibold text-gray-800">
                    Error Message
                  </h2>
                  <pre className="overflow-auto rounded bg-red-100 p-4 text-sm text-red-800">
                    {this.state.error?.message}
                  </pre>
                </div>

                {this.state.error?.name && (
                  <div className="mb-4">
                    <h2 className="mb-2 text-lg font-semibold text-gray-800">
                      Error Name
                    </h2>
                    <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm text-gray-800">
                      {this.state.error.name}
                    </pre>
                  </div>
                )}

                {this.state.error?.stack && (
                  <div className="mb-4">
                    <h2 className="mb-2 text-lg font-semibold text-gray-800">
                      Stack Trace
                    </h2>
                    <pre className="max-h-64 overflow-auto rounded bg-gray-100 p-4 text-xs text-gray-700">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}

                {this.state.errorInfo?.componentStack && (
                  <div className="mb-4">
                    <h2 className="mb-2 text-lg font-semibold text-gray-800">
                      Component Stack
                    </h2>
                    <pre className="max-h-64 overflow-auto rounded bg-gray-100 p-4 text-xs text-gray-700">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={this.handleReset}
                    className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={this.handleReload}
                    className="rounded bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Production error UI
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-800">
              Something went wrong
            </h1>
            <p className="mb-6 text-gray-600">
              We apologize for the inconvenience. Please try again.
            </p>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={this.handleReset}
                className="rounded bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="rounded bg-gray-200 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-300"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
