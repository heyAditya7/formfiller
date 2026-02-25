/**
 * Global Error Boundary - White screen rokne ke liye
 * client/src/app/components/GlobalErrorBoundary.tsx
 *
 * Agar kisi component mein typo ya error aaye toh poora app crash nahi hoga,
 * sirf yeh chota message dikhega. Bache hue UI bhi kaam karte rahenge.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Optional custom fallback component */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[GlobalErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6"
          role="alert"
        >
          <div className="max-w-md w-full bg-white/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <p className="text-red-400 font-semibold mb-2">
              Something went wrong
            </p>
            <p className="text-gray-400 text-sm mb-4">
              {this.state.error.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
