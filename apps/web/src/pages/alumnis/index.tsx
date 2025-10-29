import { createColumnHelper } from '@tanstack/react-table';
import type { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { useGetFile, useGetRecord } from '@/client-common/sdk';
import type { LegacyRingLevelEnum } from '@/common-types/index';
import { AlgoliaTable, AlgoliaTableWrapper } from '@/components/algolia-table';
import { UserUniversityDetails } from '@/components/user-universities/details';
import { RingIndicator } from '@/components/user-universities/ring-indicator';
import type { DbUser, DbUserUniversities } from '@/db/schema';
import { Button } from '@/theme/index';
import type { NextPageWithLayout } from '@/types/next';
import { AlgoliaTableColumnHeader } from '@/ui/algolia-table/algolia-column-header';
import { UserAvatar } from '@/ui/index';
import { getLocalizedLegacyRingLevel } from '@/utils/localization';

const UserInfoCell: FC<{
  userId: string;
  ringLevel: LegacyRingLevelEnum | null;
}> = ({ userId, ringLevel }) => {
  const { data: dataUser } = useGetRecord('users', userId) as { data: DbUser };

  const profileImageKey = dataUser?.profileImage ?? '';
  const { data: profileImageData } = useGetFile(
    { id: profileImageKey },
    { enabled: !!profileImageKey }
  );

  const profileImageUrl = profileImageData?.url || null;

  const userName =
    dataUser && typeof dataUser === 'object' && 'name' in dataUser
      ? (dataUser as { name: string }).name
      : `${userId.substring(0, 8)}...`;

  return (
    <div className="flex flex-col items-start gap-2">
      {dataUser && (
        <UserAvatar
          user={{
            name: dataUser.name,
            image: profileImageUrl,
          }}
          className="size-12"
        />
      )}

      <div className="flex items-center gap-2">
        <span>{userName}</span>
        <RingIndicator ringLevel={ringLevel} />
      </div>
    </div>
  );
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
        id: 'userUniversities-userInfo',
        header: ({ column }) => (
          <AlgoliaTableColumnHeader column={column} title={t('User')} />
        ),
        cell: ({ row }) => {
          const { userId, ringLevel } = row.original;

          return (
            <Button
              onClick={() => handleRowClick(row.original)}
              variant="unstyled"
              className="py-9"
            >
              <UserInfoCell
                userId={userId}
                ringLevel={ringLevel as LegacyRingLevelEnum}
              />
            </Button>
          );
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
          return row.original.ringLevel ? (
            <div className="flex items-center gap-2">
              <span>
                {getLocalizedLegacyRingLevel(t, row.original.ringLevel)}
              </span>

              <RingIndicator
                ringLevel={row.original.ringLevel as LegacyRingLevelEnum}
              />
            </div>
          ) : (
            <span>{t('Not defined')}</span>
          );
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
