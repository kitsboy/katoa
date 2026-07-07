import { useState } from 'react';
import { Video, Loader } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MediaUpload } from './MediaUpload';
import { VIDEO_ACCEPT_ATTR, DEFAULT_VIDEO_MAX_MB } from '../lib/videoFormats';

interface CoverVideoUploadProps {
  onVideoUrl: (url: string) => void;
  currentUrl?: string | null;
}

export function CoverVideoUpload({ onVideoUrl, currentUrl }: CoverVideoUploadProps) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);

  return (
    <div className="cover-video-upload rounded-xl border border-[#00aff0]/25 bg-[#00aff0]/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Video size={18} className="text-[#00aff0]" />
        <h4 className="text-sm font-bold text-white">{t('video.upload.title')}</h4>
      </div>
      <p className="text-xs text-gray-400 mb-3">{t('video.upload.hint')}</p>

      {currentUrl && (
        <video
          src={currentUrl}
          className="w-full max-h-48 rounded-lg object-cover mb-3 border border-white/10"
          muted
          playsInline
          controls
          preload="metadata"
        />
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Loader size={16} className="animate-spin" />
          Uploading…
        </div>
      )}

      <MediaUpload
        accept={VIDEO_ACCEPT_ATTR}
        maxSizeMB={DEFAULT_VIDEO_MAX_MB}
        maxFiles={1}
        onFilesSelected={async (files) => {
          const file = files[0];
          if (!file) return;
          setUploading(true);
          try {
            const url = URL.createObjectURL(file);
            onVideoUrl(url);
          } finally {
            setUploading(false);
          }
        }}
      />
    </div>
  );
}