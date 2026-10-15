import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, ChevronDown, ChevronUp, Bug, ShieldAlert } from 'lucide-react';

/**
 * Props for ErrorBoundary component.
 */
export interface ErrorBoundaryProps {
  /** Subtree to monitor and render */
  children: ReactNode;
  /** Optional custom fallback element or render prop */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Optional telemetry / logging callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Optional callback fired when the user triggers a boundary reset */
  onReset?: () => void;
  /** Component identifier for debugging and telemetry attribution */
  boundaryName?: string;
  /** Active language for localized error UI */
  language?: 'en' | 'ta';
}

/**
 * State tracked by the ErrorBoundary.
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * Production-Grade React Error Boundary
 *
 * Implements React error-handling lifecycle methods (getDerivedStateFromError and componentDidCatch)
 * to catch unhandled JavaScript rendering, lifecycle, and constructor errors within child components.
 * Prevents full-application white-screens, presents a localized, accessible fallback UI, and exposes
 * diagnostic telemetry hooks for monitoring.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  /**
   * Invoked after an error has been thrown by a descendant component.
   * Updates state to render the fallback UI during the next render cycle.
   */
  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Invoked after an error has been caught.
   * Performs side effects such as reporting error metrics to monitoring services or the console.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // 1. Structured console warning with boundary attribution
    console.error(
      `[ErrorBoundary:${this.props.boundaryName || 'Root'}] Caught unhandled React error:`,
      error,
      errorInfo
    );

    // 2. Delegate to external telemetry handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (loggingErr) {
        console.error('[ErrorBoundary] Telemetry callback failed:', loggingErr);
      }
    }
  }

  /**
   * Resets the error boundary state, re-attempting descendant rendering.
   */
  public handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  /**
   * Toggles the technical diagnostics accordion.
   */
  private toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render(): ReactNode {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { children, fallback, language = 'en', boundaryName } = this.props;

    if (!hasError) {
      return children;
    }

    // Support custom fallback function or custom JSX node
    if (typeof fallback === 'function' && error) {
      return fallback(error, this.handleReset);
    }
    if (fallback && typeof fallback !== 'function') {
      return fallback;
    }

    const isTamil = language === 'ta';

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl my-4 text-slate-800 shadow-sm"
      >
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 text-red-700 rounded-xl flex-shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800 uppercase tracking-wide">
                  {boundaryName ? `${boundaryName} Error` : 'System Exception'}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {isTamil
                  ? 'பயன்பாட்டில் எதிர்பாராத பிழை ஏற்பட்டது'
                  : 'An Unexpected Application Error Occurred'}
              </h2>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                {isTamil
                  ? 'விண்ணப்பத் திரையை ஏற்றுவதில் தற்காலிகத் தவறு ஏற்பட்டுள்ளது. கீழே உள்ள பட்டனைப் பயன்படுத்தி மீண்டும் முயற்சிக்கலாம்.'
                  : 'We encountered an unexpected issue while rendering this section. Your pre-submission draft data has been preserved in local storage.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <RotateCcw className="w-4 h-4" />
              {isTamil ? 'மீண்டும் முயற்சிக்கவும்' : 'Retry Operation'}
            </button>

            <button
              type="button"
              onClick={() => {
                this.handleReset();
                window.location.href = '/';
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <Home className="w-4 h-4" />
              {isTamil ? 'முகப்புக்குச் செல்' : 'Return Home'}
            </button>

            <button
              type="button"
              onClick={this.toggleDetails}
              className="inline-flex items-center gap-1.5 ml-auto text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Bug className="w-3.5 h-3.5" />
              <span>{showDetails ? (isTamil ? 'தொழில்நுட்ப விவரங்களை மறை' : 'Hide Diagnostics') : (isTamil ? 'தொழில்நுட்ப விவரங்களைக் காட்டு' : 'View Diagnostics')}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Technical Diagnostics Accordion */}
          {showDetails && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Technical Error Diagnostics (Reviewer / Developer Info)
              </h4>
              <div className="bg-slate-900 text-slate-100 rounded-lg p-3.5 text-xs font-mono overflow-x-auto max-h-56 leading-relaxed">
                <div className="text-red-400 font-semibold mb-1">
                  {error?.name}: {error?.message}
                </div>
                {error?.stack && (
                  <pre className="text-slate-400 whitespace-pre-wrap text-[11px] mb-2 border-b border-slate-800 pb-2">
                    {error.stack}
                  </pre>
                )}
                {errorInfo?.componentStack && (
                  <div>
                    <div className="text-amber-400 font-semibold mb-0.5">Component Stack:</div>
                    <pre className="text-slate-400 whitespace-pre-wrap text-[11px]">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
