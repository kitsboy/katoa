import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { STORAGE_KEYS } from '../../lib/storage';

const auth = {
  user: { id: 'user-1' } as { id: string } | null,
  profile: { username: 'cam', lightning_address: null as string | null },
  isDemoUser: false,
};

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => auth,
}));

vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: () => false,
  supabase: { from: vi.fn() },
}));

import { OnboardingChecklist } from '../OnboardingChecklist';

function wrap() {
  return render(
    <LanguageProvider>
      <MemoryRouter>
        <OnboardingChecklist variant="dark" />
      </MemoryRouter>
    </LanguageProvider>
  );
}

describe('OnboardingChecklist', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEYS.onboardingChecklist);
    auth.user = { id: 'user-1' };
    auth.profile = { username: 'cam', lightning_address: null };
    auth.isDemoUser = false;
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'share');
  });

  it('points first sat at settings and share at the public profile, not explore', () => {
    wrap();
    const firstSatRow = screen.getByText(/first sat/i).closest('li');
    expect(firstSatRow?.querySelector('a')).toHaveAttribute('href', '/settings');
    const hrefs = screen.getAllByRole('link').map((el) => el.getAttribute('href'));
    expect(hrefs).not.toContain('/explore');
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('completes share when the share control is clicked without native share', () => {
    wrap();
    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    expect(screen.queryByRole('button', { name: /share/i })).not.toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.onboardingChecklist) || '{}') as Record<
      string,
      boolean
    >;
    expect(stored.share).toBe(true);
  });

  it('completes share when navigator.share succeeds', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { configurable: true, writable: true, value: share });

    wrap();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
    });
    expect(share).toHaveBeenCalled();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.onboardingChecklist) || '{}') as Record<
      string,
      boolean
    >;
    expect(stored.share).toBe(true);
  });

  it('does not complete share when the user cancels navigator.share', async () => {
    const abort = Object.assign(new Error('cancelled'), { name: 'AbortError' });
    const share = vi.fn().mockRejectedValue(abort);
    Object.defineProperty(navigator, 'share', { configurable: true, writable: true, value: share });

    wrap();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
    });
    expect(share).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.onboardingChecklist) || '{}') as Record<
      string,
      boolean
    >;
    expect(stored.share).not.toBe(true);
  });
});
