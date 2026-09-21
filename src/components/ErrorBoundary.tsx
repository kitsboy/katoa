import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string | null;
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