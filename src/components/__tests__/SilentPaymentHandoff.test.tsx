import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ToastProvider } from '../Toast';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { SilentPaymentHandoff } from '../SilentPaymentHandoff';
import { SILENT_PAYMENT_SEND_WALLETS } from '../../lib/silentPayments';

/** Shape-valid BIP352 address (the app validates shape, not the checksum). */
const SP_ADDRESS = `sp1${'q'.repeat(100)}`;

function renderHandoff(amountSats: number | null = null) {
  return render(
    <LanguageProvider>
      <ToastProvider>
        <SilentPaymentHandoff
          address={SP_ADDRESS}
          creatorUsername="luna_vip"
          amountSats={amountSats}
        />
      </ToastProvider>
    </LanguageProvider>
  );
}

describe('SilentPaymentHandoff', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('hands over the address, a QR and the wallet requirement', () => {
    renderHandoff();

    expect(screen.getByTestId('silent-payment-handoff')).toBeInTheDocument();
    expect(screen.getByText(SP_ADDRESS)).toBeInTheDocument();

    const qr = screen.getByRole('img', { name: /silent payment address qr for @luna_vip/i });
    expect(qr.getAttribute('src')).toContain(encodeURIComponent(SP_ADDRESS));

    for (const wallet of SILENT_PAYMENT_SEND_WALLETS) {
      expect(screen.getByTestId('silent-payment-handoff').textContent).toContain(wallet);
    }
    expect(screen.getByRole('link', { name: /wallet support list/i })).toHaveAttribute(
      'href',
      'https://silentpayments.xyz/'
    );
  });

  it('says plainly that nothing confirms this rail and the total will not move', () => {
    renderHandoff();
    const text = screen.getByTestId('silent-payment-handoff').textContent ?? '';

    expect(text).toContain('Katoa cannot create an invoice for this rail');
    expect(text).toContain('No invoice, payment hash, zap receipt or webhook exists on this rail');
    expect(text).toContain('This page will not move the total');
    expect(text).toContain('send a small test amount first');
  });

  it('asks the supporter to set the amount in their wallet', () => {
    renderHandoff(21000);
    expect(screen.getByTestId('silent-payment-handoff').textContent).toContain(
      '21,000 sats is what this wishlist page would have asked for'
    );
    expect(screen.getByTestId('silent-payment-handoff').textContent).toContain(
      'no amount can be encoded here'
    );
  });

  it('copies the bare address and confirms it', async () => {
    renderHandoff();
    const button = screen.getByRole('button', { name: /copy address/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(SP_ADDRESS);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
    });
  });
});
