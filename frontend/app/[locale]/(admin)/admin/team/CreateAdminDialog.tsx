'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ShieldPlus } from 'lucide-react';

import { useCreateAdmin } from '@/hooks/useAdminTeam';
import { AdminLevel, AdminPermission } from '@/lib/api/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

/**
 * Zod schema matching backend CreateAdminDto exactly
 * Per requirements.md Section 1.3
 */
const createAdminSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
  adminLevel: z.nativeEnum(AdminLevel),
  permissions: z.array(z.nativeEnum(AdminPermission)).optional().default([]),
});

type CreateAdminFormData = z.infer<typeof createAdminSchema>;

// All available permissions for selection
const ALL_PERMISSIONS = [
  AdminPermission.MANAGE_USERS,
  AdminPermission.MANAGE_CAMPAIGNS,
  AdminPermission.MANAGE_REVIEWS,
  AdminPermission.MANAGE_READERS,
  AdminPermission.MANAGE_AUTHORS,
  AdminPermission.MANAGE_AFFILIATES,
  AdminPermission.MANAGE_CLOSERS,
  AdminPermission.MANAGE_COUPONS,
  AdminPermission.PROCESS_PAYOUTS,
  AdminPermission.VIEW_ANALYTICS,
  AdminPermission.MANAGE_SETTINGS,
];

// Super admin only permissions
const SUPER_ADMIN_PERMISSIONS = [AdminPermission.MANAGE_ADMINS, AdminPermission.MANAGE_FINANCIALS];

export function CreateAdminDialog() {
  const t = useTranslations('adminTeam');
  const [open, setOpen] = useState(false);
  const createAdminMutation = useCreateAdmin();

  const form = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      adminLevel: AdminLevel.REGULAR_ADMIN,
      permissions: [],
    },
  });

  const watchedAdminLevel = form.watch('adminLevel');
  const isSuperAdmin = watchedAdminLevel === AdminLevel.SUPER_ADMIN;

  const onSubmit = async (data: CreateAdminFormData) => {
    try {
      await createAdminMutation.mutateAsync({
        email: data.email,
        name: data.name,
        password: data.password || undefined, // Convert empty string to undefined
        adminLevel: data.adminLevel,
        permissions: isSuperAdmin ? undefined : data.permissions, // Super admin gets all permissions automatically
      });
      setOpen(false);
      form.reset();
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ShieldPlus className="mr-2 h-4 w-4" />
          {t('admins.addAdmin')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('createAdmin.title')}</DialogTitle>
          <DialogDescription>{t('createAdmin.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <div className="space-y-4">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createAdmin.fields.email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('createAdmin.fields.emailPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t('createAdmin.fields.emailDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createAdmin.fields.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('createAdmin.fields.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('createAdmin.fields.nameDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field (Optional) */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createAdmin.fields.password')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('createAdmin.fields.passwordPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t('createAdmin.fields.passwordDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Admin Level Field */}
            <FormField
              control={form.control}
              name="adminLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('createAdmin.fields.adminLevel')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={AdminLevel.SUPER_ADMIN}>
                        <div>
                          <p className="font-medium">{t('createAdmin.levels.SUPER_ADMIN')}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('createAdmin.levels.SUPER_ADMIN_DESC')}
                          </p>
                        </div>
                      </SelectItem>
                      <SelectItem value={AdminLevel.REGULAR_ADMIN}>
                        <div>
                          <p className="font-medium">{t('createAdmin.levels.REGULAR_ADMIN')}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('createAdmin.levels.REGULAR_ADMIN_DESC')}
                          </p>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>{t('createAdmin.fields.adminLevelDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Permissions Field (only for Regular Admin) */}
            {!isSuperAdmin && (
              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>{t('createAdmin.fields.permissions')}</FormLabel>
                      <FormDescription>
                        {t('createAdmin.fields.permissionsDescription')}
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {ALL_PERMISSIONS.map((permission) => (
                        <FormField
                          key={permission}
                          control={form.control}
                          name="permissions"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(permission)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, permission]);
                                    } else {
                                      field.onChange(current.filter((p) => p !== permission));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer text-sm font-normal">
                                {t(`createAdmin.permissions.${permission}`)}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Info for Super Admin */}
            {isSuperAdmin && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  Super Admin will automatically receive all permissions including:
                </p>
                <ul className="mt-2 list-inside list-disc text-sm text-blue-700">
                  {[...ALL_PERMISSIONS, ...SUPER_ADMIN_PERMISSIONS].map((p) => (
                    <li key={p}>{t(`createAdmin.permissions.${p}`)}</li>
                  ))}
                </ul>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createAdminMutation.isPending}
              >
                {t('createAdmin.cancel')}
              </Button>
              <Button type="button" disabled={createAdminMutation.isPending} onClick={form.handleSubmit(onSubmit)}>
                {createAdminMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('createAdmin.creating')}
                  </>
                ) : (
                  t('createAdmin.submit')
                )}
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
