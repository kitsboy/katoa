import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Download, Copy, Check, X } from 'lucide-react';
import { bitcoinQrData, getQrImageUrl } from '../lib/qr';
import { copyToClipboard } from '../lib/clipboard';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  amount?: number;
  title?: string;
}

export function QRCodeModal({ isOpen, onClose, address, amount, title }: QRCodeModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && address) {
      const qrData = bitcoinQrData(address, amount);
      setQrCodeUrl(getQrImageUrl(qrData, 300));
    }
  }, [isOpen, address, amount]);

  const copyAddress = async () => {
    const ok = await copyToClipboard(address);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `bitcoin-qr-${address.substring(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Scan to Donate'}
    >
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg flex items-center justify-center">
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="Bitcoin QR Code"
              className="w-64 h-64"
            />
          ) : (
            <div className="w-64 h-64 bg-gray-200 animate-pulse rounded-lg" />
          )}
        </div>

        {amount && (
          <div className="text-center">
            <p className="text-sm text-gray-400">Amount</p>
            <p className="text-2xl font-bold text-white">
              {(amount / 100000000).toFixed(8)} BTC
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {amount.toLocaleString()} sats
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-400 mb-2">Bitcoin Address</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={address}
                readOnly
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono focus:ring-2 focus:ring-neon-cyan-500/50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyAddress}
                className="flex-shrink-0"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={downloadQRCode} className="gap-2">
              <Download size={16} />
              Download QR
            </Button>
            <Button onClick={onClose} className="gap-2">
              <X size={16} />
              Close
            </Button>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-400">
            💡 <strong>Tip:</strong> Scan this QR code with any Bitcoin wallet to send funds instantly.
            For Lightning Network payments, use a Lightning-compatible wallet for near-instant, low-fee transactions.
          </p>
        </div>
      </div>
    </Modal>
  );
}
