import { useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from './Button';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    alert('QR scanning from image requires additional library. Please paste the address manually.');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="qr-scanner-title">
      <div className="relative bg-charcoal-900 border border-white/10 rounded-t-[1.75rem] sm:rounded-2xl p-5 sm:p-6 max-w-md w-full pb-safe animate-sheet-up sm:animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
          type="button"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl mb-4">
            <Camera size={28} className="text-white" />
          </div>
          <h3 id="qr-scanner-title" className="text-xl sm:text-2xl font-display font-bold text-white mb-2">Scan QR Code</h3>
          <p className="text-gray-400 text-sm">Upload a QR image or paste the address manually</p>
        </div>

        <div className="space-y-4">
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full min-h-[48px]">
            <Camera size={20} className="mr-2" />
            Upload QR Code Image
          </Button>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-charcoal-900 text-gray-400">Or paste manually</span>
            </div>
          </div>

          <textarea
            placeholder="Paste Bitcoin or Lightning address here..."
            className="w-full px-4 py-3 min-h-[88px] bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan-500/50 resize-none text-base"
            onBlur={(e) => {
              const val = e.target.value.trim();
              if (val) onScan(val);
            }}
          />
        </div>
      </div>
    </div>
  );
}