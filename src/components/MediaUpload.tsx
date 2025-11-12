import { useState, useRef } from 'react';
import { Upload, X, Image, Video, FileText, Loader } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { supabase } from '../lib/supabase';

export interface UploadedMedia {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  name: string;
  size: number;
  caption?: string;
}

interface MediaUploadProps {
  wishlistId: string;
  itemId?: string;
  onUploadComplete?: (media: UploadedMedia) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export function MediaUpload({
  wishlistId,
  itemId,
  onUploadComplete,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'video/*', 'application/pdf', '.doc', '.docx'],
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedMedia[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getMediaType = (mimeType: string): 'image' | 'video' | 'document' => {
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
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      for (const file of files) {
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
          setError(`${file.name} is too large. Maximum size is 50MB`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${wishlistId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('wishlist-media')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('wishlist-media')
          .getPublicUrl(fileName);

        const mediaType = getMediaType(file.type);

        const { data: mediaRecord, error: insertError } = await supabase
          .from('wishlist_media')
          .insert({
            wishlist_id: wishlistId,
            item_id: itemId,
            media_type: mediaType,
            file_url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const uploadedMedia: UploadedMedia = {
          id: mediaRecord.id,
          type: mediaType,
          url: publicUrl,
          name: file.name,
          size: file.size,
        };

        setUploadedFiles(prev => [...prev, uploadedMedia]);
        onUploadComplete?.(uploadedMedia);
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload Media (Images, Videos, Documents)
        </label>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || uploadedFiles.length >= maxFiles}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader size={20} className="mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={20} className="mr-2" />
              Choose Files ({uploadedFiles.length}/{maxFiles})
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 mt-2">
          Accepted: Images, Videos, PDF, Word documents. Max 50MB per file.
        </p>

        {error && (
          <p className="text-sm text-red-400 mt-2">{error}</p>
        )}
      </div>

      {uploadedFiles.length > 0 && (
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
                  onClick={() => removeFile(media)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
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
