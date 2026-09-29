import React, { ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const message = this.props.fallbackMessage || this.state.error?.message || "Erro desconhecido";
      return (
        <div className="flex items-center justify-center p-6 h-full w-full">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-200/80 dark:border-slate-800 p-8 max-w-md w-full flex flex-col items-center text-center">
            <svg
              className="w-12 h-12 text-rose-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ops — algo deu errado</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>
            <div className="flex gap-3 w-full justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition font-semibold text-sm shadow-xs"
              >
                Tentar Novamente
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white transition font-semibold text-sm shadow-xs"
              >
                Recarregar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
