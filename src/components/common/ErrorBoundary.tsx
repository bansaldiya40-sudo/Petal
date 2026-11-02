import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Sprout, RotateCcw, AlertCircle, ChevronDown } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
  compact?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Petal ErrorBoundary Caught]', error, error?.stack, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      const { fallbackTitle = 'This page tripped over a root. Try again', compact } = this.props;

      return (
        <div
          className={`w-full rounded-[28px] bg-[#FFFBF4] border-2 border-[#EADBBF] shadow-storybook p-6 sm:p-8 text-center my-4 space-y-4 animate-fadeIn ${
            compact ? 'max-w-xl mx-auto' : 'max-w-3xl mx-auto'
          }`}
        >
          {/* Friendly Enchanted Garden Icon */}
          <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF0F3] border-2 border-[#FBD38D] flex items-center justify-center text-[#DD6B20] shadow-sm">
            <Sprout className="w-8 h-8 text-[#855627] animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-[22px] sm:text-[26px] font-display font-bold text-[#4A3566]">
              {fallbackTitle}
            </h3>
            <p className="text-[17px] font-body text-[#6C538C] max-w-lg mx-auto leading-relaxed">
              A flower stem got tangled in the code while blooming this view. Don't worry, your course notes are safe in the garden.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleRetry}
              className="btn-storybook min-h-[48px] px-6 bg-gradient-to-r from-[#DBF5E7] to-[#E7DCFF] hover:from-[#C6F6D5] hover:to-[#D9C8FF] border-2 border-[#83D9A7] text-[#1F8C4F] text-[16px] font-bold shadow-sm hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#1F8C4F]" />
              <span>Replant & Retry</span>
            </button>
          </div>

          {/* Collapsible Technical Details */}
          {this.state.error && (
            <details className="mt-4 text-left max-w-xl mx-auto bg-white/80 rounded-2xl border border-[#EADBBF] p-3 text-xs font-mono text-[#855627]">
              <summary className="font-display font-bold text-[#4A3566] cursor-pointer flex items-center gap-1.5 select-none py-1">
                <AlertCircle className="w-3.5 h-3.5 text-[#DD6B20]" />
                <span>Technical details</span>
                <ChevronDown className="w-3.5 h-3.5 ml-auto opacity-70" />
              </summary>
              <div className="mt-2 pt-2 border-t border-[#EADBBF]/60 overflow-x-auto whitespace-pre-wrap leading-relaxed text-[#C53030]">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack && (
                  <div className="mt-2 text-[#718096] text-[11px]">
                    {this.state.errorInfo.componentStack}
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
