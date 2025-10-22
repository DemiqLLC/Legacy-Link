import { createColumnHelper } from '@tanstack/react-table';
import type { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { useGetRecord } from '@/client-common/sdk';
import { AlgoliaTable, AlgoliaTableWrapper } from '@/components/algolia-table';
import { UserUniversityDetails } from '@/components/user-universities/details';
import type { DbUserUniversities } from '@/db/schema';
import { Button } from '@/theme/index';
import type { NextPageWithLayout } from '@/types/next';
import { AlgoliaTableColumnHeader } from '@/ui/algolia-table/algolia-column-header';
import { getLocalizedLegacyRingLevel } from '@/utils/localization';

const UserUniversitiesCell: FC<{ userId: string }> = ({ userId }) => {
  const { data } = useGetRecord('users', userId);

  if (data && typeof data === 'object' && 'name' in data) {
    return <span>{(data as { name: string }).name}</span>;
  }

  return <span>{userId.substring(0, 8)}...</span>;
};

const UserEmailCell: FC<{ userId: string }> = ({ userId }) => {
  const { data } = useGetRecord('users', userId);

  if (data && typeof data === 'object' && 'email' in data) {
    return <span>{(data as { email: string }).email}</span>;
  }

  return <span>-</span>;
};

const UniversityNameCell: FC<{ universityId: string }> = ({ universityId }) => {
  const { data } = useGetRecord('university', universityId);

  if (data && typeof data === 'object' && 'name' in data) {
    return <span>{(data as { name: string }).name}</span>;
  }

  return <span>{universityId.substring(0, 8)}...</span>;
};

type UseColumnsProps = {
  handleRowClick: (userUniversitiesData: DbUserUniversities) => void;
};

const columnsHelper = createColumnHelper<DbUserUniversities>();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useColumns = ({ handleRowClick }: UseColumnsProps) => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      columnsHelper.accessor('userId', {
        id: 'userUniversities-userName',
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('Name')} />
        ),
        cell: ({ row }) => {
          const { userId } = row.original;
          return (
            <Button
              onClick={() => handleRowClick(row.original)}
              variant="unstyled"
            >
              <UserUniversitiesCell userId={userId} />
            </Button>
          );
        },
        enableHiding: true,
      }),
      columnsHelper.accessor('userId', {
        id: 'userUniversities-userEmail',
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('Email')} />
        ),
        cell: ({ row }) => {
          const { userId } = row.original;
          return <UserEmailCell userId={userId} />;
        },
        enableHiding: true,
      }),

      columnsHelper.accessor('universityId', {
        id: 'userUniversities-universityName',
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('University')} />
        ),
        cell: ({ row }) => {
          const { universityId } = row.original;
          return <UniversityNameCell universityId={universityId} />;
        },
        enableHiding: true,
      }),
      columnsHelper.accessor('ringLevel', {
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('Legacy Ring')} />
        ),
        cell: ({ row }) => {
          return row.original.ringLevel
            ? getLocalizedLegacyRingLevel(t, row.original.ringLevel)
            : t('Not defined');
        },
        enableHiding: true,
      }),
    ],
    [handleRowClick, t]
  );
};

const UserUniversitiesPageContent: FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedUserUniversities, setSelectedUserUniversities] =
    useState<DbUserUniversities>();

  const handleRowClick = (userUniversitiesData: DbUserUniversities): void => {
    setSelectedUserUniversities(userUniversitiesData);
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
          filters="role:alumni"
          hasViewOptions
        />
      </div>
      <UserUniversityDetails
        isOpen={isModalOpen}
        onClose={(): void => setIsModalOpen(false)}
        userUniversities={selectedUserUniversities as DbUserUniversities}
      />
    </div>
  );
};

export const UserUniversitiesPage: NextPageWithLayout = () => {
  return (
    <AlgoliaTableWrapper indexName="user_universities">
      <UserUniversitiesPageContent />
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

export default UserUniversitiesPage;
