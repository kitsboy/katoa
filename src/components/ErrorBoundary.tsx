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

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4" role="alert">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-white mb-2">{t('errorBoundary.title')}</h2>
        <p className="text-gray-400 mb-6">{t('errorBoundary.message')}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="secondary" onClick={onRetry}>
            {t('errorBoundary.tryAgain')}
          </Button>
          <Button variant="primary" onClick={() => window.location.assign('/')}>
            {t('errorBoundary.goHome')}
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
      return <ErrorFallback onRetry={() => this.setState({ hasError: false, errorId: null })} />;
    }
    return this.props.children;
  }
}