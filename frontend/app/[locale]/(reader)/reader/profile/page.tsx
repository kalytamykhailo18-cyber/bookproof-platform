'use client';

import { useState, useEffect } from 'react';
import { useReaderProfile } from '@/hooks/useReaders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Link as LinkIcon,
  Trash2,
  Plus,
  Save,
  BookOpen,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Wallet,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { ContentPreference } from '@/lib/api/readers';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';

const GENRE_OPTIONS = [
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Thriller',
  'Romance',
  'Horror',
  'Historical Fiction',
  'Literary Fiction',
  'Young Adult',
  'Non-Fiction',
  'Biography',
  'Self-Help',
  'Business',
  'Technology',
  'Other',
];

export default function ReaderProfilePage() {
  const t = useTranslations('reader.profile');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const {
    profile,
    isLoadingProfile,
    hasProfile,
    createProfile,
    isCreating,
    updateProfile,
    isUpdating,
    addAmazonProfile,
    isAddingAmazonProfile,
    removeAmazonProfile,
    isRemovingAmazonProfile,
  } = useReaderProfile();

  const [contentPreference, setContentPreference] = useState<ContentPreference>(
    ContentPreference.BOTH,
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [newAmazonProfile, setNewAmazonProfile] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setContentPreference(profile.contentPreference as ContentPreference);
      setSelectedGenres(profile.preferredGenres);
      setIsEditing(false);
    } else if (!isLoadingProfile && !hasProfile) {
      setIsEditing(true);
    }
  }, [profile, isLoadingProfile, hasProfile]);

  const handleSave = () => {
    if (!hasProfile) {
      // Create new profile
      createProfile({
        contentPreference,
        preferredGenres: selectedGenres,
      });
    } else {
      // Update existing profile
      updateProfile({
        contentPreference,
        preferredGenres: selectedGenres,
      });
    }
  };

  const handleAddAmazonProfile = () => {
    if (!newAmazonProfile.trim()) return;

    // Validate URL format
    if (!newAmazonProfile.includes('amazon.com')) {
      alert('Please enter a valid Amazon profile URL');
      return;
    }

    addAmazonProfile({ profileUrl: newAmazonProfile });
    setNewAmazonProfile('');
  };

  const handleRemoveAmazonProfile = (profileId: string) => {
    if (confirm('Are you sure you want to remove this Amazon profile?')) {
      removeAmazonProfile(profileId);
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const canAddAmazonProfile = profile && profile.amazonProfiles.length < 3;
  const isSaving = isCreating || isUpdating;

  if (isLoadingProfile) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-12 w-64 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <Skeleton className="h-96 animate-pulse" />
            <Skeleton className="h-64 animate-pulse" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Back Button */}
      <div className="animate-fade-right">
        <Button type="button" variant="ghost" size="sm" onClick={() => router.push(`/${locale}/reader`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToDashboard')}
        </Button>
      </div>

      {/* Header */}
      <div className="flex animate-fade-up items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        {hasProfile && !isEditing && (
          <Button type="button" onClick={() => setIsEditing(true)} className="animate-fade-left">
            {t('editProfile')}
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 md:col-span-2">
          {/* Profile Settings */}
          <Card className="animate-zoom-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('sections.profileSettings')}
              </CardTitle>
              <CardDescription>
                {!hasProfile
                  ? t('sections.createDesc')
                  : isEditing
                    ? t('sections.editDesc')
                    : t('sections.currentDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Preference */}
              <div className="animate-fade-up-fast space-y-2">
                <Label htmlFor="contentPreference">{t('contentPreference.label')}</Label>
                <Select
                  value={contentPreference}
                  onValueChange={(value) => setContentPreference(value as ContentPreference)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="contentPreference">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ContentPreference.EBOOK}>
                      {t('contentPreference.ebook')}
                    </SelectItem>
                    <SelectItem value={ContentPreference.AUDIOBOOK}>
                      {t('contentPreference.audiobook')}
                    </SelectItem>
                    <SelectItem value={ContentPreference.BOTH}>
                      {t('contentPreference.both')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{t('contentPreference.help')}</p>
              </div>

              {/* Preferred Genres */}
              <div className="animate-fade-up-light-slow space-y-3">
                <Label>{t('genres.label')}</Label>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map((genre) => (
                    <Badge
                      key={genre}
                      variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${!isEditing ? 'cursor-not-allowed opacity-60' : 'hover:scale-105'}`}
                      onClick={() => isEditing && toggleGenre(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{t('genres.help')}</p>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="animate-fade-up-medium-slow flex gap-2 pt-4">
                  <Button type="button" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      t('actions.saving')
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {!hasProfile ? t('actions.create') : t('actions.save')}
                      </>
                    )}
                  </Button>
                  {hasProfile && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        if (profile) {
                          setContentPreference(profile.contentPreference as ContentPreference);
                          setSelectedGenres(profile.preferredGenres);
                        }
                      }}
                    >
                      {t('actions.cancel')}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Amazon Profiles */}
          {hasProfile && (
            <Card className="animate-zoom-in-slow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  {t('sections.amazonProfiles')}
                </CardTitle>
                <CardDescription>{t('sections.amazonProfilesDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Profiles */}
                {profile?.amazonProfiles.map((amazonProfile, index) => (
                  <div
                    key={amazonProfile.id}
                    className={`flex items-center justify-between rounded-lg bg-muted p-3 animate-fade-up-${['fast', 'light-slow', 'medium-slow'][index % 3]}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {amazonProfile.isVerified ? (
                          <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                        )}
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto truncate p-0 text-sm"
                          onClick={() => window.open(amazonProfile.profileUrl, '_blank', 'noopener,noreferrer')}
                        >
                          {amazonProfile.profileUrl}
                        </Button>
                      </div>
                      <p className="ml-6 text-xs text-muted-foreground">
                        {amazonProfile.isVerified
                          ? t('amazonProfiles.verified')
                          : t('amazonProfiles.pending')}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAmazonProfile(amazonProfile.id)}
                      disabled={isRemovingAmazonProfile}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                {/* Add New Profile */}
                {canAddAmazonProfile && (
                  <div className="animate-fade-up-heavy-slow space-y-2 border-t pt-2">
                    <Label htmlFor="newAmazonProfile">
                      {t('amazonProfiles.addLabel', { count: profile?.amazonProfiles.length || 0 })}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="newAmazonProfile"
                        placeholder={t('amazonProfiles.placeholder')}
                        value={newAmazonProfile}
                        onChange={(e) => setNewAmazonProfile(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddAmazonProfile();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddAmazonProfile}
                        disabled={isAddingAmazonProfile || !newAmazonProfile.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{t('amazonProfiles.example')}</p>
                  </div>
                )}

                {!canAddAmazonProfile && (
                  <div className="animate-fade-up rounded border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
                    <p className="text-sm text-yellow-900 dark:text-yellow-100">
                      {t('amazonProfiles.maxReached')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Stats */}
        {hasProfile && profile && (
          <div className="space-y-6">
            <Card className="animate-fade-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  {t('stats.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('stats.walletBalance')}:</span>
                    <span className="text-lg font-bold">${profile.walletBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('stats.totalEarned')}:</span>
                    <span className="font-medium text-green-600">
                      ${profile.totalEarned.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('stats.totalWithdrawn')}:</span>
                    <span className="font-medium">${profile.totalWithdrawn.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('stats.completed')}:</span>
                    <span className="font-medium">{profile.reviewsCompleted}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('stats.expired')}:</span>
                    <span className="font-medium text-red-600">{profile.reviewsExpired}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('stats.rejected')}:</span>
                    <span className="font-medium text-red-600">{profile.reviewsRejected}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('stats.reliabilityScore')}:</span>
                    <span className="text-lg font-bold">
                      {profile.reliabilityScore?.toFixed(0) || 100}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('stats.completionRate')}:</span>
                    <span className="font-medium">{profile.completionRate?.toFixed(0) || 0}%</span>
                  </div>
                </div>

                {profile.isFlagged && (
                  <div className="animate-pulse rounded border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900 dark:text-red-100">
                        {t('stats.accountFlagged')}
                      </span>
                    </div>
                    {profile.flagReason && (
                      <p className="mt-1 text-xs text-red-800 dark:text-red-200">
                        {profile.flagReason}
                      </p>
                    )}
                  </div>
                )}

                {/* Payout Request Button */}
                {profile.walletBalance > 0 && (
                  <div className="pt-4">
                    <Button type="button" className="w-full" onClick={() => router.push(`/${locale}/reader/wallet`)}>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Request Payout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!hasProfile && (
          <div className="space-y-6">
            <Card className="animate-fade-left border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <CardContent className="pt-6">
                <BookOpen className="animate-bounce-slow mb-2 h-8 w-8 text-blue-600" />
                <h3 className="mb-1 font-semibold text-blue-900 dark:text-blue-100">
                  {t('createPrompt.title')}
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {t('createPrompt.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
