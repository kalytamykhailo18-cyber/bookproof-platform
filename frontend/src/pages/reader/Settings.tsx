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

      toast.success('Data exported successfully', {
        description: 'Your data has been downloaded as a JSON file',
      });
    } catch (error: any) {
      toast.error('Failed to export data', {
        description: error.message || 'Please try again later',
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

      toast.success('Account deletion scheduled', {
        description: `Your account will be deleted on ${new Date(data.scheduledDeletionDate).toLocaleDateString()}. You can cancel within ${data.gracePeriodDays} days.`,
        duration: 10000,
      });

      // Reset form
      setDeleteConfirmation('');
      setDeleteReason('');
    } catch (error: any) {
      toast.error('Failed to delete account', {
        description: error.message || 'Please try again later',
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

      toast.success('Consent updated', {
        description: `${data.consentType} consent ${data.granted ? 'granted' : 'withdrawn'}`,
      });

      await refetchConsents();
    } catch (error: any) {
      toast.error('Failed to update consent', {
        description: error.message || 'Please try again later',
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
      const data = await updateLanguageApi({ preferredLanguage: newLanguage });

      toast.success('Language updated', {
        description: `Your preferred language has been changed to ${data.preferredLanguage}`,
      });

      await refetchLanguage();

      // Also update the URL locale to match the new language
      const newLocale = newLanguage.toLowerCase();
      navigate(`/${newLocale}/reader/settings`);
    } catch (error: any) {
      toast.error('Failed to update language', {
        description: error.message || 'Please try again later',
      });
    } finally {
      setIsUpdatingLanguage(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your privacy, data, and account preferences
        </p>
      </div>

      {/* Language Preference Section */}
      <Card className="animate-fade-up">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <CardTitle>Language Preference</CardTitle>
          </div>
          <CardDescription>
            Choose your preferred language for the platform and email notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border">
            <div className="flex-1 space-y-1">
              <Label htmlFor="language" className="text-base font-medium">
                Interface Language
              </Label>
              <p className="text-sm text-muted-foreground">
                This will change the language of the entire platform
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
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Language.EN}>English</SelectItem>
                  <SelectItem value={Language.PT}>Português</SelectItem>
                  <SelectItem value={Language.ES}>Español</SelectItem>
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
            <CardTitle>Export Your Data</CardTitle>
          </div>
          <CardDescription>
            Download a complete copy of all your personal data in JSON format (GDPR compliance)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">Your export will include:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Personal information (email, name, profile data)</li>
              <li>Review assignments and submissions</li>
              <li>Credit purchase history</li>
              <li>Consent records and activity logs</li>
            </ul>
          </div>

          <Button
            type="button"
            onClick={handleExportData}
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download My Data
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
            <CardTitle>Privacy & Consent</CardTitle>
          </div>
          <CardDescription>
            Manage how we use your data (you can withdraw consent anytime)
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
                      Marketing Communications
                    </Label>
                    {getConsentStatus(ConsentType.MARKETING) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional emails about new features, offers, and platform updates
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
                      Analytics & Performance
                    </Label>
                    {getConsentStatus(ConsentType.ANALYTICS) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Help us improve by allowing anonymous usage analytics and error tracking
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
                      Personalization
                    </Label>
                    {getConsentStatus(ConsentType.PERSONALIZATION) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Personalize your experience with recommendations and customized content
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
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-4 pt-4">
                  <div className="rounded-lg bg-destructive/10 p-3 space-y-2">
                    <p className="text-sm font-medium text-destructive">
                      This action will schedule your account for deletion:
                    </p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>30-day grace period before permanent deletion</li>
                      <li>All personal data will be permanently removed</li>
                      <li>Campaigns, reviews, and transactions will be deleted</li>
                      <li>You can cancel within the grace period</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="deleteConfirmation" className="text-sm font-medium">
                        Type <span className="font-mono bg-muted px-1 rounded">DELETE MY ACCOUNT</span> to confirm:
                      </Label>
                      <Input
                        id="deleteConfirmation"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="DELETE MY ACCOUNT"
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deleteReason" className="text-sm font-medium">
                        Reason (optional - helps us improve):
                      </Label>
                      <Textarea
                        id="deleteReason"
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        placeholder="Tell us why you're leaving..."
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
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'DELETE MY ACCOUNT' || isDeletingAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="mt-4 rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Account deletion requests include a 30-day grace period.
              During this time, you can log in and cancel the deletion request if you change your mind.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Policy Link */}
      <Card className="animate-fade-up-very-slow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Privacy Policy</p>
              <p className="text-sm text-muted-foreground">
                Learn more about how we protect your data
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open('/privacy', '_blank', 'noopener,noreferrer')}
            >
              Read Policy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
