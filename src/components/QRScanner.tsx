import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from './Button';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);

          const imageDataObj = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          if (imageDataObj) {
            alert('QR scanning from image requires additional library. Please paste the address manually.');
          }
        };

        img.src = imageData;
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading QR code:', error);
      alert('Failed to read QR code from image');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-night-blue-500 rounded-2xl p-6 max-w-md w-full mx-4 border border-night-blue-400">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-night-blue-300 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl mb-4">
            <Camera size={32} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Scan QR Code</h3>
          <p className="text-night-blue-200 text-sm">
            Upload an image containing a QR code or paste the address manually
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full"
          >
            <Camera size={20} className="mr-2" />
            Upload QR Code Image
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-night-blue-400"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-night-blue-500 text-night-blue-300">Or paste manually</span>
            </div>
          </div>

          <textarea
            placeholder="Paste your address here..."
            className="w-full px-4 py-3 bg-night-blue-400 border border-night-blue-400 rounded-lg text-white placeholder-night-blue-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows={3}
            onChange={(e) => {
              if (e.target.value.trim()) {
                onScan(e.target.value.trim());
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
