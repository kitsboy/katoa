import { useState, useRef, useId } from 'react';
import { Upload, X, Image, Video, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './Button';
import { Card } from './Card';
import { supabase, asRow } from '../lib/supabase';
import type { WishlistMedia } from '../types/database';
import {
  VIDEO_ACCEPT_ATTR,
  DEFAULT_VIDEO_MAX_MB,
  DEFAULT_IMAGE_MAX_MB,
  isVideoFile,
  normalizeVideoMime,
  formatFileSize,
} from '../lib/videoFormats';

export interface UploadedMedia {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  name: string;
  size: number;
  caption?: string;
}

interface MediaUploadPropsWishlist {
  wishlistId: string;
  itemId?: string;
  onUploadComplete?: (media: UploadedMedia) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  onFilesSelected?: never;
  accept?: never;
  maxSizeMB?: never;
}

interface MediaUploadPropsSimple {
  onFilesSelected: (files: File[]) => Promise<void>;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  wishlistId?: never;
  itemId?: never;
  onUploadComplete?: never;
  acceptedTypes?: never;
}

type MediaUploadProps = MediaUploadPropsWishlist | MediaUploadPropsSimple;

export function MediaUpload(props: MediaUploadProps) {
  const { t } = useLanguage();
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedMedia[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSimpleMode = 'onFilesSelected' in props && props.onFilesSelected !== undefined;

  const maxFiles = props.maxFiles || 5;
  const acceptedTypes = isSimpleMode
    ? (props.accept || VIDEO_ACCEPT_ATTR)
    : ((props as MediaUploadPropsWishlist).acceptedTypes || [
        'image/*',
        ...VIDEO_ACCEPT_ATTR.split(','),
        'application/pdf',
        '.doc',
        '.docx',
      ]).join(',');
  const maxSizeMB = isSimpleMode ? (props.maxSizeMB || DEFAULT_VIDEO_MAX_MB) : DEFAULT_VIDEO_MAX_MB;

  const getMediaType = (mimeType: string, file?: File): 'image' | 'video' | 'document' => {
    if (file && isVideoFile(file)) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  };

  const getFileIcon = (type: 'image' | 'video' | 'document') => {
    switch (type) {
      case 'image':
        return <Image size={20} />;
      case 'video':
        return <Video size={20} />;
      case 'document':
        return <FileText size={20} />;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length + uploadedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setError('');

    if (isSimpleMode) {
      const simpleProps = props as MediaUploadPropsSimple;
      await simpleProps.onFilesSelected(files);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const wishlistProps = props as MediaUploadPropsWishlist;
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      for (const file of files) {
        const isVideo = isVideoFile(file);
        const fileMaxMb = isVideo ? DEFAULT_VIDEO_MAX_MB : DEFAULT_IMAGE_MAX_MB;
        const maxSize = fileMaxMb * 1024 * 1024;
        if (file.size > maxSize) {
          setError(`${file.name} is too large (${formatFileSize(file.size)}). Max ${fileMaxMb}MB`);
          continue;
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
        const fileName = `${user.id}/${wishlistProps.wishlistId}/${isVideo ? 'video' : 'media'}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('wishlist-media')
          .upload(fileName, file, {
            contentType: isVideo ? normalizeVideoMime(file) : file.type || undefined,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('wishlist-media')
          .getPublicUrl(fileName);

        const mediaType = getMediaType(file.type, file);

        const { data: mediaRecord, error: insertError } = await supabase
          .from('wishlist_media')
          .insert({
            wishlist_id: wishlistProps.wishlistId,
            item_id: wishlistProps.itemId,
            media_type: mediaType,
            file_url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const record = asRow<WishlistMedia>(mediaRecord);
        if (!record) throw new Error('Failed to save media record');

        const uploadedMedia: UploadedMedia = {
          id: record.id,
          type: mediaType,
          url: publicUrl,
          name: file.name,
          size: file.size,
        };

        setUploadedFiles(prev => [...prev, uploadedMedia]);
        wishlistProps.onUploadComplete?.(uploadedMedia);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError((err as Error).message || 'Failed to upload files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = async (media: UploadedMedia) => {
    try {
      await supabase
        .from('wishlist_media')
        .delete()
        .eq('id', media.id);

      setUploadedFiles(prev => prev.filter(f => f.id !== media.id));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete file');
    }
  };

  const chooseLabel = isSimpleMode
    ? 'Choose files'
    : `Choose files (${uploadedFiles.length}/${maxFiles})`;

  return (
    <div className="space-y-4">
      <div>
        {!isSimpleMode && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-2">
            Upload Media (Images, Videos, Documents)
          </label>
        )}

        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="sr-only"
          tabIndex={-1}
          disabled={uploading}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          aria-invalid={error ? true : undefined}
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || uploadedFiles.length >= maxFiles}
          loading={uploading}
          aria-label={chooseLabel}
          className="w-full min-h-[44px]"
        >
          {uploading ? (
            t('common.loading')
          ) : (
            <>
              <Upload size={20} className="mr-2" aria-hidden />
              {chooseLabel}
            </>
          )}
        </Button>

        {isSimpleMode ? (
          <p id={hintId} className="text-xs text-gray-500 mt-2">{t('video.upload.hint')}</p>
        ) : (
          <p id={hintId} className="text-xs text-gray-500 mt-2">
            Accepted: Images, Videos, PDF, Word documents. Max {maxSizeMB}MB per file.
          </p>
        )}

        {error && (
          <p id={errorId} className="text-sm text-red-400 mt-2" role="alert">
            {error}
          </p>
        )}
      </div>

      {!isSimpleMode && uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-300">Uploaded Files</p>
          {uploadedFiles.map((media) => (
            <Card key={media.id} className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 text-orange-500">
                  {getFileIcon(media.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{media.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(media.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(media)}
                  className="flex-shrink-0 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors touch-manipulation"
                  aria-label={`Remove ${media.name}`}
                >
                  <X size={18} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
