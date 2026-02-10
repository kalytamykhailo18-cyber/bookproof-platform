import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';

import { AdminPermission } from '@/lib/api/auth';
import { teamApi, AdminListItem, UpdateAdminRequest } from '@/lib/api/team';
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

interface EditAdminDialogProps {
  admin: AdminListItem;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function EditAdminDialog({ admin, onSuccess, trigger }: EditAdminDialogProps) {
  const { t } = useTranslation('adminTeam');
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [email, setEmail] = useState(admin.email);
  const [name, setName] = useState(admin.name);
  const [role, setRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SUPPORT'>(
    admin.role as any,
  );
  const [permissions, setPermissions] = useState<string[]>(admin.permissions || []);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isSuperAdmin = role === 'SUPER_ADMIN';

  // Reset form when dialog opens with new admin data
  useEffect(() => {
    if (open) {
      setEmail(admin.email);
      setName(admin.name);
      setRole(admin.role as any);
      setPermissions(admin.permissions || []);
      setErrors({});
    }
  }, [open, admin]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: UpdateAdminRequest = {
        email,
        name,
        role,
        permissions: isSuperAdmin ? undefined : permissions,
      };

      await teamApi.updateAdmin(admin.id, payload);

      toast.success('Admin updated successfully', {
        description: `${name}'s details have been updated`,
      });

      setOpen(false);

      // Call parent callback to refresh data
      onSuccess?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to update admin';
      toast.error('Error', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setOpen(newOpen);
    }
  };

  const togglePermission = (permission: string) => {
    setPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Admin</DialogTitle>
          <DialogDescription>Update admin details, role, and permissions</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-admin-email">Email Address</Label>
            <Input
              id="edit-admin-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            <p className="text-sm text-muted-foreground">
              The admin will receive notifications at this email
            </p>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-admin-name">Full Name</Label>
            <Input
              id="edit-admin-name"
              placeholder="Jane Admin"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            <p className="text-sm text-muted-foreground">Full name of the admin (2-100 characters)</p>
          </div>

          {/* Admin Level Field */}
          <div className="space-y-2">
            <Label>Admin Level</Label>
            <Select value={role} onValueChange={(value) => setRole(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPER_ADMIN">
                  <div>
                    <p className="font-medium">{t('createAdmin.levels.SUPER_ADMIN')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('createAdmin.levels.SUPER_ADMIN_DESC')}
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="ADMIN">
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
                  <div key={permission} className="flex flex-row items-start space-x-3 space-y-0">
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
              Cancel
            </Button>
            <Button type="button" disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
