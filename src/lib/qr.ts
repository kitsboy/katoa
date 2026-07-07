/** Client-side QR via Google Charts API (no extra npm dependency). */
export function getQrImageUrl(data: string, size = 300): string {
  const encoded = encodeURIComponent(data);
  return `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encoded}&choe=UTF-8&chld=H|1`;
}

export function bitcoinQrData(address: string, amountSats?: number): string {
  if (amountSats != null && amountSats > 0) {
    const btc = amountSats / 100_000_000;
    return `bitcoin:${address}?amount=${btc}`;
  }
  return `bitcoin:${address}`;
}

export function lightningQrData(invoice: string): string {
  return invoice.startsWith('lightning:') ? invoice : `lightning:${invoice}`;
}