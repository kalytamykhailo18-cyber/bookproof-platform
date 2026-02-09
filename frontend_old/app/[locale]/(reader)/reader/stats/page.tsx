'use client';

import { useTranslations } from 'next-intl';
import { useDashboards } from '@/hooks/useDashboards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  BookOpen,
  Target,
  Wallet,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function ReaderStatsPage() {
  const _t = useTranslations('readerStats');
  void _t; // Will use later for translations
  const { useReaderStats } = useDashboards();
  const { data: stats, isLoading } = useReaderStats();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Unable to load statistics</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">My Performance Statistics</h1>
        <p className="text-muted-foreground">Track your reading progress and performance</p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.performance.reviewsCompleted}</div>
            <p className="text-xs text-muted-foreground">Lifetime completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.performance.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reliability Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-2xl font-bold">
              {stats.performance.reliabilityScore.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground">/100</span>
            </div>
            <p className="text-xs text-muted-foreground">Platform score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-2xl font-bold">
              {stats.performance.averageInternalRating.toFixed(1)}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">From authors</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Details & Wallet */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Details
            </CardTitle>
            <CardDescription>Your detailed performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Reviews Completed</p>
                <p className="text-xs text-muted-foreground">Total accepted reviews</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">
                  {stats.performance.reviewsCompleted}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Reviews Expired</p>
                <p className="text-xs text-muted-foreground">Missed deadlines</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-orange-600">
                  {stats.performance.reviewsExpired}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Reviews Rejected</p>
                <p className="text-xs text-muted-foreground">Did not pass validation</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-red-600">
                  {stats.performance.reviewsRejected}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Summary
            </CardTitle>
            <CardDescription>Your earnings and balance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Current Balance</p>
                <p className="text-xs text-muted-foreground">Available for withdrawal</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(stats.wallet.currentBalance)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Total Earned</p>
                <p className="text-xs text-muted-foreground">Lifetime earnings</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(stats.wallet.totalEarned)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Total Withdrawn</p>
                <p className="text-xs text-muted-foreground">Successfully paid out</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{formatCurrency(stats.wallet.totalWithdrawn)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Assignments
          </CardTitle>
          <CardDescription>Your recent book assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Title</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentAssignments && stats.recentAssignments.length > 0 ? (
                stats.recentAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.bookTitle}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(assignment.assignedDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {assignment.completedDate ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {formatDate(assignment.completedDate)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {assignment.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {assignment.rating}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          assignment.status === 'COMPLETED'
                            ? 'default'
                            : assignment.status === 'IN_PROGRESS'
                              ? 'secondary'
                              : assignment.status === 'EXPIRED'
                                ? 'destructive'
                                : 'outline'
                        }
                      >
                        {assignment.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No recent assignments
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Over Time
          </CardTitle>
          <CardDescription>Your monthly performance trend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.performanceOverTime && stats.performanceOverTime.length > 0 ? (
              stats.performanceOverTime.map((month) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{month.month}</p>
                    <p className="text-sm text-muted-foreground">
                      {month.completedReviews} reviews completed
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Earnings</p>
                      <p className="font-medium">${month.earnings.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Expired</p>
                      <p className="font-medium text-orange-600">{month.expiredReviews}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                No performance data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
