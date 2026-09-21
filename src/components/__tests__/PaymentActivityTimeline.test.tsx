import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaymentActivityTimeline } from '../PaymentActivityTimeline';

describe('PaymentActivityTimeline', () => {
  it('shows pending confirmation without claiming receipt', () => {
    render(<PaymentActivityTimeline status="pending" />);
    const timeline = screen.getByTestId('payment-activity-timeline');
    expect(timeline).toHaveAttribute('data-activity-status', 'pending');
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Settled')).toBeInTheDocument();
  });

  it('shows on-chain confirmation progress', () => {
    render(<PaymentActivityTimeline status="confirming" rail="onchain" environment="staged" />);
    expect(screen.getByText('Confirming')).toBeInTheDocument();
    expect(screen.getByText(/0 → 1 → 2 → 6\+/)).toBeInTheDocument();
  });

  it('shows an expired request as closed and retryable', () => {
    render(<PaymentActivityTimeline status="expired" />);
    expect(screen.getByText('Payment expired')).toBeInTheDocument();
    expect(screen.getByText(/Generate a new request if needed/)).toBeInTheDocument();
  });
});
