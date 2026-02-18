import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Download,
  Trash2,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Globe,
} from 'lucide-react';
import {
  ConsentType,
  Language,
  exportUserData,
  deleteAccount as deleteAccountApi,
  updateConsent as updateConsentApi,
  getUserConsents,
  getLanguage,
  updateLanguage as updateLanguageApi,
  type ConsentResponse,
} from '@/lib/api/users';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/**
 * Closer Settings Page
 *
 * Provides GDPR compliance features:
 * - Data export (requirements.md Section 15.3)
 * - Account deletion (requirements.md Section 15.3)
 * - Consent management
 * - Language preference
 */
export function CloserSettingsPage() {
  const { t, i18n } = useTranslation('settings');
  const navigate = useNavigate();

  // Query states
  const [consents, setConsents] = useState<ConsentResponse[]>([]);
  const [isLoadingConsents, setIsLoadingConsents] = useState(true);
  const [languagePreference, setLanguagePreference] = useState<string | undefined>(undefined);
  const [isLoadingLanguage, setIsLoadingLanguage] = useState(true);

  // Mutation states
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isUpdatingConsent, setIsUpdatingConsent] = useState(false);
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);

  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  // Fetch consents
  useEffect(() => {
    const fetchConsents = async () => {
      try {
        setIsLoadingConsents(true);
        const data = await getUserConsents();
        setConsents(data);
      } catch (err) {
        console.error('Consents error:', err);
      } finally {
        setIsLoadingConsents(false);
      }
    };

    fetchConsents();
  }, []);

  // Fetch language preference
  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        setIsLoadingLanguage(true);
        const data = await getLanguage();
        setLanguagePreference(data.preferredLanguage);
      } catch (err) {
        console.error('Language error:', err);
      } finally {
        setIsLoadingLanguage(false);
      }
    };

    fetchLanguage();
  }, []);

  const refetchConsents = async () => {
    try {
      const data = await getUserConsents();
      setConsents(data);
    } catch (err) {
      console.error('Consents refetch error:', err);
    }
  };

  const refetchLanguage = async () => {
    try {
      const data = await getLanguage();
      setLanguagePreference(data.preferredLanguage);
    } catch (err) {
      console.error('Language refetch error:', err);
    }
  };

  // Show skeleton loading when initial data is loading
  if (isLoadingConsents && isLoadingLanguage) {
    return (
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 animate-pulse" />
          <Skeleton className="h-5 w-80 animate-pulse" />
        </div>
        <Skeleton className="h-32 animate-pulse" />
        <Skeleton className="h-48 animate-pulse" />
        <Skeleton className="h-64 animate-pulse" />
        <Skeleton className="h-48 animate-pulse" />
      </div>
    );
  }

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await exportUserData();

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bookproof-data-export-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t('dataExport.success'), {
        description: t('dataExport.successDescription'),
      });
    } catch (error: any) {
      toast.error(t('dataExport.error'), {
        description: error.message || t('dataExport.errorDescription'),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error(t('accountDeletion.confirmationError'));
      return;
    }

    try {
      setIsDeletingAccount(true);
      await deleteAccountApi({ reason: deleteReason });

      toast.success(t('accountDeletion.success'), {
        description: t('accountDeletion.successDescription'),
      });

      // Log out and redirect
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      toast.error(t('accountDeletion.error'), {
        description: error.message || t('accountDeletion.errorDescription'),
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleConsentToggle = async (consentType: ConsentType, currentValue: boolean) => {
    try {
      setIsUpdatingConsent(true);
      await updateConsentApi({
        consentType,
        granted: !currentValue,
      });

      toast.success(t('consents.updateSuccess'));
      await refetchConsents();
    } catch (error: any) {
      toast.error(t('consents.updateError'), {
        description: error.message,
      });
    } finally {
      setIsUpdatingConsent(false);
    }
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    try {
      setIsUpdatingLanguage(true);
      const data = await updateLanguageApi({ preferredLanguage: newLanguage });

      toast.success('Language updated', {
        description: `Your preferred language has been changed to ${data.preferredLanguage}`,
      });

      await refetchLanguage();

      // Change i18next language - automatically saved to localStorage
      // Same pattern as landing page LanguageSelector
      const newLocale = newLanguage.toLowerCase();
      i18n.changeLanguage(newLocale);
    } catch (error: any) {
      toast.error('Failed to update language', {
        description: error.message || 'Please try again later',
      });
    } finally {
      setIsUpdatingLanguage(false);
    }
  };

  const getConsentValue = (type: ConsentType): boolean => {
    const consent = consents.find((c) => c.consentType === type);
    return consent?.granted ?? false;
  };

  const getConsentIcon = (granted: boolean) => {
    return granted ? (
      <CheckCircle2 className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-gray-400" />
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {/* Language Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('language.title')}
          </CardTitle>
          <CardDescription>{t('language.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">{t('language.selectLabel')}</Label>
            <Select
              value={languagePreference}
              onValueChange={(value) => handleLanguageChange(value as Language)}
              disabled={isUpdatingLanguage}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder={t('language.selectPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EN">English</SelectItem>
                <SelectItem value="ES">Español</SelectItem>
                <SelectItem value="PT">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Consent Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('consents.title')}
          </CardTitle>
          <CardDescription>{t('consents.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Terms of Service */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getConsentIcon(getConsentValue(ConsentType.TERMS_OF_SERVICE))}
              <div>
                <p className="font-medium">{t('consents.termsOfService')}</p>
                <p className="text-sm text-muted-foreground">{t('consents.termsDescription')}</p>
              </div>
            </div>
            <Switch
              checked={getConsentValue(ConsentType.TERMS_OF_SERVICE)}
              disabled={true}
              aria-label={t('consents.termsOfService')}
            />
          </div>

          {/* Privacy Policy */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getConsentIcon(getConsentValue(ConsentType.PRIVACY_POLICY))}
              <div>
                <p className="font-medium">{t('consents.privacyPolicy')}</p>
                <p className="text-sm text-muted-foreground">{t('consents.privacyDescription')}</p>
              </div>
            </div>
            <Switch
              checked={getConsentValue(ConsentType.PRIVACY_POLICY)}
              disabled={true}
              aria-label={t('consents.privacyPolicy')}
            />
          </div>

          {/* Marketing Communications */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getConsentIcon(getConsentValue(ConsentType.MARKETING_COMMUNICATIONS))}
              <div>
                <p className="font-medium">{t('consents.marketingCommunications')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('consents.marketingDescription')}
                </p>
              </div>
            </div>
            <Switch
              checked={getConsentValue(ConsentType.MARKETING_COMMUNICATIONS)}
              onCheckedChange={() =>
                handleConsentToggle(
                  ConsentType.MARKETING_COMMUNICATIONS,
                  getConsentValue(ConsentType.MARKETING_COMMUNICATIONS),
                )
              }
              disabled={isUpdatingConsent}
              aria-label={t('consents.marketingCommunications')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t('dataExport.title')}
          </CardTitle>
          <CardDescription>{t('dataExport.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExportData} disabled={isExporting} variant="outline">
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('dataExport.exporting')}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {t('dataExport.button')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {t('accountDeletion.title')}
          </CardTitle>
          <CardDescription>{t('accountDeletion.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-destructive">{t('accountDeletion.warningTitle')}</p>
              <p className="text-sm text-muted-foreground">
                {t('accountDeletion.warningDescription')}
              </p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                {t('accountDeletion.button')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('accountDeletion.confirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('accountDeletion.confirmDescription')}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="deleteReason">{t('accountDeletion.reasonLabel')}</Label>
                  <Textarea
                    id="deleteReason"
                    placeholder={t('accountDeletion.reasonPlaceholder')}
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deleteConfirmation">
                    {t('accountDeletion.confirmationLabel')}
                  </Label>
                  <Input
                    id="deleteConfirmation"
                    placeholder='Type "DELETE" to confirm'
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                  />
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>{t('accountDeletion.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'DELETE' || isDeletingAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('accountDeletion.deleting')}
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('accountDeletion.confirmButton')}
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
