import type { ReactNode } from 'react';
import { ProgressBar } from './ProgressBar';
import { RESTAURANT_NAME, RESTAURANT_TAGLINE } from '../../config/brand';

interface WizardShellProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  showProgress: boolean;
  onBack?: () => void;
  children: ReactNode;
}

export function WizardShell({
  currentStep,
  totalSteps,
  stepLabels,
  showProgress,
  onBack,
  children,
}: WizardShellProps) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="bg-secondary text-white py-4 px-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl tracking-wide">{RESTAURANT_NAME}</h1>
          <p className="text-xs text-white/60 tracking-widest uppercase">{RESTAURANT_TAGLINE}</p>
        </div>
        <span className="text-accent font-heading text-sm tracking-wider uppercase">
          Private Events & Catering
        </span>
      </header>

      {/* Progress */}
      {showProgress && (
        <div className="bg-white border-b border-border">
          <div className="max-w-2xl mx-auto">
            <ProgressBar
              currentStep={currentStep}
              totalSteps={totalSteps}
              labels={stepLabels}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {onBack && currentStep > 0 && (
            <button
              onClick={onBack}
              className="mb-4 text-sm text-muted hover:text-primary transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-white/40 text-center text-xs py-4">
        {RESTAURANT_NAME} &middot; Private Events & Catering Inquiries
      </footer>
    </div>
  );
}
