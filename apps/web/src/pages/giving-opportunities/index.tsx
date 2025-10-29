import { createColumnHelper } from '@tanstack/react-table';
import type { GetServerSideProps } from 'next';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { AlgoliaTable, AlgoliaTableWrapper } from '@/components/algolia-table';
import { GivingOpportunityDetails } from '@/components/giving-opportunities/details';
import { PledgeInterestModal } from '@/components/pledge-opportunities/pledge-interest-modal';
import type { DbGivingOpportunities, DbUniversity } from '@/db/schema';
import { Button } from '@/theme/index';
import type { NextPageWithLayout } from '@/types/next';
import { AlgoliaTableColumnHeader } from '@/ui/algolia-table/algolia-column-header';
import { handleDate } from '@/utils/date-utils';

export type GivingOpportunities = DbGivingOpportunities & {
  university: DbUniversity;
};

type UseColumnsProps = {
  handleRowClick: (givingOpportunityData: DbGivingOpportunities) => void;
  handlePledgeClick: (givingOpportunityData: GivingOpportunities) => void;
};

const columnsHelper = createColumnHelper<GivingOpportunities>();

// type of the columns object is very specific, it's better to allow TS to infer the correct type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useColumns = ({ handleRowClick, handlePledgeClick }: UseColumnsProps) => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      columnsHelper.accessor('referenceCode', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => {
          return (
            <Button
              onClick={() => handleRowClick(row.original)}
              variant="unstyled"
            >
              {row.original.referenceCode}
            </Button>
          );
        },
        enableHiding: true,
      }),
      columnsHelper.accessor('name', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('Name')} />
        ),
        enableHiding: true,
      }),
      columnsHelper.accessor('description', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('Description')} />
        ),
        enableHiding: true,
      }),
      columnsHelper.accessor('universityId', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('University')} />
        ),
        cell: ({ row }) => {
          const { name } = row.original.university;
          return name;
        },
        enableHiding: true,
      }),
      columnsHelper.accessor('createdAt', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader
            column={column}
            title={t('Creation Date')}
          />
        ),
        cell: ({ row }) => {
          return handleDate(row.original.createdAt, false);
        },
        enableSorting: true,
        enableHiding: true,
      }),
      columnsHelper.accessor('goalAmount', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('Goal Amount')} />
        ),
        cell: ({ row }) => {
          const value = row.original.goalAmount;
          const numValue =
            typeof value === 'string' ? Number(value) : (value as number);

          if (!Number.isNaN(numValue)) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(numValue);
          }

          return value ?? '-';
        },
        enableHiding: true,
      }),
      columnsHelper.display({
        id: 'actions',
        header: t('Actions'),
        cell: ({ row }) => {
          return (
            <Button onClick={() => handlePledgeClick(row.original)}>
              <Trans>Pledge Interest</Trans>
            </Button>
          );
        },
      }),
    ],
    [handleRowClick, handlePledgeClick, t]
  );
};

const GivingOpportunitiesPageContent: FC = () => {
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] =
    useState<DbGivingOpportunities>();
  const [selectedPledgeOpportunity, setSelectedPledgeOpportunity] =
    useState<GivingOpportunities>();

  const handleRowClick = (
    givingOpportunityData: DbGivingOpportunities
  ): void => {
    setSelectedUniversity(givingOpportunityData);
    setIsModalOpen(true);
  };

  const handlePledgeClick = (
    givingOpportunityData: GivingOpportunities
  ): void => {
    setSelectedPledgeOpportunity(givingOpportunityData);
    setIsPledgeModalOpen(true);
  };

  const columns = useColumns({ handleRowClick, handlePledgeClick });

  return (
    <div>
      <div>
        <AlgoliaTable
          columns={columns}
          withSearch
          withPagination
          filters={`isActive:${true}`}
          searchPlaceholder={t('Search By Name')}
          hasViewOptions
        />
      </div>
      {selectedUniversity && (
        <GivingOpportunityDetails
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          givingOpportunityData={selectedUniversity}
        />
      )}
      {selectedPledgeOpportunity && (
        <PledgeInterestModal
          open={isPledgeModalOpen}
          onOpenChange={setIsPledgeModalOpen}
          givingOpportunity={selectedPledgeOpportunity}
        />
      )}
    </div>
  );
};

const GivingOpportunitiesPage: NextPageWithLayout = () => {
  return (
    <AlgoliaTableWrapper indexName="giving_opportunities">
      <GivingOpportunitiesPageContent />
    </AlgoliaTableWrapper>
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

export default GivingOpportunitiesPage;
