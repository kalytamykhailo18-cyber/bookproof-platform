import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import {
  updateProfile,
  changePassword,
  Language,
  getLanguage,
  updateLanguage,
} from '@/lib/api/users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  ArrowLeft,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Globe,
  Save,
  Edit,
} from 'lucide-react';

export function AuthorProfilePage() {
  const { t } = useTranslation('author.profile');
  const navigate = useNavigate();
  const { user, refreshUser } = useAuthStore();

  // Loading states
  const [isLoadingLanguage, setIsLoadingLanguage] = useState(true);

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

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCountry(user.country || '');
    }
  }, [user]);

  // Fetch language preference
  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        setIsLoadingLanguage(true);
        const data = await getLanguage();
        setPreferredLanguage(data.language);
      } catch (error) {
        console.error('Failed to fetch language:', error);
      } finally {
        setIsLoadingLanguage(false);
      }
    };
    fetchLanguage();
  }, []);

  // Handle basic info update
  const handleUpdateBasicInfo = async () => {
    try {
      setIsUpdatingBasicInfo(true);
      await updateProfile({ name, country });
      await updateLanguage(preferredLanguage);
      await refreshUser();
      setIsEditingBasicInfo(false);
      toast.success(t('messages.profileUpdated') || 'Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.updateFailed') || 'Failed to update profile');
    } finally {
      setIsUpdatingBasicInfo(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(t('messages.passwordMismatch') || 'Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t('messages.passwordTooShort') || 'Password must be at least 8 characters');
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(t('messages.passwordChanged') || 'Password changed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.passwordChangeFailed') || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/author')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('title') || 'Author Profile'}</h1>
          <p className="text-muted-foreground">
            {t('subtitle') || 'Manage your account information'}
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>{t('sections.basicInfo') || 'Basic Information'}</CardTitle>
                <CardDescription>
                  {t('sections.basicInfoDesc') || 'Your account details and personal information'}
                </CardDescription>
              </div>
            </div>
            {!isEditingBasicInfo && (
              <Button variant="outline" size="sm" onClick={() => setIsEditingBasicInfo(true)}>
                <Edit className="mr-2 h-4 w-4" />
                {t('actions.edit') || 'Edit'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingLanguage ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isEditingBasicInfo ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <User className="mr-2 inline h-4 w-4" />
                    {t('basicInfo.name') || 'Full Name'}
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">
                    <MapPin className="mr-2 inline h-4 w-4" />
                    {t('basicInfo.country') || 'Country'}
                  </Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Your country"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">
                  <Globe className="mr-2 inline h-4 w-4" />
                  {t('basicInfo.language') || 'Language'}
                </Label>
                <Select
                  value={preferredLanguage}
                  onValueChange={(value) => setPreferredLanguage(value as Language)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Language.EN}>English</SelectItem>
                    <SelectItem value={Language.PT}>Portugu&ecirc;s</SelectItem>
                    <SelectItem value={Language.ES}>Espa&ntilde;ol</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('basicInfo.languageNote') || 'This affects the language of emails and notifications'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  <Mail className="mr-2 inline h-4 w-4" />
                  {t('basicInfo.email') || 'Email Address'}
                </Label>
                <Input value={user?.email || ''} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  {t('basicInfo.emailNote') || 'Contact support to change your email'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateBasicInfo} disabled={isUpdatingBasicInfo}>
                  {isUpdatingBasicInfo ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {t('actions.save') || 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingBasicInfo(false);
                    setName(user?.name || '');
                    setCountry(user?.country || '');
                  }}
                >
                  {t('actions.cancel') || 'Cancel'}
                </Button>
              </div>
            </>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  <User className="mr-2 inline h-4 w-4" />
                  {t('basicInfo.name') || 'Full Name'}
                </p>
                <p className="mt-1">{user?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  <MapPin className="mr-2 inline h-4 w-4" />
                  {t('basicInfo.country') || 'Country'}
                </p>
                <p className="mt-1">{user?.country || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  <Globe className="mr-2 inline h-4 w-4" />
                  {t('basicInfo.language') || 'Language'}
                </p>
                <p className="mt-1">
                  {preferredLanguage === Language.EN
                    ? 'English'
                    : preferredLanguage === Language.PT
                      ? 'Portugu&ecirc;s'
                      : 'Espa&ntilde;ol'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  <Mail className="mr-2 inline h-4 w-4" />
                  {t('basicInfo.email') || 'Email Address'}
                </p>
                <p className="mt-1">{user?.email || '-'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>{t('sections.passwordChange') || 'Change Password'}</CardTitle>
              <CardDescription>
                {t('sections.passwordChangeDesc') || 'Update your account password'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t('password.current') || 'Current Password'}</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('password.new') || 'New Password'}</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <p className="text-xs text-muted-foreground">
              {t('password.requirements') || 'Password must be at least 8 characters'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('password.confirm') || 'Confirm New Password'}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
          >
            {isChangingPassword ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lock className="mr-2 h-4 w-4" />
            )}
            {t('password.change') || 'Change Password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
