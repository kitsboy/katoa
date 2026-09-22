import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { DemoExperience } from '../DemoExperience';
import { LanguageProvider } from '../../contexts/LanguageContext';

function renderDemo() {
  return render(
    <LanguageProvider>
      <MemoryRouter>
        <DemoExperience />
      </MemoryRouter>
    </LanguageProvider>
  );
}

describe('DemoExperience', () => {
  it('shows three clear paths and the first story chapter', () => {
    renderDemo();

    expect(screen.getByRole('heading', { name: /see the whole idea in three calm steps/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /i want to support/i })).toHaveAttribute('href', '/explore');
    expect(screen.getByRole('link', { name: /i want to create/i })).toHaveAttribute('href', '/auth?next=%2Fdashboard');
    expect(screen.getByText('Start with a story, not a blank grid.')).toBeInTheDocument();
    expect(screen.getByText('Clear context')).toBeInTheDocument();
  });

  it('switches chapters and reveals details without leaving the page', () => {
    renderDemo();

    fireEvent.click(screen.getByRole('tab', { name: /02 choose/i }));
    expect(screen.getByText('Turn a big goal into visible steps.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /what the user gets/i }));
    expect(screen.getByText(/progress bars, item detail, media, and updates/i)).toBeInTheDocument();
  });
});
