import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaymentActivityTimeline } from '../PaymentActivityTimeline';

describe('PaymentActivityTimeline', () => {
  it('shows pending confirmation without claiming receipt', () => {
    render(<PaymentActivityTimeline status="pending" />);
    const timeline = screen.getByTestId('payment-activity-timeline');
    expect(timeline).toHaveAttribute('data-activity-status', 'pending');
    expect(screen.getByText('Waiting for payment confirmation')).toBeInTheDocument();
    expect(screen.getByText('Creator received')).toBeInTheDocument();
  });

  it('shows an expired request as closed and retryable', () => {
    render(<PaymentActivityTimeline status="expired" />);
    expect(screen.getByText('Payment request expired')).toBeInTheDocument();
    expect(screen.getByText('Generate a new request if you still want to pay.')).toBeInTheDocument();
  });
});
