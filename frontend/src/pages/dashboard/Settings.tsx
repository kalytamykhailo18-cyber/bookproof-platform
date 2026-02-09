import { useState } from 'react';
import { useTranslation } from 'node_modules/react-i18next';
import {
  Download,
  Trash2,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Key,
  Eye,
  EyeOff } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { useAuth } from '@/hooks/useAuth';
import { ConsentType } from '@/lib/api/users';
import { toast } from 'sonner';
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
  const { t } = useTranslation('settings');
  const {
    exportData,
    isExporting,
    deleteAccount,
    isDeletingAccount,
    updateConsent,
    isUpdatingConsent,
    consents,
    isLoadingConsents } = useUserData();

  const { changePasswordAsync, isChangingPassword } = useAuth();

  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleExportData = () => {
    exportData();
  };

  // Password change handler
  const handleChangePassword = async () => {
    setPasswordError('');

    // Validate
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }

    // Password strength validation
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setPasswordError('Password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('Password must contain at least one number');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setPasswordError('Password must contain at least one special character');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      await changePasswordAsync({ currentPassword, newPassword });
      // Success will be handled by the hook (redirect to login)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to change password';
      toast.error(errorMessage);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      return;
    }

    deleteAccount({
      confirmationPhrase: deleteConfirmation,
      reason: deleteReason || undefined });

    // Reset form
    setDeleteConfirmation('');
    setDeleteReason('');
  };

  const handleConsentToggle = (consentType: ConsentType, granted: boolean) => {
    updateConsent({
      consentType,
      granted });
  };

  const getConsentStatus = (consentType: ConsentType) => {
    return consents?.find((c) => c.consentType === consentType)?.granted ?? false;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your privacy, data, and account preferences
        </p>
      </div>

      {/* Change Password Section (Section 15.1) */}
      <Card className="animate-fade-up-fast">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm your new password"
                disabled={isChangingPassword}
              />
            </div>

            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}

            <div className="rounded-lg bg-muted p-3 space-y-1">
              <p className="text-xs font-medium">Password requirements:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>At least 8 characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one lowercase letter</li>
                <li>At least one number</li>
                <li>At least one special character</li>
              </ul>
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmNewPassword}
              className="w-full sm:w-auto"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Export Section */}
      <Card className="animate-fade-up-normal">
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
              <li>Campaign history and transactions (if author)</li>
              <li>Review assignments and submissions (if reader)</li>
              <li>Affiliate data and commissions (if affiliate)</li>
              <li>Consent records and activity logs</li>
            </ul>
          </div>

          <Button
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
              <Button variant="destructive" className="w-full sm:w-auto">
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
            <Button type="button" variant="outline" onClick={() => window.open('/privacy', '_blank', 'noopener,noreferrer')}>
              Read Policy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
