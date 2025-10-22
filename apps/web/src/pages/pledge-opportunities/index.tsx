import { createColumnHelper } from '@tanstack/react-table';
import type { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { AlgoliaTable, AlgoliaTableWrapper } from '@/components/algolia-table';
import { PledgeOpportunityDetails } from '@/components/pledge-opportunities/details';
import { useSessionUser } from '@/components/user/user-context';
import type { DbPledgeOpportunity } from '@/db/schema';
import { Button } from '@/theme/index';
import type { NextPageWithLayout } from '@/types/next';
import { AlgoliaTableColumnHeader } from '@/ui/algolia-table/algolia-column-header';
import {
  getLocalizedPledgeStatus,
  getLocalizedPledgeType,
} from '@/utils/localization';

type UseColumnsProps = {
  handleRowClick: (pledgeOpportunityData: DbPledgeOpportunity) => void;
};

const columnsHelper = createColumnHelper<DbPledgeOpportunity>();

// type of the columns object is very specific, it's better to allow TS to infer the correct type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useColumns = ({ handleRowClick }: UseColumnsProps) => {
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
      columnsHelper.accessor('email', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('Email')} />
        ),
        enableHiding: true,
      }),
      columnsHelper.accessor('status', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('Status')} />
        ),
        cell: ({ row }) => {
          return getLocalizedPledgeStatus(t, row.original.status);
        },
        enableSorting: true,
        enableHiding: true,
      }),
      columnsHelper.accessor('pledgeType', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('Pledge Type')} />
        ),
        cell: ({ row }) => {
          return getLocalizedPledgeType(t, row.original.pledgeType);
        },
        enableSorting: true,
        enableHiding: true,
      }),
    ],
    [handleRowClick, t]
  );
};

const DbPledgeOpportunityPageContent: FC = () => {
  const { t } = useTranslation();
  const { user } = useSessionUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedDbPledgeOpportunity, setSelectedDbPledgeOpportunity] =
    useState<DbPledgeOpportunity>();

  const handleRowClick = (pledgeOpportunityData: DbPledgeOpportunity): void => {
    setSelectedDbPledgeOpportunity(pledgeOpportunityData);
    setIsModalOpen(true);
  };

  const columns = useColumns({ handleRowClick });

  return (
    <div>
      <div>
        <AlgoliaTable
          columns={columns}
          withSearch
          withPagination
          filters={user ? `userId:${user.id}` : ''}
          searchPlaceholder={t('Search By Name')}
          hasViewOptions
        />
      </div>
      <PledgeOpportunityDetails
        isOpen={isModalOpen}
        onClose={(): void => setIsModalOpen(false)}
        pledgeOpportunityData={
          selectedDbPledgeOpportunity as DbPledgeOpportunity
        }
      />
    </div>
  );
};

const DbPledgeOpportunityPage: NextPageWithLayout = () => {
  return (
    <AlgoliaTableWrapper indexName="pledge_opportunities">
      <DbPledgeOpportunityPageContent />
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

export default DbPledgeOpportunityPage;
