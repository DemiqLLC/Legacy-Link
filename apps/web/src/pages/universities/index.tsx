import { createColumnHelper } from '@tanstack/react-table';
import type { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { AlgoliaTable, AlgoliaTableWrapper } from '@/components/algolia-table';
import { UniversityDetails } from '@/components/university/details';
import type { DbUniversity } from '@/db/schema';
import { Button } from '@/theme/index';
import type { NextPageWithLayout } from '@/types/next';
import { AlgoliaTableColumnHeader } from '@/ui/algolia-table/algolia-column-header';

export type University = DbUniversity;

const columnsHelper = createColumnHelper<University>();

type UseColumnsProps = {
  handleRowClick: (universityData: DbUniversity) => void;
};

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
      columnsHelper.accessor('name', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('Name')} />
        ),
        enableHiding: true,
      }),
    ],
    [handleRowClick, t]
  );
};

const UniversityPageContent: FC = () => {
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<DbUniversity>();

  const handleRowClick = (universityData: DbUniversity): void => {
    setSelectedUniversity(universityData);
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
          searchPlaceholder={t('Search By Name')}
          hasViewOptions
        />
      </div>
      <UniversityDetails
        isOpen={isModalOpen}
        onClose={(): void => setIsModalOpen(false)}
        universityData={selectedUniversity as DbUniversity}
      />
    </div>
  );
};

const UniversityPage: NextPageWithLayout = () => {
  return (
    <AlgoliaTableWrapper indexName="university">
      <UniversityPageContent />
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

export default UniversityPage;
