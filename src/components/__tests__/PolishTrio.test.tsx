import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ContentCanvas } from '../ContentCanvas';
import { CreatorImpactDashboard } from '../CreatorImpactDashboard';
import { CinematicCheckout } from '../CinematicCheckout';

const cards = [
  { id: 'one', title: 'Story', description: 'The beginning', visibility: 'public' },
  { id: 'two', title: 'Goal', description: 'The impact', visibility: 'public' },
];

describe('polish trio', () => {
  it('switches canvas preview and exposes card editing', () => {
    const onMoveCard = vi.fn();
    render(<ContentCanvas cards={cards} onCardChange={vi.fn()} onMoveCard={onMoveCard} />);
    fireEvent.click(screen.getByRole('button', { name: 'Phone' }));
    expect(screen.getByTestId('content-preview-phone')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Move card down' })[0]);
    expect(onMoveCard).toHaveBeenCalledWith('one', 'down');
  });

  it('shows impact metrics and proof link', () => {
    render(<CreatorImpactDashboard goals={[{ id: 'goal', title: 'New ramp', raised: 50, goal: 100, detail: 'Build it' }]} updates={[{ id: 'update', title: 'Milestone', detail: 'Started', date: 'Today' }]} satsRaised={50} supporterCount={3} demo />);
    expect(screen.getByTestId('creator-impact-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('creator-impact-dashboard').textContent).toContain('50%');
    expect(screen.getByRole('link', { name: /proof verifier/i })).toHaveAttribute('href', '/verify');
  });

  it('labels the focused checkout and keeps demo state visible', () => {
    render(<CinematicCheckout amountSats={21000} recipient="creator" isDemo onBack={vi.fn()}><p>Payment body</p></CinematicCheckout>);
    expect(screen.getByTestId('cinematic-checkout')).toBeInTheDocument();
    expect(screen.getByText('Focused checkout')).toBeInTheDocument();
    expect(screen.getByText('21,000 sats')).toBeInTheDocument();
    expect(screen.getByText('Demo')).toBeInTheDocument();
  });
});
