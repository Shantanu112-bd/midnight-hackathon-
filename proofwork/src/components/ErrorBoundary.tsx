import React, { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: '' };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-navy flex items-center justify-center text-white font-sans">
          <div className="glass rounded-[2rem] p-12 max-w-md text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-white/50 text-sm mb-8">{this.state.error}</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-blueAccent text-navy font-bold px-8 py-3 rounded-full hover:bg-blueAccent/90 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
