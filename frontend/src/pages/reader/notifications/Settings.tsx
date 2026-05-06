import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { getNotificationSettings, updateNotificationSettings } from '@/lib/api/notifications';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { useNavigate,  useParams } from 'react-router-dom';
import { NotificationType } from '@/lib/api/notifications';

interface SettingsFormData {
  emailEnabled: boolean;
  emailFrequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';
  disabledTypes: NotificationType[];
}

// Notification types will use translations dynamically

export function NotificationSettingsPage() {
  const { t, i18n } = useTranslation('notifications.settings');
  const navigate = useNavigate();
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [isBackLoading, setIsBackLoading] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm<SettingsFormData>({
    defaultValues: {
      emailEnabled: true,
      emailFrequency: 'IMMEDIATE',
      disabledTypes: [] } });

  // Fetch notification settings
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await getNotificationSettings();
      setSettings(data);
    } catch (error: any) {
      console.error('Settings error:', error);
      toast.error(t('loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setValue('emailEnabled', settings.emailEnabled);
      setValue('emailFrequency', settings.emailFrequency);
      setValue('disabledTypes', settings.disabledTypes || []);
    }
  }, [settings, setValue]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setIsPending(true);
      await updateNotificationSettings(data);
      toast.success(t('updateSuccess'));
      await fetchSettings();
    } catch (error: any) {
      console.error('Update settings error:', error);
      toast.error(t('updateError'));
    } finally {
      setIsPending(false);
    }
  };

  const emailEnabled = watch('emailEnabled');
  const emailFrequency = watch('emailFrequency');
  const disabledTypes = watch('disabledTypes');

  const toggleNotificationType = (type: NotificationType) => {
    const current = disabledTypes || [];
    if (current.includes(type)) {
      setValue(
        'disabledTypes',
        current.filter((t) => t !== type),
      );
    } else {
      setValue('disabledTypes', [...current, type]);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => {
            setIsBackLoading(true);
            navigate(`/reader/notifications`);
          }}
          disabled={isBackLoading}
        >
          {isBackLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
          {t('backButton')}
        </Button>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Email Notifications */}
        <Card className="animate-fade-up-fast">
          <CardHeader>
            <CardTitle>{t('email.title')}</CardTitle>
            <CardDescription>
              {t('email.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Email Enabled Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailEnabled" className="text-base">
                  {t('email.enableLabel')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('email.enableDescription')}
                </p>
              </div>
              <Switch
                id="emailEnabled"
                checked={emailEnabled}
                onCheckedChange={(checked) => setValue('emailEnabled', checked)}
              />
            </div>

            {/* Email Frequency */}
            {emailEnabled && (
              <div className="space-y-3">
                <Label>{t('frequency.title')}</Label>
                <RadioGroup
                  value={emailFrequency}
                  onValueChange={(value) =>
                    setValue('emailFrequency', value as 'IMMEDIATE' | 'DAILY' | 'WEEKLY')
                  }
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
                    <RadioGroupItem value="IMMEDIATE" id="immediate" />
                    <Label htmlFor="immediate" className="flex-1 cursor-pointer">
                      <div className="font-medium">{t('frequency.immediate')}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('frequency.immediateDesc')}
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
                    <RadioGroupItem value="DAILY" id="daily" />
                    <Label htmlFor="daily" className="flex-1 cursor-pointer">
                      <div className="font-medium">{t('frequency.daily')}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('frequency.dailyDesc')}
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
                    <RadioGroupItem value="WEEKLY" id="weekly" />
                    <Label htmlFor="weekly" className="flex-1 cursor-pointer">
                      <div className="font-medium">{t('frequency.weekly')}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('frequency.weeklyDesc')}
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card className="animate-fade-up-normal">
          <CardHeader>
            <CardTitle>{t('types.title')}</CardTitle>
            <CardDescription>
              {t('types.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { type: NotificationType.CAMPAIGN, key: 'campaign' },
              { type: NotificationType.REVIEW, key: 'review' },
              { type: NotificationType.PAYMENT, key: 'payment' },
              { type: NotificationType.SYSTEM, key: 'system' },
            ].map((item, index) => {
              const isDisabled = disabledTypes?.includes(item.type);
              const animationClass = [
                'animate-fade-left-fast',
                'animate-fade-right-fast',
                'animate-fade-up-fast',
              ][index % 3];

              return (
                <div
                  key={item.type}
                  className={`flex items-start space-x-3 rounded-md border p-4 ${animationClass}`}
                >
                  <Checkbox
                    id={item.type}
                    checked={!isDisabled}
                    onCheckedChange={() => toggleNotificationType(item.type)}
                    className="mt-1"
                  />
                  <Label htmlFor={item.type} className="flex-1 cursor-pointer space-y-1">
                    <div className="font-medium">{t(`types.${item.key}.label`)}</div>
                    <div className="text-sm text-muted-foreground">{t(`types.${item.key}.description`)}</div>
                  </Label>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end animate-fade-up-slow">
          <Button type="button" disabled={isPending} size="lg" onClick={handleSubmit(onSubmit)}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('save')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
