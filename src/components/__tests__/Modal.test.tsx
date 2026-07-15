import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal } from '../Modal';
import { LanguageProvider } from '../../contexts/LanguageContext';

function wrap(ui: React.ReactNode) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('Modal', () => {
  it('renders title and close button when open', () => {
    wrap(
      <Modal isOpen onClose={vi.fn()} title="Test Dialog">
        <p>Body</p>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/close dialog/i)).toBeInTheDocument();
  });

  it('returns null when closed', () => {
    const { container } = wrap(
      <Modal isOpen={false} onClose={vi.fn()} title="Hidden">
        <p>Body</p>
      </Modal>
    );
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });
});