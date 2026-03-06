import { useState, useEffect } from 'react';
import { formatCurrency, getCurrencyForLanguage } from '@/lib/utils';
import { readersApi, ReaderProfile, ContentPreference as ContentPref } from '@/lib/api/readers';
import { updateProfile, changePassword, Language, updateLanguage } from '@/lib/api/users';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
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
  SelectValue } from '@/components/ui/select';
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
  Loader2,
  Lock,
  Mail,
  MapPin,
  Globe } from 'lucide-react';
import { ContentPreference } from '@/lib/api/readers';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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

export function ReaderProfilePage() {
  const { t, i18n } = useTranslation('reader.profile');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<ReaderProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingAmazonProfile, setIsAddingAmazonProfile] = useState(false);
  const [isRemovingAmazonProfile, setIsRemovingAmazonProfile] = useState(false);

  const [contentPreference, setContentPreference] = useState<ContentPreference>(
    ContentPreference.BOTH,
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [newAmazonProfile, setNewAmazonProfile] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Basic Info state
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [isUpdatingBasicInfo, setIsUpdatingBasicInfo] = useState(false);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(Language.EN);

  // Password Change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const data = await readersApi.getProfile();
        setProfile(data);
        setContentPreference(data.contentPreference as ContentPreference);
        setSelectedGenres(data.preferredGenres);
        setIsEditing(false);
      } catch (err) {
        console.error('Profile error:', err);
        setIsEditing(true);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // Set user basic info when available
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCountry(user.country || '');
      setPreferredLanguage((user.preferredLanguage as Language) || Language.EN);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      if (!profile) {
        // Create new profile
        setIsCreating(true);
        await readersApi.createProfile({
          contentPreference: contentPreference as ContentPref,
          preferredGenres: selectedGenres
        });
        toast.success('Profile created successfully!');
        // Refetch profile
        const data = await readersApi.getProfile();
        setProfile(data);
        setIsEditing(false);
      } else {
        // Update existing profile
        setIsUpdating(true);
        await readersApi.updateProfile({
          contentPreference: contentPreference as ContentPref,
          preferredGenres: selectedGenres
        });
        toast.success('Profile updated successfully!');
        // Refetch profile
        const data = await readersApi.getProfile();
        setProfile(data);
        setIsEditing(false);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || `Failed to ${profile ? 'update' : 'create'} profile`;
      toast.error(message);
    } finally {
      setIsCreating(false);
      setIsUpdating(false);
    }
  };

  const handleAddAmazonProfile = async () => {
    if (!newAmazonProfile.trim()) return;

    // Validate URL format
    if (!newAmazonProfile.includes('amazon.com')) {
      alert('Please enter a valid Amazon profile URL');
      return;
    }

    try {
      setIsAddingAmazonProfile(true);
      await readersApi.addAmazonProfile({ profileUrl: newAmazonProfile });
      toast.success('Amazon profile added successfully!');
      // Refetch profile
      const data = await readersApi.getProfile();
      setProfile(data);
      setNewAmazonProfile('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add Amazon profile';
      toast.error(message);
    } finally {
      setIsAddingAmazonProfile(false);
    }
  };

  const handleRemoveAmazonProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to remove this Amazon profile?')) return;

    try {
      setIsRemovingAmazonProfile(true);
      await readersApi.removeAmazonProfile(profileId);
      toast.success('Amazon profile removed successfully!');
      // Refetch profile
      const data = await readersApi.getProfile();
      setProfile(data);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove Amazon profile';
      toast.error(message);
    } finally {
      setIsRemovingAmazonProfile(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const handleUpdateBasicInfo = async () => {
    try {
      setIsUpdatingBasicInfo(true);
      await updateProfile({
        name: name.trim(),
        country: country.trim(),
      });
      toast.success('Basic information updated successfully!');
      setIsEditingBasicInfo(false);
      // Trigger user refresh if available
      if (user) {
        window.location.reload(); // Simple refresh to update auth context
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update basic information';
      toast.error(message);
    } finally {
      setIsUpdatingBasicInfo(false);
    }
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    try {
      await updateLanguage({ preferredLanguage: newLanguage });
      toast.success('Language updated successfully!');
      // Update local state
      setPreferredLanguage(newLanguage);
      // Change i18next language - automatically saved to localStorage
      const newLocale = newLanguage.toLowerCase();
      i18n.changeLanguage(newLocale);
      // Trigger user refresh to update auth context
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update language';
      toast.error(message);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword({
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully! Please log in again.');
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Redirect to login after password change
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const hasProfile = !!profile;
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
        <Button type="button" variant="ghost" size="sm" onClick={() => navigate(`/reader`)}>
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
          {/* Basic Information */}
          <Card className="animate-zoom-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('sections.basicInfo') || 'Basic Information'}
              </CardTitle>
              <CardDescription>
                {t('sections.basicInfoDesc') || 'Update your name, country, and language preference'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Full Name */}
              <div className="animate-fade-up-fast space-y-2">
                <Label htmlFor="name">{t('basicInfo.name') || 'Full Name'}</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditingBasicInfo}
                  placeholder="John Doe"
                />
              </div>

              {/* Country */}
              <div className="animate-fade-up-light-slow space-y-2">
                <Label htmlFor="country">{t('basicInfo.country') || 'Country'}</Label>
                <Input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={!isEditingBasicInfo}
                  placeholder="United States"
                />
              </div>

              {/* Preferred Language */}
              <div className="animate-fade-up-light-slow space-y-2">
                <Label htmlFor="preferredLanguage" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t('basicInfo.language') || 'Preferred Language'}
                </Label>
                <Select
                  value={preferredLanguage}
                  onValueChange={(value) => handleLanguageChange(value as Language)}
                  disabled={!isEditingBasicInfo}
                >
                  <SelectTrigger id="preferredLanguage">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Language.EN}>English</SelectItem>
                    <SelectItem value={Language.PT}>Português</SelectItem>
                    <SelectItem value={Language.ES}>Español</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('basicInfo.languageNote') || 'Language for platform interface and email notifications'}
                </p>
              </div>

              {/* Email (Non-editable) */}
              <div className="animate-fade-up-medium-slow space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t('basicInfo.email') || 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  {t('basicInfo.emailNote') || 'Email cannot be changed. Contact support if needed.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="animate-fade-up-heavy-slow flex gap-2 pt-4">
                {!isEditingBasicInfo ? (
                  <Button type="button" onClick={() => setIsEditingBasicInfo(true)}>
                    {t('actions.edit') || 'Edit'}
                  </Button>
                ) : (
                  <>
                    <Button type="button" onClick={handleUpdateBasicInfo} disabled={isUpdatingBasicInfo}>
                      {isUpdatingBasicInfo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {t('actions.save') || 'Save'}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditingBasicInfo(false);
                        setName(user?.name || '');
                        setCountry(user?.country || '');
                        setPreferredLanguage((user?.preferredLanguage as Language) || Language.EN);
                      }}
                    >
                      {t('actions.cancel') || 'Cancel'}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="animate-zoom-in-slow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {t('sections.passwordChange') || 'Change Password'}
              </CardTitle>
              <CardDescription>
                {t('sections.passwordChangeDesc') || 'Update your account password'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Password */}
              <div className="animate-fade-up-fast space-y-2">
                <Label htmlFor="currentPassword">{t('password.current') || 'Current Password'}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>

              {/* New Password */}
              <div className="animate-fade-up-light-slow space-y-2">
                <Label htmlFor="newPassword">{t('password.new') || 'New Password'}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                />
                <p className="text-xs text-muted-foreground">
                  {t('password.requirements') || 'Must be at least 8 characters with uppercase, lowercase, number, and special character'}
                </p>
              </div>

              {/* Confirm New Password */}
              <div className="animate-fade-up-medium-slow space-y-2">
                <Label htmlFor="confirmPassword">{t('password.confirm') || 'Confirm New Password'}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>

              {/* Change Password Button */}
              <div className="animate-fade-up-heavy-slow pt-4">
                <Button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('password.changing') || 'Changing...'}
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      {t('password.change') || 'Change Password'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reader Profile Settings */}
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
                      <Loader2 className="h-4 w-4 animate-spin" />
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
                      {isRemovingAmazonProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-500" />}
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
                        {isAddingAmazonProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
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
                    <span className="text-lg font-bold">{formatCurrency(profile.walletBalance, getCurrencyForLanguage(i18n.language), i18n.language)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('stats.totalEarned')}:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(profile.totalEarned, getCurrencyForLanguage(i18n.language), i18n.language)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('stats.totalWithdrawn')}:</span>
                    <span className="font-medium">{formatCurrency(profile.totalWithdrawn, getCurrencyForLanguage(i18n.language), i18n.language)}</span>
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
                    <Button type="button" className="w-full" onClick={() => navigate(`/reader/wallet`)}>
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
