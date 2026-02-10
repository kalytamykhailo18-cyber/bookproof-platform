import { useState, useCallback } from 'react';

// Hook to track upload progress state
export function useUploadProgress() {
  const [uploadProgress, setUploadProgress] = useState<{
    ebook: number | null;
    audiobook: number | null;
    cover: number | null;
    synopsis: number | null;
  }>({
    ebook: null,
    audiobook: null,
    cover: null,
    synopsis: null,
  });

  const resetProgress = useCallback((type: 'ebook' | 'audiobook' | 'cover' | 'synopsis') => {
    setUploadProgress((prev) => ({ ...prev, [type]: null }));
  }, []);

  const updateProgress = useCallback((type: 'ebook' | 'audiobook' | 'cover' | 'synopsis', progress: number) => {
    setUploadProgress((prev) => ({ ...prev, [type]: progress }));
  }, []);

  const resetAllProgress = useCallback(() => {
    setUploadProgress({
      ebook: null,
      audiobook: null,
      cover: null,
      synopsis: null,
    });
  }, []);

  return {
    uploadProgress,
    updateProgress,
    resetProgress,
    resetAllProgress,
  };
}

