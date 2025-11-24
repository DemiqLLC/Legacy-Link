import { useSuperAdminDashboard } from '@meltstudio/client-common/src/sdk';
import { PledgeStatusEnum } from '@meltstudio/types';
import { AlertCircle, GitCommit, University, Users } from 'lucide-react';
import type { GetServerSideProps } from 'next';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';

import { Loading } from '@/components/common/loading';
import { Card } from '@/components/metrics/card';
import { useSessionUser } from '@/components/user/user-context';
import type { NextPageWithLayout } from '@/types/next';
import { Typography } from '@/ui/typography';
import { MetricLineChart, PieChart } from '@/ui/utils';
import { formatNumber, getLocalizedPledgeStatus } from '@/utils/localization';

type RankedItem = {
  id: string;
  name: string | null;
  count: number;
};

const SuperAdminDashboardPage: NextPageWithLayout = () => {
  const { t } = useTranslation();
  const { user, isLoading: isUserLoading } = useSessionUser();
  const {
    data: metrics,
    error: metricsError,
    isLoading: isMetricsLoading,
  } = useSuperAdminDashboard();

  if (isUserLoading || isMetricsLoading) {
    return <Loading />;
  }

  if (metricsError || !metrics || !user) {
    return (
      <div>
        <Trans>Error loading dashboard data. Please try again later.</Trans>
      </div>
    );
  }

  const alumniGrowthChartData = metrics.alumniGrowthTrend.map((item) => ({
    date: new Date(item.date).toLocaleDateString(),
    count: item.count,
  }));

  const pledgeTypeChartData = [
    { name: t('Monetary'), value: metrics.monetaryPledges, color: '#8A2BE2' },
    {
      name: t('Non-Monetary'),
      value: metrics.nonMonetaryPledges,
      color: '#32CD32',
    },
  ];

  const funnelStatuses = [
    PledgeStatusEnum.PLEDGE_INTENT,
    PledgeStatusEnum.AWAITING_CONFIRMATION,
    PledgeStatusEnum.PROCESSING_DONATION,
    PledgeStatusEnum.COMPLETED,
    PledgeStatusEnum.IMPACT_RECORDED,
  ];

  return (
    <div className="space-y-8">
      <Typography.H1>
        <Trans>Super Admin Dashboard</Trans>
      </Typography.H1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          title={t('Onboarded Universities')}
          value={formatNumber(metrics.onboardedUniversities)}
          icon={<University className="text-blue-500" />}
          color="rgba(59, 130, 246, 0.1)"
        />
        <Card
          title={t('Total Alumni')}
          value={formatNumber(
            metrics.alumniGrowthTrend.reduce((sum, item) => sum + item.count, 0)
          )}
          icon={<Users className="text-green-500" />}
          color="rgba(34, 197, 94, 0.1)"
        />
        <Card
          title={t('Total Pledges')}
          value={formatNumber(metrics.totalPledges)}
          icon={<GitCommit className="text-purple-500" />}
          color="rgba(168, 85, 247, 0.1)"
        />
        <Card
          title={t('Pending Follow-Ups')}
          value={formatNumber(metrics.pendingFollowUps)}
          icon={<AlertCircle className="text-yellow-500" />}
          color="rgba(234, 179, 8, 0.1)"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="h-full rounded-lg bg-gray-100 p-6 shadow dark:bg-gray-900">
          <Typography.H3 className="mb-4 font-bold">
            <Trans>Pledge Conversion Funnel</Trans>
          </Typography.H3>
          <ul className="m-0 list-none space-y-2 p-0 text-sm">
            {funnelStatuses.map((status) => (
              <li
                key={status}
                className="flex justify-between border-b border-gray-200 pb-2 last:border-b-0 dark:border-gray-700"
              >
                <span>{getLocalizedPledgeStatus(t, status)}</span>
                <span className="font-semibold">
                  {formatNumber(metrics.pledgeFunnel[status] ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex h-full flex-col rounded-lg bg-gray-100 p-6 shadow dark:bg-gray-900">
          <Typography.H3 className="mb-4 font-bold">
            <Trans>Pledges Overview</Trans>
          </Typography.H3>
          <div className="grow">
            <PieChart data={pledgeTypeChartData} total={metrics.totalPledges} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-lg bg-gray-100 p-6 shadow dark:bg-gray-900">
          <Typography.H3 className="mb-4 font-bold">
            <Trans>Top Universities by Pledges</Trans>
          </Typography.H3>
          <ul className="m-0 list-none space-y-2 p-0 text-sm">
            {metrics.topUniversities.length > 0 ? (
              metrics.topUniversities.map((uni: RankedItem, index: number) => (
                <li
                  key={uni.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-b-0 dark:border-gray-700"
                >
                  <span>
                    {index + 1}. {uni.name || t('Unknown University')}
                  </span>
                  <span className="font-semibold">
                    {formatNumber(uni.count)} {t('Pledges')}
                  </span>
                </li>
              ))
            ) : (
              <Typography.Paragraph className="text-gray-500">
                <Trans>No data available.</Trans>
              </Typography.Paragraph>
            )}
          </ul>
        </div>

        <div className="rounded-lg bg-gray-100 p-6 shadow dark:bg-gray-900">
          <Typography.H3 className="mb-4 font-bold">
            <Trans>Top Alumni by Pledges</Trans>
          </Typography.H3>
          <ul className="m-0 list-none space-y-2 p-0 text-sm">
            {metrics.topAlumni.length > 0 ? (
              metrics.topAlumni.map((alumni: RankedItem, index: number) => (
                <li
                  key={alumni.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-b-0 dark:border-gray-700"
                >
                  <span>
                    {index + 1}. {alumni.name || t('Unknown User')}
                  </span>
                  <span className="font-semibold">
                    {formatNumber(alumni.count)} {t('Pledges')}
                  </span>
                </li>
              ))
            ) : (
              <Typography.Paragraph className="text-gray-500">
                <Trans>No data available.</Trans>
              </Typography.Paragraph>
            )}
          </ul>
        </div>
      </div>
      <div className="rounded-lg bg-gray-100 p-6 shadow dark:bg-gray-900">
        <MetricLineChart
          data={alumniGrowthChartData}
          xAxisLabel={t('Date')}
          yAxisLabel={t('New Alumni')}
        />
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props = {};
  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale);
    props = { ...props, ...translations };
  }
  return { props };
};

export default SuperAdminDashboardPage;
