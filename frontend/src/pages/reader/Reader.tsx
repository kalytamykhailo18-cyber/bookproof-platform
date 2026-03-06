import { useState, useEffect } from 'react';
import { readersApi, ReaderProfile, ReaderStats } from '@/lib/api/readers';
import { queueApi, Assignment, AssignmentStatus } from '@/lib/api/queue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  CheckCircle,
  DollarSign,
  AlertCircle,
  Calendar,
  ArrowRight,
  Wallet,
  Eye,
  Banknote,
  Loader2 } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency, getCurrencyForLanguage } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  className }: {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

function AssignmentCard({ assignment, className }: { assignment: Assignment; className?: string }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('reader.dashboard');
  const [isNavLoading, setIsNavLoading] = useState(false);

  // Real-time countdown timer
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second for real-time countdown
  useEffect(() => {
    // Only update if assignment has a deadline
    if (!assignment.deadlineAt) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [assignment.deadlineAt]);

  // Calculate real-time remaining time
  const calculateRealTimeRemaining = () => {
    if (!assignment.deadlineAt) return null;

    const deadline = new Date(assignment.deadlineAt).getTime();
    const now = currentTime;
    const diff = deadline - now;

    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, totalHours: 0 };
    }

    const totalHours = diff / (1000 * 60 * 60);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, totalHours };
  };

  const realTimeRemaining = calculateRealTimeRemaining();

  const getStatusVariant = (
    status: AssignmentStatus,
  ): 'warning' | 'info' | 'success' | 'progress' | 'pending' | 'complete' | 'error' | 'neutral' => {
    switch (status) {
      case AssignmentStatus.WAITING:
        return 'warning';
      case AssignmentStatus.SCHEDULED:
        return 'info';
      case AssignmentStatus.APPROVED:
        return 'success';
      case AssignmentStatus.IN_PROGRESS:
        return 'progress';
      case AssignmentStatus.SUBMITTED:
        return 'pending';
      case AssignmentStatus.COMPLETED:
        return 'complete';
      case AssignmentStatus.EXPIRED:
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getStatusText = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.WAITING:
        return t('status.waiting');
      case AssignmentStatus.SCHEDULED:
        return t('status.scheduled');
      case AssignmentStatus.APPROVED:
        return t('status.approved');
      case AssignmentStatus.IN_PROGRESS:
        return t('status.inProgress');
      case AssignmentStatus.SUBMITTED:
        return t('status.submitted');
      case AssignmentStatus.COMPLETED:
        return t('status.completed');
      case AssignmentStatus.EXPIRED:
        return t('status.expired');
      default:
        return status;
    }
  };

  const isUrgent = realTimeRemaining && realTimeRemaining.totalHours < 24;

  const handleCardClick = () => {
    setIsNavLoading(true);
    navigate(`/reader/assignments/${assignment.id}`);
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${isNavLoading ? 'pointer-events-none opacity-70' : ''} ${className || ''}`}
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{assignment.book.title}</CardTitle>
            <CardDescription>
              {t('byAuthor', { author: assignment.book.authorName })}
            </CardDescription>
          </div>
          {assignment.book.coverImageUrl && (
            <img
              src={assignment.book.coverImageUrl}
              alt={assignment.book.title}
              className="h-24 w-16 rounded object-cover"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(assignment.status)}>
            {getStatusText(assignment.status)}
          </Badge>
          <Badge variant="outline">
            {assignment.formatAssigned} ({assignment.creditsValue}{' '}
            {assignment.creditsValue === 1 ? t('credit') : t('credits')})
          </Badge>
        </div>

        {/* Queue Position */}
        {assignment.status === AssignmentStatus.WAITING && assignment.queuePosition && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{t('queuePosition', { position: `#${assignment.queuePosition}` })}</span>
          </div>
        )}

        {/* Scheduled Date */}
        {assignment.status === AssignmentStatus.SCHEDULED && assignment.scheduledDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {t('scheduledFor', { date: new Date(assignment.scheduledDate).toLocaleDateString() })}
            </span>
          </div>
        )}

        {/* Deadline with countdown timer - Shows for APPROVED and IN_PROGRESS */}
        {assignment.deadlineAt && (assignment.status === AssignmentStatus.APPROVED || assignment.status === AssignmentStatus.IN_PROGRESS) && (
          <div
            className={`flex items-center gap-2 text-sm ${isUrgent ? 'font-semibold text-red-600' : 'text-muted-foreground'}`}
          >
            <Clock className={`h-4 w-4 ${isUrgent ? 'animate-pulse' : ''}`} />
            <span>
              {isUrgent && <AlertCircle className="mr-1 inline h-4 w-4" />}
              {t('deadline')}:{' '}
              {formatDistanceToNow(new Date(assignment.deadlineAt), { addSuffix: true })}
              {realTimeRemaining && (
                <span className={`ml-1 font-mono font-semibold ${
                  realTimeRemaining.totalHours < 1 ? 'text-red-600 animate-pulse' :
                  realTimeRemaining.totalHours < 12 ? 'text-red-600' :
                  realTimeRemaining.totalHours < 24 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  ({realTimeRemaining.hours.toString().padStart(2, '0')}:
                  {realTimeRemaining.minutes.toString().padStart(2, '0')}:
                  {realTimeRemaining.seconds.toString().padStart(2, '0')} {t('remaining')})
                </span>
              )}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{assignment.book.genre}</span>
        </div>

        {/* Action Buttons Based on Status */}
        <div className="mt-4 border-t pt-4">
          {assignment.status === AssignmentStatus.APPROVED && (
            <Button
              type="button"
              className="w-full"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsNavLoading(true);
                navigate(`/reader/assignments/${assignment.id}`);
              }}
              disabled={isNavLoading}
            >
              {isNavLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {t('actions.accessMaterials') || 'Access Materials'}
            </Button>
          )}
          {assignment.status === AssignmentStatus.IN_PROGRESS && (
            <Button
              type="button"
              variant="default"
              className="w-full bg-orange-600 hover:bg-orange-700"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsNavLoading(true);
                navigate(`/reader/assignments/${assignment.id}/submit`);
              }}
              disabled={isNavLoading}
            >
              {isNavLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {t('actions.submitReview') || 'Submit Review'}
            </Button>
          )}
          {(assignment.status === AssignmentStatus.WAITING || assignment.status === AssignmentStatus.SCHEDULED) && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsNavLoading(true);
                navigate(`/reader/assignments/${assignment.id}`);
              }}
              disabled={isNavLoading}
            >
              {isNavLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              {t('actions.viewDetails') || 'View Details'}
            </Button>
          )}
          {assignment.status === AssignmentStatus.SUBMITTED && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              size="sm"
              disabled
            >
              <Clock className="mr-2 h-4 w-4" />
              {t('actions.pendingValidation') || 'Pending Validation'}
            </Button>
          )}
          {(assignment.status === AssignmentStatus.COMPLETED || assignment.status === AssignmentStatus.VALIDATED) && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsNavLoading(true);
                navigate(`/reader/assignments/${assignment.id}`);
              }}
              disabled={isNavLoading}
            >
              {isNavLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              )}
              {t('actions.viewCompleted') || 'View Completed'}
            </Button>
          )}
        </div>

        {isNavLoading && (
          <div className="mt-3 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ReaderDashboard() {
  const { t, i18n } = useTranslation('reader.dashboard');
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ReaderProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [stats, setStats] = useState<ReaderStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(false);
  const [isPayoutLoading, setIsPayoutLoading] = useState(false);
  const [isStatsLoadingNav, setIsStatsLoadingNav] = useState(false);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const data = await readersApi.getProfile();
        setProfile(data);
      } catch (err) {
        console.error('Profile error:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        const data = await readersApi.getStats();
        setStats(data);
      } catch (err) {
        console.error('Stats error:', err);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoadingAssignments(true);
        const data = await queueApi.getMyAssignments();
        setAssignments(data);
      } catch (err) {
        console.error('Assignments error:', err);
      } finally {
        setIsLoadingAssignments(false);
      }
    };
    fetchAssignments();
  }, []);

  // Group assignments by status
  const groupedAssignments = assignments?.reduce((acc, assignment) => {
    const status = assignment.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(assignment);
    return acc;
  }, {} as Record<string, Assignment[]>);

  // Redirect to profile creation if no profile exists
  if (!isLoadingProfile && !profile) {
    navigate(`/reader/profile`);
    return null;
  }

  if (isLoadingProfile || isLoadingStats || isLoadingAssignments) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-12 w-64 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 animate-pulse" />
          ))}
        </div>
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  const activeAssignments = [
    ...(groupedAssignments?.[AssignmentStatus.APPROVED] || []),
    ...(groupedAssignments?.[AssignmentStatus.IN_PROGRESS] || []),
  ].sort((a, b) => {
    if (!a.hoursRemaining) return 1;
    if (!b.hoursRemaining) return -1;
    return a.hoursRemaining - b.hoursRemaining;
  });

  const upcomingAssignments = [
    ...(groupedAssignments?.[AssignmentStatus.WAITING] || []),
    ...(groupedAssignments?.[AssignmentStatus.SCHEDULED] || []),
  ];

  const completedAssignments = [
    ...(groupedAssignments?.[AssignmentStatus.SUBMITTED] || []),
    ...(groupedAssignments?.[AssignmentStatus.COMPLETED] || []),
  ];

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex animate-fade-up flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="animate-fade-left"
            onClick={() => {
              setIsCampaignsLoading(true);
              navigate(`/reader/campaigns`);
            }}
            disabled={isCampaignsLoading}
          >
            {isCampaignsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
            {t('browseBooks')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="animate-fade-left-slow"
            onClick={() => {
              setIsPayoutLoading(true);
              navigate(`/reader/wallet/payout`);
            }}
            disabled={isPayoutLoading || (stats?.walletBalance || 0) < 50}
            title={(stats?.walletBalance || 0) < 50 ? t('payoutMinimumRequired', { amount: '$50' }) : undefined}
          >
            {isPayoutLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
            {t('requestPayout')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="animate-fade-left-light-slow"
            onClick={() => {
              setIsStatsLoadingNav(true);
              navigate(`/reader/stats`);
            }}
            disabled={isStatsLoadingNav}
          >
            {isStatsLoadingNav ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
            {t('viewMyReviews')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('stats.walletBalance')}
          value={formatCurrency(stats?.walletBalance ?? 0, getCurrencyForLanguage(i18n.language), i18n.language)}
          icon={DollarSign}
          description={t('stats.totalEarned', { amount: formatCurrency(stats?.totalEarned ?? 0, getCurrencyForLanguage(i18n.language), i18n.language) })}
          className="animate-fade-up-fast"
        />
        <StatsCard
          title={t('stats.activeAssignments')}
          value={stats?.activeAssignments ?? 0}
          icon={BookOpen}
          description={t('stats.currentlyWorking')}
          className="animate-fade-up-light-slow"
        />
        <StatsCard
          title={t('stats.completedReviews')}
          value={stats?.completedAssignments ?? 0}
          icon={CheckCircle}
          description={t('stats.completionRate', { rate: (stats?.completionRate ?? 0).toFixed(0) })}
          className="animate-fade-up-medium-slow"
        />
        <StatsCard
          title={t('stats.pendingPayouts')}
          value={formatCurrency(stats?.pendingPayouts ?? 0, getCurrencyForLanguage(i18n.language), i18n.language)}
          icon={Banknote}
          description={t('stats.awaitingProcessing')}
          className="animate-fade-up-heavy-slow"
        />
      </div>

      {/* Active Assignments (URGENT) */}
      {activeAssignments.length > 0 && (
        <Card className="animate-zoom-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              {t('sections.activeAssignments')}
            </CardTitle>
            <CardDescription>{t('sections.activeDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {activeAssignments.map((assignment, index) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                className={index % 2 === 0 ? 'animate-fade-right' : 'animate-fade-left'}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Assignments */}
      {upcomingAssignments.length > 0 && (
        <Card className="animate-zoom-in-slow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              {t('sections.upcomingAssignments')}
            </CardTitle>
            <CardDescription>{t('sections.upcomingDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {upcomingAssignments.map((assignment, index) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                className={index % 2 === 0 ? 'animate-fade-right-slow' : 'animate-fade-left-slow'}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Assignments */}
      {completedAssignments.length > 0 && (
        <Card className="animate-zoom-in-medium-slow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              {t('sections.completedSubmitted')}
            </CardTitle>
            <CardDescription>{t('sections.completedDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {completedAssignments.map((assignment, index) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                className={
                  index % 2 === 0
                    ? 'animate-fade-right-medium-slow'
                    : 'animate-fade-left-medium-slow'
                }
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {assignments?.length === 0 && (
        <Card className="animate-fade-up-slow">
          <CardContent className="py-16 text-center">
            <BookOpen className="animate-bounce-slow mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">{t('empty.title')}</h3>
            <p className="mb-4 text-muted-foreground">{t('empty.description')}</p>
            <Button
              type="button"
              onClick={() => {
                setIsCampaignsLoading(true);
                navigate(`/reader/campaigns`);
              }}
              disabled={isCampaignsLoading}
            >
              {isCampaignsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('browseBooks')}
              {!isCampaignsLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
