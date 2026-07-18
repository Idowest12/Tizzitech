import React, { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AppRescueBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log exception to console for development
    console.warn("AppRescueBoundary caught an unhandled client exception:", error, errorInfo);

    // Send consistent log to backend api to ensure high observability
    fetch('/api/logs/client-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: error.message || String(error),
        stack: error.stack || '',
        componentStack: errorInfo.componentStack || '',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    }).catch(err => {
      console.warn("Could not ship client-side exception to backend server logging:", err);
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d0d0d] text-gray-200 flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-[#141414] border border-red-900/40 rounded-xl p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-red-950/40 rounded-lg text-red-500 border border-red-500/20">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white tracking-tight">Application Exception Detected</h1>
                <p className="text-sm text-gray-400">A critical client-side exception occurred.</p>
              </div>
            </div>

            <div className="bg-[#0a0a0a] rounded-lg p-5 border border-gray-800/60 mb-6 text-sm">
              <span className="text-red-400 font-medium">Exception Summary:</span>
              <p className="mt-1 text-gray-300 font-mono break-words leading-relaxed">
                {this.state.error?.message || "An unexpected rendering exception was thrown by the application framework."}
              </p>
              <p className="mt-3 text-xs text-gray-500 italic">
                Note: Technical details have been securely logged to our servers for diagnostics. No sensitive credentials or secrets have been leaked.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                id="err-boundary-reload-btn"
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md shadow-red-900/10 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Application
              </button>
              
              <button
                onClick={this.handleGoHome}
                id="err-boundary-home-btn"
                className="flex-1 flex items-center justify-center gap-2 bg-[#1c1c1c] hover:bg-[#262626] border border-gray-800 text-gray-300 hover:text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 active:scale-95"
              >
                <Home className="w-4 h-4" />
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppRescueBoundary;
