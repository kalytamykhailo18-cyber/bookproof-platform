'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { NotificationType } from '@/lib/api/notifications';

interface SettingsFormData {
  emailEnabled: boolean;
  emailFrequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';
  disabledTypes: NotificationType[];
}

const notificationTypes = [
  {
    type: NotificationType.CAMPAIGN,
    label: 'Campaign Updates',
    description: 'Updates about your active campaigns and progress',
  },
  {
    type: NotificationType.REVIEW,
    label: 'Review Notifications',
    description: 'New reviews delivered, validations, and review status changes',
  },
  {
    type: NotificationType.PAYMENT,
    label: 'Payment Confirmations',
    description: 'Credit purchases, invoices, and payment confirmations',
  },
  {
    type: NotificationType.SYSTEM,
    label: 'System Notifications',
    description: 'System updates, maintenance notices, and important announcements',
  },
];

export default function NotificationSettingsPage() {
  const t = useTranslations('notifications.settings');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { data: settings, isLoading } = useNotificationSettings();
  const { mutate: updateSettings, isPending } = useUpdateNotificationSettings();

  const { register, handleSubmit, setValue, watch } = useForm<SettingsFormData>({
    defaultValues: {
      emailEnabled: true,
      emailFrequency: 'IMMEDIATE',
      disabledTypes: [],
    },
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setValue('emailEnabled', settings.emailEnabled);
      setValue('emailFrequency', settings.emailFrequency);
      setValue('disabledTypes', settings.disabledTypes || []);
    }
  }, [settings, setValue]);

  const onSubmit = (data: SettingsFormData) => {
    updateSettings(data);
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
        <Button type="button" variant="ghost" size="sm" className="mb-4" onClick={() => router.push(`/${locale}/reader/notifications`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Notifications
        </Button>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage how you receive notifications and which types you want to get
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <Card className="animate-fade-up-fast">
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Control when and how you receive email notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Enabled Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailEnabled" className="text-base">
                  Enable Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email in addition to in-app notifications
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
                <Label>Email Frequency</Label>
                <RadioGroup
                  value={emailFrequency}
                  onValueChange={(value) =>
                    setValue('emailFrequency', value as 'IMMEDIATE' | 'DAILY' | 'WEEKLY')
                  }
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
                    <RadioGroupItem value="IMMEDIATE" id="immediate" />
                    <Label htmlFor="immediate" className="flex-1 cursor-pointer">
                      <div className="font-medium">Immediate</div>
                      <div className="text-sm text-muted-foreground">
                        Get notified as soon as events happen
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
                    <RadioGroupItem value="DAILY" id="daily" />
                    <Label htmlFor="daily" className="flex-1 cursor-pointer">
                      <div className="font-medium">Daily Digest</div>
                      <div className="text-sm text-muted-foreground">
                        Receive a summary once per day
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
                    <RadioGroupItem value="WEEKLY" id="weekly" />
                    <Label htmlFor="weekly" className="flex-1 cursor-pointer">
                      <div className="font-medium">Weekly Digest</div>
                      <div className="text-sm text-muted-foreground">
                        Receive a summary once per week
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
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>
              Choose which types of notifications you want to receive (in-app notifications are
              always enabled)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationTypes.map((item, index) => {
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
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
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
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
