import { useEffect } from 'react';

const SCRIPT_SRC = 'https://satohash.io/widgets/stamp.js';

declare global {
  interface Window {
    SatohashStamp?: { init: () => void };
  }
}

/**
 * Drop-in Satohash stamp: hash stays on-device, X-Satohash-Client=katoa.
 */
export function SatohashStampWidget() {
  useEffect(() => {
    const boot = () => {
      window.SatohashStamp?.init?.();
    };
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      boot();
      return undefined;
    }
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = boot;
    document.body.appendChild(s);
    return undefined;
  }, []);

  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-1">
        Bitcoin proof of existence
      </p>
      <p className="text-sm text-gray-300 mb-4 leading-snug">
        Hash a file on this device. Katoa never sees it. Satohash stamps the fingerprint on Bitcoin.
      </p>
      <div data-satohash-stamp="" data-client="katoa" data-label="Katoa" data-theme="jewel" />
    </div>
  );
}
