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
  Globe } from 'lucide-react';
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
import { useNavigate,  useParams } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger } from '@/components/ui/alert-dialog';

/**
 * User Settings Page
 *
 * Provides GDPR compliance features:
 * - Data export (requirements.md Section 15.3)
 * - Account deletion (requirements.md Section 15.3)
 * - Consent management
 */
export function SettingsPage() {
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

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await exportUserData();

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bookproof-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t('export.success'), {
        description: t('export.successDescription'),
      });
    } catch (error: any) {
      toast.error(t('export.error'), {
        description: error.message || t('export.errorDescription'),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      return;
    }

    try {
      setIsDeletingAccount(true);
      const data = await deleteAccountApi({
        confirmationPhrase: deleteConfirmation,
        reason: deleteReason || undefined,
      });

      toast.success(t('delete.success'), {
        description: t('delete.successDescription', {
          date: new Date(data.scheduledDeletionDate).toLocaleDateString(),
          days: data.gracePeriodDays
        }),
        duration: 10000,
      });

      // Reset form
      setDeleteConfirmation('');
      setDeleteReason('');
    } catch (error: any) {
      toast.error(t('delete.error'), {
        description: error.message || t('delete.errorDescription'),
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleConsentToggle = async (consentType: ConsentType, granted: boolean) => {
    try {
      setIsUpdatingConsent(true);
      const data = await updateConsentApi({
        consentType,
        granted,
      });

      toast.success(t('privacy.updateSuccess'), {
        description: t('privacy.updateSuccessDescription', {
          consentType: data.consentType,
          status: data.granted ? t('privacy.granted') : t('privacy.withdrawn')
        }),
      });

      await refetchConsents();
    } catch (error: any) {
      toast.error(t('privacy.updateError'), {
        description: error.message || t('privacy.updateErrorDescription'),
      });
    } finally {
      setIsUpdatingConsent(false);
    }
  };

  const getConsentStatus = (consentType: ConsentType) => {
    return consents?.find((c) => c.consentType === consentType)?.granted ?? false;
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    try {
      setIsUpdatingLanguage(true);

      // Change i18next language immediately for instant UI update
      const newLocale = newLanguage.toLowerCase();
      i18n.changeLanguage(newLocale);

      // Then save to backend
      const data = await updateLanguageApi({ preferredLanguage: newLanguage });

      toast.success(t('language.updateSuccess'), {
        description: t('language.updateSuccessDescription', { language: data.preferredLanguage }),
      });

      await refetchLanguage();
    } catch (error: any) {
      toast.error(t('language.updateError'), {
        description: error.message || t('language.updateErrorDescription'),
      });
    } finally {
      setIsUpdatingLanguage(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Language Preference Section */}
      <Card className="animate-fade-up">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <CardTitle>{t('language.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('language.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
            <div className="flex-1 space-y-1">
              <Label htmlFor="language" className="text-base font-medium">
                {t('language.interfaceLabel')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('language.interfaceDescription')}
              </p>
            </div>
            {isLoadingLanguage ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <Select
                value={languagePreference || 'EN'}
                onValueChange={(value) => handleLanguageChange(value as Language)}
                disabled={isUpdatingLanguage}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('language.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Language.EN}>{t('language.english')}</SelectItem>
                  <SelectItem value={Language.PT}>{t('language.portuguese')}</SelectItem>
                  <SelectItem value={Language.ES}>{t('language.spanish')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Export Section */}
      <Card className="animate-fade-up-fast">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            <CardTitle>{t('export.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('export.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">{t('export.includes')}</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>{t('export.personalInfo')}</li>
              <li>{t('export.campaigns')}</li>
              <li>{t('export.credits')}</li>
              <li>{t('export.consents')}</li>
            </ul>
          </div>

          <Button className="h-11 sm:h-10"
            onClick={handleExportData}
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('export.exporting')}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {t('export.button')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Privacy & Consent Section */}
      <Card className="animate-fade-up-normal">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>{t('privacy.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('privacy.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingConsents ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Marketing Consent */}
              <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="marketing" className="text-base font-medium cursor-pointer">
                      {t('privacy.marketing.title')}
                    </Label>
                    {getConsentStatus(ConsentType.MARKETING) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('privacy.marketing.description')}
                  </p>
                </div>
                <Switch
                  id="marketing"
                  checked={getConsentStatus(ConsentType.MARKETING)}
                  onCheckedChange={(checked) =>
                    handleConsentToggle(ConsentType.MARKETING, checked)
                  }
                  disabled={isUpdatingConsent}
                />
              </div>

              {/* Analytics Consent */}
              <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="analytics" className="text-base font-medium cursor-pointer">
                      {t('privacy.analytics.title')}
                    </Label>
                    {getConsentStatus(ConsentType.ANALYTICS) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('privacy.analytics.description')}
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={getConsentStatus(ConsentType.ANALYTICS)}
                  onCheckedChange={(checked) =>
                    handleConsentToggle(ConsentType.ANALYTICS, checked)
                  }
                  disabled={isUpdatingConsent}
                />
              </div>

              {/* Personalization Consent */}
              <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="personalization" className="text-base font-medium cursor-pointer">
                      {t('privacy.personalization.title')}
                    </Label>
                    {getConsentStatus(ConsentType.PERSONALIZATION) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('privacy.personalization.description')}
                  </p>
                </div>
                <Switch
                  id="personalization"
                  checked={getConsentStatus(ConsentType.PERSONALIZATION)}
                  onCheckedChange={(checked) =>
                    handleConsentToggle(ConsentType.PERSONALIZATION, checked)
                  }
                  disabled={isUpdatingConsent}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Account Section */}
      <Card className="animate-fade-up-slow border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">{t('delete.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('delete.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="h-11 sm:h-10" variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="h-4 w-4 mr-2" />
                {t('delete.button')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  {t('delete.dialog.title')}
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-4 pt-4">
                  <div className="rounded-lg bg-destructive/10 p-3 space-y-2">
                    <p className="text-sm font-medium text-destructive">
                      {t('delete.dialog.warning')}
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>{t('delete.dialog.gracePeriod')}</li>
                      <li>{t('delete.dialog.dataRemoved')}</li>
                      <li>{t('delete.dialog.contentDeleted')}</li>
                      <li>{t('delete.dialog.cancelable')}</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="deleteConfirmation" className="text-sm font-medium">
                        {t('delete.dialog.confirmLabel', { phrase: t('delete.dialog.confirmPhrase') }).replace('{phrase}', '')} <span className="font-mono bg-muted px-1 rounded">{t('delete.dialog.confirmPhrase')}</span>:
                      </Label>
                      <Input
                        id="deleteConfirmation"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder={t('delete.dialog.confirmPhrase')}
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deleteReason" className="text-sm font-medium">
                        {t('delete.dialog.reasonLabel')}
                      </Label>
                      <Textarea
                        id="deleteReason"
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        placeholder={t('delete.dialog.reasonPlaceholder')}
                        rows={3}
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                  setDeleteConfirmation('');
                  setDeleteReason('');
                }}>
                  {t('delete.dialog.cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'DELETE MY ACCOUNT' || isDeletingAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('delete.dialog.deleting')}
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('delete.dialog.confirm')}
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="mt-4 rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              <strong>{t('delete.noteLabel')}</strong> {t('delete.note')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Policy Link */}
      <Card className="animate-fade-up-very-slow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('privacyPolicy.title')}</p>
              <p className="text-sm text-muted-foreground">
                {t('privacyPolicy.description')}
              </p>
            </div>
            <Button className="h-11 sm:h-10"
              variant="outline"
              onClick={() => window.open('/privacy', '_blank', 'noopener,noreferrer')}
            >
              {t('privacyPolicy.button')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
