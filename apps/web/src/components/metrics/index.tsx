import {
  useAlumniDashboard,
  useFetchMetrics,
} from '@meltstudio/client-common/src/sdk';
import { LegacyRingLevelEnum } from '@meltstudio/types';
import { ChevronDown, ChevronUp, Star, Trophy } from 'lucide-react';
import type { TFunction } from 'next-i18next';
import { Trans, useTranslation } from 'next-i18next';
import { useState } from 'react';

import { useSessionUser } from '@/components/user/user-context';
import { Typography } from '@/ui/typography';
import { MetricLineChart, PieChart } from '@/ui/utils';

type FormattedPledge = {
  id: string;
  date: string;
  pledgeType: string | null;
  universityName: string | null;
  givingOpportunityName: string | null;
};

type PledgesExpandableCardProps = {
  total: number;
  monetaryPledges: FormattedPledge[];
  nonMonetaryPledges: FormattedPledge[];
};

const PledgesExpandableCard: React.FC<PledgesExpandableCardProps> = ({
  total,
  monetaryPledges,
  nonMonetaryPledges,
}) => {
  const { t } = useTranslation();
  const [openMonetary, setOpenMonetary] = useState(false);
  const [openNonMonetary, setOpenNonMonetary] = useState(false);

  return (
    <div className="rounded-xl bg-gray-100 p-6 text-white shadow  dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <Typography.Paragraph className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {t('Total Pledges Made')}
        </Typography.Paragraph>
        <div className="rounded-full bg-purple-800 p-3">
          <Trophy className="size-6 text-purple-400" />
        </div>
      </div>

      <Typography.H3 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">
        {total}
      </Typography.H3>

      <div className="mt-4">
        <button
          type="button"
          className="flex w-full justify-between text-left text-purple-400"
          onClick={() => setOpenMonetary(!openMonetary)}
        >
          <span>{t('Monetary Pledges')}</span>
          {openMonetary ? <ChevronUp /> : <ChevronDown />}
        </button>
        {openMonetary && (
          <ul className="ml-2 mt-2 space-y-1 text-sm text-gray-400">
            {monetaryPledges.length > 0 ? (
              monetaryPledges.map((p) => (
                <li key={p.id}>
                  {p.givingOpportunityName || t('Unknown Opportunity')} –{' '}
                  {p.universityName || t('Unknown University')} (
                  {new Date(p.date).toLocaleDateString()})
                </li>
              ))
            ) : (
              <li>{t('No monetary pledges yet.')}</li>
            )}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <button
          type="button"
          className="flex w-full justify-between text-left text-green-400"
          onClick={() => setOpenNonMonetary(!openNonMonetary)}
        >
          <span>{t('Non-Monetary Pledges')}</span>
          {openNonMonetary ? <ChevronUp /> : <ChevronDown />}
        </button>
        {openNonMonetary && (
          <ul className="ml-2 mt-2 space-y-1 text-sm text-gray-400">
            {nonMonetaryPledges.length > 0 ? (
              nonMonetaryPledges.map((p) => (
                <li key={p.id}>
                  {p.givingOpportunityName || t('Unknown Opportunity')} –{' '}
                  {p.universityName || t('Unknown University')} (
                  {new Date(p.date).toLocaleDateString()})
                </li>
              ))
            ) : (
              <li>{t('No non-monetary pledges yet.')}</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

type Metric = {
  date: string;
  count: number;
};

export const MetricsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { selectedUniversity } = useSessionUser();

  const {
    data: userData,
    error: userError,
    isLoading: isUserLoading,
  } = useFetchMetrics({
    metric: 'USERS_OVER_TIME',
    universityId: selectedUniversity?.id ?? '',
  });

  if (isUserLoading) {
    return (
      <div>
        <Trans>Loading</Trans>...
      </div>
    );
  }

  if (userError) {
    return (
      <div>
        <Trans>Error loading data</Trans>.
      </div>
    );
  }

  const formattedUserData =
    userData?.map((item: Metric) => ({
      date: item.date,
      count: item.count,
    })) ?? [];

  return (
    <div className="space-y-8">
      <Typography.Paragraph>
        <Trans>Users created over time in the university</Trans>
      </Typography.Paragraph>
      <MetricLineChart
        data={formattedUserData}
        yAxisLabel={t('users')}
        xAxisLabel={t('date')}
      />
    </div>
  );
};

type ActivityFeedProps = {
  activities: FormattedPledge[];
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const { t } = useTranslation();

  return (
    <ul className="m-0 list-none p-0">
      {activities.length > 0 ? (
        activities.map((activity) => (
          <li
            key={activity.id}
            className="flex items-center space-x-3 border-b border-gray-200 py-4 last:border-b-0 dark:border-gray-700"
          >
            <div>
              <Typography.Paragraph className="font-semibold capitalize">
                {t('New Pledge')}: {activity.pledgeType || t('Unknown')}
              </Typography.Paragraph>
              <Typography.Paragraph className="text-sm text-gray-500">
                {activity.universityName || t('Unknown University')} –{' '}
                {activity.givingOpportunityName
                  ? `${t('Giving Opportunity')}: ${activity.givingOpportunityName}`
                  : ''}{' '}
                – {new Date(activity.date).toLocaleDateString()}
              </Typography.Paragraph>
            </div>
          </li>
        ))
      ) : (
        <Typography.Paragraph className="text-gray-500">
          {t('No recent activity.')}
        </Typography.Paragraph>
      )}
    </ul>
  );
};

export function getLocalizedLegacyRingLevel(
  t: TFunction,
  value: string
): string {
  const map: Record<string, string> = {
    [LegacyRingLevelEnum.RING_ONE_BUILDER]: t('Ring One Builder'),
    [LegacyRingLevelEnum.RING_TWO_ADVOCATE]: t('Ring Two Advocate'),
    [LegacyRingLevelEnum.RING_THREE_LEADER]: t('Ring Three Leader'),
    [LegacyRingLevelEnum.RING_FOUR_VISIONARY]: t('Ring Four Visionary'),
    [LegacyRingLevelEnum.RING_FIVE_LEGACY]: t('Ring Five Legacy'),
  };
  return map[value] ?? value;
}

const legacyRingOrder: LegacyRingLevelEnum[] = [
  LegacyRingLevelEnum.RING_ONE_BUILDER,
  LegacyRingLevelEnum.RING_TWO_ADVOCATE,
  LegacyRingLevelEnum.RING_THREE_LEADER,
  LegacyRingLevelEnum.RING_FOUR_VISIONARY,
  LegacyRingLevelEnum.RING_FIVE_LEGACY,
];

type LegacyRingCardProps = {
  currentRing: LegacyRingLevelEnum | null;
};

const LegacyRingCard: React.FC<LegacyRingCardProps> = ({ currentRing }) => {
  const { t } = useTranslation();

  const currentRingIndex = currentRing
    ? legacyRingOrder.indexOf(currentRing)
    : -1;
  const nextRing =
    currentRingIndex > -1 && currentRingIndex < legacyRingOrder.length - 1
      ? legacyRingOrder[currentRingIndex + 1]
      : null;

  const currentRingName = currentRing
    ? getLocalizedLegacyRingLevel(t, currentRing)
    : t('No Ring Yet');

  const nextRingName = nextRing
    ? getLocalizedLegacyRingLevel(t, nextRing)
    : null;

  return (
    <div className="h-full rounded-xl bg-gray-100 p-6 shadow dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <Typography.Paragraph className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
          {t('My Legacy Ring')}
        </Typography.Paragraph>
        <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-800">
          <Star className="size-6 text-yellow-500" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 items-start gap-4">
        <div>
          <Typography.Paragraph className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {currentRing ? t('Current Level') : t('Status')}
          </Typography.Paragraph>
          <Typography.H3 className="font-bold">{currentRingName}</Typography.H3>
        </div>

        <div>
          {nextRingName ? (
            <>
              <Typography.Paragraph className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('Next Level')}
              </Typography.Paragraph>
              <Typography.H3 className="font-bold">
                {nextRingName}
              </Typography.H3>
            </>
          ) : (
            currentRing && (
              <>
                <Typography.Paragraph className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('Status')}
                </Typography.Paragraph>
                <Typography.H3 className="font-bold text-green-500">
                  {t('Highest Level!')}
                </Typography.H3>
              </>
            )
          )}

          {!currentRing && (
            <Typography.Paragraph className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('Start by making a pledge!')}
            </Typography.Paragraph>
          )}
        </div>
      </div>
    </div>
  );
};

export const AlumniDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { data: dashboardData, error, isLoading } = useAlumniDashboard();

  if (isLoading) {
    return (
      <div>
        <Trans>Loading</Trans>...
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div>
        <Trans>Error loading data</Trans>.
      </div>
    );
  }

  const {
    totalPledges,
    legacyRingLevel,
    monetaryPledgesList,
    nonMonetaryPledgesList,
  } = dashboardData;

  const monetaryPledgesCount = monetaryPledgesList.length;
  const nonMonetaryPledgesCount = nonMonetaryPledgesList.length;

  const recentActivity = [...monetaryPledgesList, ...nonMonetaryPledgesList]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const pledgeTypeData = [
    { name: t('Monetary'), value: monetaryPledgesCount, color: '#8A2BE2' },
    {
      name: t('Non-Monetary'),
      value: nonMonetaryPledgesCount,
      color: '#32CD32',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PledgesExpandableCard
          total={totalPledges}
          monetaryPledges={monetaryPledgesList}
          nonMonetaryPledges={nonMonetaryPledgesList}
        />
        <LegacyRingCard
          currentRing={legacyRingLevel as LegacyRingLevelEnum | null}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="rounded-lg bg-gray-100 p-6 shadow dark:bg-gray-900">
            <Typography.H3 className="mb-4 font-bold">
              {t('Pledges by Type')}
            </Typography.H3>
            <PieChart data={pledgeTypeData} total={totalPledges} />
          </div>
        </div>

        <div className="h-full rounded-lg bg-gray-100 p-6 shadow dark:bg-gray-900">
          <Typography.H3 className="mb-4 font-bold">
            {t('Recent Activity')}
          </Typography.H3>
          <ActivityFeed activities={recentActivity} />
        </div>
      </div>
    </div>
  );
};
