import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, ShieldPlus } from 'lucide-react';
import { toast } from 'sonner';

import {
  authApi,
  CreateAdminRequest,
  AdminLevel,
  AdminPermission,
} from '@/lib/api/auth';
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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
const SUPER_ADMIN_PERMISSIONS = [
  AdminPermission.MANAGE_ADMINS,
  AdminPermission.MANAGE_FINANCIALS,
];

interface CreateAdminDialogProps {
  onSuccess?: () => void;
}

export function CreateAdminDialog({ onSuccess }: CreateAdminDialogProps) {
  const { t } = useTranslation('adminTeam');
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [adminLevel, setAdminLevel] = useState<AdminLevel>(AdminLevel.REGULAR_ADMIN);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isSuperAdmin = adminLevel === AdminLevel.SUPER_ADMIN;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    // Name validation
    if (!name) {
      newErrors.name = 'Name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (name.length > 100) {
      newErrors.name = 'Name must not exceed 100 characters';
    }

    // Password validation (optional)
    if (password && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: CreateAdminRequest = {
        email,
        name,
        password: password || undefined,
        adminLevel,
        permissions: isSuperAdmin ? undefined : permissions,
      };

      const response = await authApi.createAdmin(payload);

      toast.success(`Admin account created for ${response.email}`, {
        description: response.temporaryPasswordSent
          ? 'Temporary password sent via email'
          : 'Account created successfully',
      });

      setOpen(false);
      resetForm();

      // Call parent callback to refresh data
      onSuccess?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to create admin account';
      toast.error('Error', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setName('');
    setPassword('');
    setAdminLevel(AdminLevel.REGULAR_ADMIN);
    setPermissions([]);
    setErrors({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }
  };

  const togglePermission = (permission: AdminPermission) => {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

        <div className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('createAdmin.fields.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('createAdmin.fields.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {t('createAdmin.fields.emailDescription')}
            </p>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('createAdmin.fields.name')}</Label>
            <Input
              id="name"
              placeholder={t('createAdmin.fields.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {t('createAdmin.fields.nameDescription')}
            </p>
          </div>

          {/* Password Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="password">{t('createAdmin.fields.password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('createAdmin.fields.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {t('createAdmin.fields.passwordDescription')}
            </p>
          </div>

          {/* Admin Level Field */}
          <div className="space-y-2">
            <Label>{t('createAdmin.fields.adminLevel')}</Label>
            <Select value={adminLevel} onValueChange={(value) => setAdminLevel(value as AdminLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
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
            <p className="text-sm text-muted-foreground">
              {t('createAdmin.fields.adminLevelDescription')}
            </p>
          </div>

          {/* Permissions Field (only for Regular Admin) */}
          {!isSuperAdmin && (
            <div className="space-y-2">
              <Label>{t('createAdmin.fields.permissions')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('createAdmin.fields.permissionsDescription')}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {ALL_PERMISSIONS.map((permission) => (
                  <div
                    key={permission}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <Checkbox
                      checked={permissions.includes(permission)}
                      onCheckedChange={() => togglePermission(permission)}
                    />
                    <label className="cursor-pointer text-sm font-normal leading-none">
                      {t(`createAdmin.permissions.${permission}`)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
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
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('createAdmin.cancel')}
            </Button>
            <Button type="button" disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? (
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
      </DialogContent>
    </Dialog>
  );
}
