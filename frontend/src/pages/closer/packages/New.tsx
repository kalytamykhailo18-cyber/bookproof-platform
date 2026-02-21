import { useState } from 'react';
import { useNavigate,  useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { closerApi } from '@/lib/api/closer';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Search, Loader2 } from 'lucide-react';

export function CreatePackagePage() {
  const { t, i18n } = useTranslation('closer');
  const navigate = useNavigate();

  const [isCreating, setIsCreating] = useState(false);
  const [isBackLoading, setIsBackLoading] = useState(false);
  const [formData, setFormData] = useState({
    packageName: '',
    description: '',
    credits: 0,
    price: 0,
    currency: 'USD',
    validityDays: 90,
    specialTerms: '',
    internalNotes: '',
    clientName: '',
    clientEmail: '',
    clientCompany: '',
    clientPhone: '',
    includeKeywordResearch: false,
    keywordResearchCredits: 0,
  });

  const handleFormSubmit = async () => {
    try {
      setIsCreating(true);
      await closerApi.createPackage({
        packageName: formData.packageName,
        description: formData.description || undefined,
        credits: formData.credits,
        price: formData.price,
        currency: formData.currency,
        validityDays: formData.validityDays,
        specialTerms: formData.specialTerms || undefined,
        internalNotes: formData.internalNotes || undefined, // Per Section 5.2
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientCompany: formData.clientCompany || undefined,
        clientPhone: formData.clientPhone || undefined, // Per Section 5.2
        includeKeywordResearch: formData.includeKeywordResearch, // Per Section 5.2
        keywordResearchCredits: formData.includeKeywordResearch ? formData.keywordResearchCredits : 0, // Per Section 5.2
      });
      toast.success('Package created successfully');
      navigate(`/closer/packages`);
    } catch (error: any) {
      console.error('Create error:', error);
      toast.error(error.response?.data?.message || 'Failed to create package');
    } finally {
      setIsCreating(false);
    }
  };

  const updateField = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate price per credit — only when both values are set
  const pricePerCredit =
    formData.credits > 0 && formData.price > 0
      ? (formData.price / formData.credits).toFixed(4)
      : null;

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex animate-fade-up items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsBackLoading(true);
            navigate(`/closer/packages`);
          }}
          disabled={isBackLoading}
        >
          {isBackLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowLeft className="h-5 w-5" />}
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t('createPackage.title')}</h1>
          <p className="text-muted-foreground">{t('createPackage.description')}</p>
        </div>
      </div>

      <div>
        <div className="space-y-6">
          {/* Package Details */}
          <Card className="animate-fade-up-fast">
            <CardHeader>
              <CardTitle>{t('createPackage.packageDetails')}</CardTitle>
              <CardDescription>{t('createPackage.packageDetailsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="packageName">{t('createPackage.packageName')} *</Label>
                <Input
                  id="packageName"
                  placeholder={t('createPackage.packageNamePlaceholder')}
                  value={formData.packageName}
                  onChange={(e) => updateField('packageName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('createPackage.packageDescription')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('createPackage.packageDescriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="animate-fade-up-light-slow">
            <CardHeader>
              <CardTitle>{t('createPackage.pricing')}</CardTitle>
              <CardDescription>{t('createPackage.pricingDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="credits">{t('createPackage.credits')} *</Label>
                  <Input
                    id="credits"
                    type="number"
                    min={1}
                    placeholder="e.g. 100"
                    value={formData.credits === 0 ? '' : formData.credits}
                    onChange={(e) => updateField('credits', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">{t('createPackage.creditsHelp')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validityDays">{t('createPackage.validityPeriod')} *</Label>
                  <Input
                    id="validityDays"
                    type="number"
                    min={1}
                    placeholder="e.g. 90"
                    value={formData.validityDays}
                    onChange={(e) => updateField('validityDays', parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-muted-foreground">{t('createPackage.validityHelp')}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">{t('createPackage.price')} *</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="e.g. 500.00"
                    value={formData.price === 0 ? '' : formData.price}
                    onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">{t('createPackage.currency')}</Label>
                  <select
                    id="currency"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                    value={formData.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="BRL">BRL - Brazilian Real</option>
                  </select>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm">
                  <span className="font-medium">{t('createPackage.pricePerCredit')}:</span>{' '}
                  {pricePerCredit !== null
                    ? `${formData.currency} ${pricePerCredit}`
                    : <span className="text-muted-foreground italic">Enter credits and price above</span>
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card className="animate-fade-up-slow">
            <CardHeader>
              <CardTitle>{t('createPackage.clientInfo')}</CardTitle>
              <CardDescription>{t('createPackage.clientInfoDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientName">{t('createPackage.clientName')} *</Label>
                  <Input
                    id="clientName"
                    placeholder="John Doe"
                    value={formData.clientName}
                    onChange={(e) => updateField('clientName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">{t('createPackage.clientEmail')} *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="john@publisher.com"
                    value={formData.clientEmail}
                    onChange={(e) => updateField('clientEmail', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientCompany">{t('createPackage.clientCompany')}</Label>
                  <Input
                    id="clientCompany"
                    placeholder="XYZ Publishing House"
                    value={formData.clientCompany}
                    onChange={(e) => updateField('clientCompany', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">{t('createPackage.clientPhone') || 'Phone'}</Label>
                  <Input
                    id="clientPhone"
                    type="tel"
                    placeholder="+1-555-123-4567"
                    value={formData.clientPhone}
                    onChange={(e) => updateField('clientPhone', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inclusions - Keyword Research (per Section 5.2) */}
          <Card className="animate-fade-up-medium-slow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                {t('createPackage.inclusions') || 'Inclusions'}
              </CardTitle>
              <CardDescription>{t('createPackage.inclusionsDescription') || 'Additional services to include in this package'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="includeKeywordResearch"
                  checked={formData.includeKeywordResearch}
                  onCheckedChange={(checked) => updateField('includeKeywordResearch', checked as boolean)}
                />
                <div className="space-y-1">
                  <Label htmlFor="includeKeywordResearch" className="cursor-pointer font-medium">
                    {t('createPackage.includeKeywordResearch') || 'Include Keyword Research'}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t('createPackage.includeKeywordResearchHelp') || 'Add keyword research credits for the client'}
                  </p>
                </div>
              </div>
              {formData.includeKeywordResearch && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="keywordResearchCredits">
                    {t('createPackage.keywordResearchCredits') || 'Number of Keyword Research Credits'}
                  </Label>
                  <Input
                    id="keywordResearchCredits"
                    type="number"
                    min={1}
                    value={formData.keywordResearchCredits}
                    onChange={(e) => updateField('keywordResearchCredits', parseInt(e.target.value) || 0)}
                    className="max-w-[200px]"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Special Terms */}
          <Card className="animate-fade-up-very-slow">
            <CardHeader>
              <CardTitle>{t('createPackage.specialTerms')}</CardTitle>
              <CardDescription>{t('createPackage.specialTermsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="specialTerms"
                placeholder={t('createPackage.specialTermsPlaceholder')}
                value={formData.specialTerms}
                onChange={(e) => updateField('specialTerms', e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Internal Notes (not visible to client, per Section 5.2) */}
          <Card className="animate-fade-up">
            <CardHeader>
              <CardTitle>{t('createPackage.internalNotes') || 'Internal Notes'}</CardTitle>
              <CardDescription>
                {t('createPackage.internalNotesDescription') || 'Notes for internal use only - not visible to the client'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="internalNotes"
                placeholder={t('createPackage.internalNotesPlaceholder') || 'E.g., Negotiated by John on 01/15/2024, Referred by Partner XYZ...'}
                value={formData.internalNotes}
                onChange={(e) => updateField('internalNotes', e.target.value)}
                rows={3}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {t('createPackage.internalNotesWarning') || 'These notes are for your reference only and will NOT be shared with the client.'}
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex animate-fade-up justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsBackLoading(true);
                navigate(`/closer/packages`);
              }}
              disabled={isBackLoading}
            >
              {isBackLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('createPackage.cancel')}
            </Button>
            <Button type="button" onClick={handleFormSubmit} disabled={isCreating}>
              {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t('createPackage.create')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
