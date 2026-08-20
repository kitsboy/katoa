import { useCallback, useEffect, useId, useRef, useState, type DragEvent } from 'react';
import { Image, Loader, Trash2, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './Button';
import { formatFileSize } from '../lib/videoFormats';

export const DEFAULT_COVER_IMAGE_MAX_MB = 8;
export const COVER_IMAGE_ACCEPT_ATTR = 'image/*';

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i;

function isImageFile(file: File): boolean {
  if (file.type && file.type.startsWith('image/')) return true;
  return IMAGE_EXT.test(file.name);
}

function fileNameFromUrl(url: string): string | null {
  try {
    const path = url.startsWith('blob:') ? '' : new URL(url, window.location.origin).pathname;
    const name = path.split('/').pop();
    return name && name.includes('.') ? decodeURIComponent(name) : null;
  } catch {
    return null;
  }
}

export interface CoverImageUploadProps {
  /** Object URL or remote URL. Pass `''` from the parent after a clear if you own form state. */
  onImageUrl: (url: string) => void;
  /** Selected file for upload pipelines. `null` when cleared. */
  onFile?: (file: File | null) => void;
  currentUrl?: string | null;
  maxSizeMB?: number;
  accept?: string;
  disabled?: boolean;
  className?: string;
  /** Card slot: no chrome, fills ~h-40. */
  compact?: boolean;
}

export function CoverImageUpload({
  onImageUrl,
  onFile,
  currentUrl,
  maxSizeMB = DEFAULT_COVER_IMAGE_MAX_MB,
  accept = COVER_IMAGE_ACCEPT_ATTR,
  disabled = false,
  className = '',
  compact = false,
}: CoverImageUploadProps) {
  const { t } = useLanguage();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCount = useRef(0);
  const blobUrlRef = useRef<string | null>(null);

  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);

  const hasImage = Boolean(currentUrl);
  const displayName = fileName || (currentUrl ? fileNameFromUrl(currentUrl) : null);

  const revokeOwnedBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!currentUrl) {
      setFileName(null);
      setFileSize(null);
    } else if (blobUrlRef.current && currentUrl !== blobUrlRef.current) {
      setFileName(null);
      setFileSize(null);
    }
  }, [currentUrl]);

  const resetDrag = () => {
    dragCount.current = 0;
    setDragging(false);
  };

  const adoptFile = useCallback(
    (file: File) => {
      if (disabled) return;
      setError('');

      if (!isImageFile(file)) {
        setError(t('cover.image.invalid'));
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(t('cover.image.tooLarge').replace('${max}', String(maxSizeMB)));
        return;
      }

      setBusy(true);
      try {
        revokeOwnedBlob();
        const url = URL.createObjectURL(file);
        blobUrlRef.current = url;
        setFileName(file.name);
        setFileSize(file.size);
        onImageUrl(url);
        onFile?.(file);
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [disabled, maxSizeMB, onFile, onImageUrl, revokeOwnedBlob, t]
  );

  const clear = useCallback(() => {
    if (disabled) return;
    revokeOwnedBlob();
    setFileName(null);
    setFileSize(null);
    setError('');
    onImageUrl('');
    onFile?.(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [disabled, onFile, onImageUrl, revokeOwnedBlob]);

  const onDragEnter = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCount.current += 1;
    setDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCount.current -= 1;
    if (dragCount.current <= 0) resetDrag();
  };

  const onDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) e.dataTransfer.dropEffect = 'copy';
  };

  const onDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    resetDrag();
    const file = e.dataTransfer.files[0];
    if (file) adoptFile(file);
  };

  const hint = t('cover.image.hint').replace('${max}', String(maxSizeMB));

  return (
    <div
      className={`cover-image-upload relative overflow-hidden ${
        compact
          ? 'h-40 p-0 rounded-none border-0 bg-transparent'
          : 'rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5'
      } ${className}`}
    >
      {!compact && (
        <>
          <div
            className="pointer-events-none absolute -top-16 -right-10 h-36 w-36 rounded-full bg-bitcoin-orange-500/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-neon-cyan-500/10 blur-3xl"
            aria-hidden
          />

          <div className="relative flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-bitcoin-orange-500/20 to-neon-cyan-500/10 border border-white/10 text-bitcoin-orange-400">
                <Image size={18} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-bitcoin-orange-400 font-semibold">
                  Media
                </p>
                <h4 className="text-sm font-display font-bold text-white">{t('cover.image.title')}</h4>
              </div>
            </div>
            <span className="shrink-0 inline-flex items-center rounded-full border border-neon-cyan-500/30 bg-neon-cyan-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-neon-cyan-400">
              {maxSizeMB}MB
            </span>
          </div>
        </>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        disabled={disabled || busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) adoptFile(file);
        }}
      />

      {hasImage && currentUrl ? (
        <div
          className={`relative group rounded-xl overflow-hidden border bg-charcoal-950/60 transition-all duration-200 ${
            dragging
              ? 'border-neon-cyan-500 shadow-[0_0_24px_rgba(20,230,255,0.25)]'
              : 'border-white/10'
          }`}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <img
            src={currentUrl}
            alt={displayName || t('cover.image.title')}
            className={
              compact
                ? 'w-full h-40 object-cover bg-charcoal-900'
                : 'w-full max-h-56 aspect-[16/9] object-cover bg-charcoal-900'
            }
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || busy}
            aria-label={t('cover.image.change')}
            className="absolute inset-0 flex items-center justify-center bg-charcoal-950/0 hover:bg-charcoal-950/55 focus-visible:bg-charcoal-950/55 transition-colors touch-manipulation"
          >
            <span className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity text-sm font-semibold text-white flex items-center gap-2">
              <Upload size={16} aria-hidden />
              {t('cover.image.change')}
            </span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            disabled={disabled || busy}
            aria-label={t('cover.image.remove')}
            className={`absolute z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-charcoal-950/70 border border-white/10 text-gray-300 hover:text-red-400 hover:border-red-400/40 backdrop-blur-md touch-manipulation ${
              compact ? 'bottom-2 right-2' : 'top-2 right-2'
            }`}
          >
            <Trash2 size={16} aria-hidden />
          </button>
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal-950/70 backdrop-blur-sm z-10">
              <Loader size={22} className="animate-spin text-neon-cyan-500" aria-hidden />
              <span className="sr-only">{t('common.loading')}</span>
            </div>
          )}
          {dragging && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-neon-cyan-500/15 text-sm font-semibold text-neon-cyan-400">
              {t('cover.image.drop')}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          disabled={disabled || busy}
          aria-describedby={compact ? undefined : `${inputId}-hint`}
          aria-label={t('cover.image.drop')}
          className={`group w-full rounded-xl border-2 border-dashed text-center transition-all duration-200 touch-manipulation ${
            compact ? 'h-40 min-h-0 px-3 py-4' : 'min-h-[180px] px-4 py-8'
          } ${
            dragging
              ? 'border-neon-cyan-500 bg-neon-cyan-500/10 shadow-[0_0_24px_rgba(20,230,255,0.25)]'
              : 'border-white/15 bg-black/20 hover:border-neon-cyan-500/50 hover:bg-white/[0.04]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {busy ? (
            <Loader size={28} className="mx-auto mb-3 animate-spin text-neon-cyan-500" aria-hidden />
          ) : (
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-bitcoin-orange-500/20 to-neon-cyan-500/10 border border-white/10 text-bitcoin-orange-400 group-hover:text-neon-cyan-400 transition-colors">
              <Upload size={22} aria-hidden />
            </div>
          )}
          <p className="text-sm font-semibold text-white mb-1">{t('cover.image.empty')}</p>
          <p className="text-xs text-gray-400">{t('cover.image.drop')}</p>
        </button>
      )}

      {!compact && (
        <>
          <p id={`${inputId}-hint`} className="mt-3 text-xs text-gray-500">
            {hint}
          </p>

          {(displayName || fileSize != null) && (
            <p className="mt-2 text-xs text-gray-300 truncate" title={displayName ?? undefined}>
              <span className="text-gray-500">Selected: </span>
              {displayName && <span className="text-neon-cyan-400 font-medium">{displayName}</span>}
              {fileSize != null && (
                <span className="text-gray-500 font-mono"> · {formatFileSize(fileSize)}</span>
              )}
            </p>
          )}

          {hasImage && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={disabled || busy}
                onClick={() => inputRef.current?.click()}
                className="min-h-[44px]"
              >
                <Upload size={16} className="mr-2" aria-hidden />
                {t('cover.image.change')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={disabled || busy}
                onClick={clear}
                aria-label={t('cover.image.remove')}
                className="min-h-[44px] text-gray-400 hover:text-red-400"
              >
                <Trash2 size={16} className="mr-2" aria-hidden />
                {t('cover.image.remove')}
              </Button>
            </div>
          )}
        </>
      )}

      {error && (
        <p
          className={
            compact
              ? 'absolute bottom-1 left-2 right-14 z-20 text-xs text-red-400 bg-charcoal-950/80 rounded-md px-2 py-1'
              : 'mt-2 text-sm text-red-400'
          }
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
