import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';

import { teamApi, CloserListItem, UpdateCloserRequest } from '@/lib/api/team';
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
import { Switch } from '@/components/ui/switch';

interface EditCloserDialogProps {
  closer: CloserListItem;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function EditCloserDialog({ closer, onSuccess, trigger }: EditCloserDialogProps) {
  const { t } = useTranslation('adminTeam');
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [email, setEmail] = useState(closer.email);
  const [name, setName] = useState(closer.name);
  const [commissionRate, setCommissionRate] = useState(closer.commissionRate);
  const [commissionEnabled, setCommissionEnabled] = useState(closer.commissionEnabled);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens with new closer data
  useEffect(() => {
    if (open) {
      setEmail(closer.email);
      setName(closer.name);
      setCommissionRate(closer.commissionRate);
      setCommissionEnabled(closer.commissionEnabled);
      setErrors({});
    }
  }, [open, closer]);

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

    // Commission rate validation
    if (commissionRate < 0) {
      newErrors.commissionRate = 'Commission rate cannot be negative';
    } else if (commissionRate > 100) {
      newErrors.commissionRate = 'Commission rate cannot exceed 100%';
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

      const payload: UpdateCloserRequest = {
        email,
        name,
        commissionRate,
        commissionEnabled,
      };

      await teamApi.updateCloser(closer.id, payload);

      toast.success('Closer updated successfully', {
        description: `${name}'s details have been updated`,
      });

      setOpen(false);

      // Call parent callback to refresh data
      onSuccess?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to update closer';
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Closer</DialogTitle>
          <DialogDescription>
            Update closer details and commission settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email Address</Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="closer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            <p className="text-sm text-muted-foreground">
              The closer will receive notifications at this email
            </p>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input
              id="edit-name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            <p className="text-sm text-muted-foreground">Full name of the closer (2-100 characters)</p>
          </div>

          {/* Commission Rate Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-commissionRate">Commission Rate (%)</Label>
            <div className="relative">
              <Input
                id="edit-commissionRate"
                type="number"
                min={0}
                max={100}
                step={0.1}
                placeholder="0"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
            {errors.commissionRate && (
              <p className="text-sm text-destructive">{errors.commissionRate}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Percentage of sales the closer earns (0-100%)
            </p>
          </div>

          {/* Commission Enabled Field */}
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Commission Enabled</Label>
              <p className="text-sm text-muted-foreground">
                Allow the closer to earn commission on sales
              </p>
            </div>
            <Switch checked={commissionEnabled} onCheckedChange={setCommissionEnabled} />
          </div>

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
