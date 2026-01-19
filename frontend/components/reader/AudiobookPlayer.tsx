'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { tokenManager } from '@/lib/api/client';

interface AudiobookPlayerProps {
  audioUrl: string;
  bookTitle: string;
  onFirstPlay?: () => void;
}

/**
 * Secure Audiobook Player Component
 *
 * SECURITY: This player uses a secure streaming endpoint that:
 * 1. Requires authentication (JWT token in query param for HTML5 audio)
 * 2. Validates user owns the assignment
 * 3. Enforces 7-day access window
 * 4. Does NOT expose the actual file URL
 * 5. Prevents direct download via Content-Disposition: inline
 * 6. Disables caching via Cache-Control headers
 *
 * The streaming endpoint is: /api/v1/queue/assignments/:id/stream-audio
 * The audioUrl prop should be in format: /api/queue/assignments/:id/stream-audio
 */
export function AudiobookPlayer({ audioUrl, bookTitle, onFirstPlay }: AudiobookPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build the authenticated streaming URL
  // The backend accepts JWT token as query parameter for audio streaming
  const authenticatedUrl = useMemo(() => {
    const token = tokenManager.getToken();
    if (!token) {
      setError('Authentication required. Please log in again.');
      return null;
    }

    // Build full URL with token for authentication
    // The audioUrl from backend is: /api/queue/assignments/:id/stream-audio
    // We need to add the API base URL and token
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const fullUrl = audioUrl.startsWith('/api/')
      ? `${baseUrl}/api/v1${audioUrl.replace('/api', '')}?token=${encodeURIComponent(token)}`
      : `${audioUrl}?token=${encodeURIComponent(token)}`;

    return fullUrl;
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setError(
        'Unable to play audiobook. Access may have expired or you may need to log in again.',
      );
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !authenticatedUrl) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        setError('Unable to play audiobook. Please try again.');
      });
      // Track first play to mark assignment as IN_PROGRESS
      if (!hasPlayed && onFirstPlay) {
        onFirstPlay();
        setHasPlayed(true);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.min(audio.currentTime + 15, duration);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(audio.currentTime - 15, 0);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Show error state
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-500" />
            <h3 className="font-semibold text-red-700 dark:text-red-400">Playback Error</h3>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Title */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Now Playing</p>
            <h3 className="font-semibold">{bookTitle}</h3>
          </div>

          {/* Audio Element (hidden) - Uses authenticated streaming URL */}
          {authenticatedUrl && (
            <audio
              ref={audioRef}
              src={authenticatedUrl}
              preload="metadata"
              crossOrigin="use-credentials"
            />
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              max={duration || 100}
              step={1}
              className="cursor-pointer"
              disabled={!authenticatedUrl}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={skipBackward}
              title="Skip back 15 seconds"
              disabled={!authenticatedUrl}
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              onClick={togglePlay}
              className="h-12 w-12"
              disabled={!authenticatedUrl}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={skipForward}
              title="Skip forward 15 seconds"
              disabled={!authenticatedUrl}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleMute} disabled={!authenticatedUrl}>
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.01}
              className="max-w-[120px] flex-1"
              disabled={!authenticatedUrl}
            />
          </div>

          {/* Security Notice */}
          <div className="rounded border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
            <p className="font-medium">Secure Streaming</p>
            <p className="mt-1 text-blue-700 dark:text-blue-300">
              This audiobook streams securely from our servers. Access is limited to 7 days from
              release. You cannot download or share this content.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
