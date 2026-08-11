import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string | null;
}

function ErrorFallback({ onRetry, errorId }: { onRetry: () => void; errorId: string | null }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-12" role="alert">
      <div className="text-center max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-2">{t('errorBoundary.title')}</h2>
        <p className="text-gray-400 mb-4 leading-relaxed">{t('errorBoundary.message')}</p>
        {errorId && (
          <p className="text-[11px] font-mono text-gray-600 mb-6">Ref: {errorId}</p>
        )}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3">
          <Button variant="secondary" onClick={onRetry} className="min-h-[48px] w-full sm:w-auto">
            {t('errorBoundary.tryAgain')}
          </Button>
          <Button variant="primary" onClick={() => window.location.assign('/')} className="min-h-[48px] w-full sm:w-auto">
            {t('errorBoundary.goHome')}
          </Button>
          <Button variant="outline" onClick={() => window.location.assign('/faq')} className="min-h-[48px] w-full sm:w-auto">
            FAQ
          </Button>
        </div>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorId: null };

  static getDerivedStateFromError() {
    return { hasError: true, errorId: `err-${Date.now().toString(36)}` };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack, this.state.errorId);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          errorId={this.state.errorId}
          onRetry={() => this.setState({ hasError: false, errorId: null })}
        />
      );
    }
    return this.props.children;
  }
}