import { useState, useEffect } from 'react';
import {
  MarketingMaterialType,
  Language,
  MarketingMaterialResponseDto,
  affiliatesApi } from '@/lib/api/affiliates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select';
import {
  Download,
  FileText,
  Image,
  Video,
  Mail,
  Copy,
  CheckCircle,
  Filter } from 'lucide-react';
import { toast } from 'sonner';

export function MarketingMaterialsPage() {
  const [typeFilter, setTypeFilter] = useState<MarketingMaterialType | 'all'>('all');
  const [languageFilter, setLanguageFilter] = useState<Language | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const query = {
    ...(typeFilter !== 'all' && { type: typeFilter }),
    ...(languageFilter !== 'all' && { language: languageFilter }) };

  const [materials, setMaterials] = useState<MarketingMaterialResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);

  // Fetch marketing materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setIsLoading(true);
        const data = await affiliatesApi.getMarketingMaterials(query);
        setMaterials(data);
      } catch (error: any) {
        console.error('Marketing materials error:', error);
        toast.error('Failed to load marketing materials');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMaterials();
  }, [typeFilter, languageFilter]);

  const getTypeIcon = (type: MarketingMaterialType) => {
    switch (type) {
      case MarketingMaterialType.BANNER_IMAGE:
      case MarketingMaterialType.INFOGRAPHIC:
        return <Image className="h-5 w-5" />;
      case MarketingMaterialType.VIDEO:
        return <Video className="h-5 w-5" />;
      case MarketingMaterialType.EMAIL_TEMPLATE:
        return <Mail className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeBadgeColor = (type: MarketingMaterialType) => {
    switch (type) {
      case MarketingMaterialType.BANNER_IMAGE:
        return 'bg-blue-100 text-blue-800';
      case MarketingMaterialType.VIDEO:
        return 'bg-purple-100 text-purple-800';
      case MarketingMaterialType.EMAIL_TEMPLATE:
        return 'bg-green-100 text-green-800';
      case MarketingMaterialType.SOCIAL_POST:
        return 'bg-pink-100 text-pink-800';
      case MarketingMaterialType.PROMOTIONAL_COPY:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = async (material: MarketingMaterialResponseDto) => {
    if (!material.fileUrl) {
      toast.error('No file available for download');
      return;
    }

    try {
      setIsTracking(true);
      await affiliatesApi.trackMaterialDownload(material.id);

      // Open in new tab
      window.open(material.fileUrl, '_blank');

      toast.success('Material downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsTracking(false);
    }
  };

  const handleCopyContent = async (material: MarketingMaterialResponseDto) => {
    if (!material.content) {
      toast.error('No content available to copy');
      return;
    }

    try {
      setIsTracking(true);
      await navigator.clipboard.writeText(material.content);
      await affiliatesApi.trackMaterialDownload(material.id);

      setCopiedId(material.id);
      setTimeout(() => setCopiedId(null), 2000);

      toast.success('Content copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy content');
    } finally {
      setIsTracking(false);
    }
  };

  const formatTypeName = (type: MarketingMaterialType) => {
    return type.replace(/_/g, ' ');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-10 w-64 animate-pulse" />
        <Skeleton className="h-32 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">Marketing Materials</h1>
        <p className="text-muted-foreground">
          Download banners, templates, and promotional content to help you promote BookProof
        </p>
      </div>

      {/* Filters */}
      <Card className="animate-fade-up-light-slow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium">Type</label>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(MarketingMaterialType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {formatTypeName(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium">Language</label>
            <Select value={languageFilter} onValueChange={(v) => setLanguageFilter(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="All languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value={Language.EN}>English</SelectItem>
                <SelectItem value={Language.PT}>Portuguese</SelectItem>
                <SelectItem value={Language.ES}>Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Materials Grid */}
      {!materials || materials.length === 0 ? (
        <Card className="animate-fade-up-medium-slow">
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No Marketing Materials Found</h3>
            <p className="text-muted-foreground">
              No materials match your current filters. Try adjusting your selection.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((material, index) => (
            <Card
              key={material.id}
              className={`animate-fade-up-${
                ['fast', 'light-slow', 'medium-slow'][index % 3]
              } overflow-hidden`}
            >
              {/* Thumbnail */}
              {material.thumbnailUrl && (
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <img
                    src={material.thumbnailUrl}
                    alt={material.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(material.type)}
                    <CardTitle className="text-base">{material.title}</CardTitle>
                  </div>
                  <Badge className={getTypeBadgeColor(material.type)} variant="secondary">
                    {material.language}
                  </Badge>
                </div>
                {material.description && (
                  <CardDescription className="line-clamp-2">{material.description}</CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatTypeName(material.type)}</span>
                  <span>{material.downloadCount} downloads</span>
                </div>

                <div className="flex gap-2">
                  {material.fileUrl && (
                    <Button
                      type="button"
                      onClick={() => handleDownload(material)}
                      className="flex-1"
                      disabled={isTracking}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}

                  {material.content && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleCopyContent(material)}
                      className={`flex-1 ${copiedId === material.id ? 'bg-green-50' : ''}`}
                      disabled={isTracking}
                    >
                      {copiedId === material.id ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
