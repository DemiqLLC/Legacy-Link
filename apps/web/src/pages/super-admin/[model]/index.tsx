import { useGetRecord, useGetRecords } from '@meltstudio/client-common';
import { useParsedSearchParams } from '@meltstudio/core';
import { Button } from '@meltstudio/theme';
import type { DataTableColumnHeaderProps } from '@meltstudio/ui';
import {
  AlgoliaTableColumnHeader,
  DataTable,
  DataTableColumnHeader,
  useAlgoliaRefresh,
} from '@meltstudio/ui';
import type { AnyModelType } from '@meltstudio/zod-schemas';
import { Pencil1Icon } from '@radix-ui/react-icons';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import type { TFunction } from 'next-i18next';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { z } from 'zod';

import { DeleteRecord } from '@/components/admin/delete-record';
import { AlgoliaTable, AlgoliaTableWrapper } from '@/components/algolia-table';
import { GivingOpportunityDetails } from '@/components/giving-opportunities/details';
import { PledgeOpportunityDetails } from '@/components/pledge-opportunities/details';
import { UniversityDetails } from '@/components/university/details';
import { UserUniversityDetails } from '@/components/user-universities/details';
import { modelsConfig } from '@/config/super-admin';
import type {
  DbGivingOpportunities,
  DbPledgeOpportunity,
  DbUniversity,
  DbUserUniversities,
} from '@/db/schema';
import { useModelByRoute } from '@/hooks/use-model-by-route';
import type { NextPageWithLayout } from '@/types/next';
import {
  getLocalizedLegacyRingLevel,
  getLocalizedPledgeStatus,
  getLocalizedPledgeType,
} from '@/utils/localization';

const searchParamsSchema = z.object({
  pagination: z
    .object({
      pageIndex: z.number().int().nonnegative(),
      pageSize: z.number().int().positive(),
    })
    .catch({ pageIndex: 0, pageSize: 10 }),
});

const columnHelper = createColumnHelper<AnyModelType>();

const USE_ALGOLIA = false;

type UseColumnsProps = {
  modelName: string;
  urlModel: string;
  t: TFunction;
  refetch: () => void;
  onRowClick?: (data: unknown) => void;
};

const UniversityCell: FC<{ universityId: string }> = ({ universityId }) => {
  const { data } = useGetRecord('university', universityId);

  if (data && typeof data === 'object' && 'name' in data) {
    return <span>{(data as { name: string }).name}</span>;
  }

  return <span>{universityId.substring(0, 8)}...</span>;
};

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

const UserActiveCell: FC<{ userId: string }> = ({ userId }) => {
  const { data } = useGetRecord('users', userId);
  const { t } = useTranslation();

  if (data && typeof data === 'object' && 'active' in data) {
    return (
      <span>{(data as { active: boolean }).active ? t('Yes') : t('No')}</span>
    );
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

const GivingOpportunityCell: FC<{ givingOpportunityId: string }> = ({
  givingOpportunityId,
}) => {
  const { data } = useGetRecord('givingOpportunities', givingOpportunityId);

  if (data && typeof data === 'object' && 'name' in data) {
    return <span>{(data as { name: string }).name}</span>;
  }

  return <span>{givingOpportunityId.substring(0, 8)}...</span>;
};

const PledgeUserCell: FC<{ userId: string }> = ({ userId }) => {
  const { data } = useGetRecord('users', userId);

  if (data && typeof data === 'object' && 'name' in data) {
    return <span>{(data as { name: string }).name}</span>;
  }

  return <span>{userId.substring(0, 8)}...</span>;
};

const PledgeUniversityCell: FC<{ universityId: string }> = ({
  universityId,
}) => {
  const { data } = useGetRecord('university', universityId);

  if (data && typeof data === 'object' && 'name' in data) {
    return <span>{(data as { name: string }).name}</span>;
  }

  return <span>{universityId.substring(0, 8)}...</span>;
};

const useColumns = ({
  modelName,
  urlModel,
  t,
  refetch,
  onRowClick,
}: UseColumnsProps): ColumnDef<AnyModelType>[] => {
  const getHeader: () => <TData, TValue>(
    props: DataTableColumnHeaderProps<TData, TValue>
  ) => React.ReactNode = () => {
    if (USE_ALGOLIA) {
      return AlgoliaTableColumnHeader;
    } else {
      return DataTableColumnHeader;
    }
  };
  const HeaderComponent = getHeader();

  return useMemo(() => {
    const baseColumns: ColumnDef<AnyModelType>[] = [];

    if (
      ['university', 'givingOpportunities', 'pledgeOpportunities'].includes(
        modelName
      )
    ) {
      baseColumns.push(
        columnHelper.accessor('referenceCode', {
          id: `${modelName}-referenceCode`,
          header: ({ column }) => (
            <HeaderComponent column={column} title={t('ID')} />
          ),
          cell: (context) => {
            const value = context.getValue<string>();

            if (
              [
                'university',
                'givingOpportunities',
                'pledgeOpportunities',
              ].includes(modelName) &&
              onRowClick
            ) {
              return (
                <Button
                  onClick={() => onRowClick(context.row.original)}
                  variant="unstyled"
                >
                  {value || '-'}
                </Button>
              );
            }

            return value || '-';
          },
        })
      );
    }

    const fieldColumns = (modelsConfig[modelName]?.fields || [])
      .filter(
        (field) =>
          field.type !== 'manyRelation' &&
          !['password', 'id', 'referenceCode'].includes(field.key.toLowerCase())
      )
      .map((field) => {
        if (modelName === 'userUniversities' && field.key === 'userId') {
          return [
            columnHelper.accessor(field.key, {
              id: `${modelName}-userName`,
              header: ({ column }) => (
                <HeaderComponent column={column} title={t('Name')} />
              ),
              cell: (context) => {
                const userId = context.getValue<string>();

                if (onRowClick) {
                  return (
                    <Button
                      onClick={() => onRowClick(context.row.original)}
                      variant="unstyled"
                    >
                      <UserUniversitiesCell userId={userId} />
                    </Button>
                  );
                }

                return <UserUniversitiesCell userId={userId} />;
              },
            }),
            columnHelper.accessor(field.key, {
              id: `${modelName}-userEmail`,
              header: ({ column }) => (
                <HeaderComponent column={column} title={t('Email')} />
              ),
              cell: (context) => {
                const userId = context.getValue<string>();
                return <UserEmailCell userId={userId} />;
              },
            }),
            columnHelper.accessor(field.key, {
              id: `${modelName}-userActive`,
              header: ({ column }) => (
                <HeaderComponent column={column} title={t('Active')} />
              ),
              cell: (context) => {
                const userId = context.getValue<string>();
                return <UserActiveCell userId={userId} />;
              },
            }),
          ];
        }

        if (modelName === 'userUniversities' && field.key === 'universityId') {
          return columnHelper.accessor(field.key, {
            id: `${modelName}-universityName`,
            header: ({ column }) => (
              <HeaderComponent column={column} title={t('University')} />
            ),
            cell: (context) => {
              const universityId = context.getValue<string>();
              return <UniversityNameCell universityId={universityId} />;
            },
          });
        }

        if (modelName === 'userUniversities' && field.key === 'ringLevel') {
          return columnHelper.accessor(field.key, {
            id: `${modelName}-ringLevel`,
            header: ({ column }) => (
              <HeaderComponent column={column} title={t('Ring Level')} />
            ),
            cell: (context) => {
              const value = context.getValue<string | null>();
              return value
                ? getLocalizedLegacyRingLevel(t, value)
                : t('Not defined');
            },
          });
        }

        return columnHelper.accessor(field.key, {
          id: `${modelName}-${field.key}`,
          header: ({ column }) => (
            <HeaderComponent column={column} title={field.label} />
          ),
          cell: (context) => {
            const value = context.getValue<unknown>();
            if (field.type === 'boolean') {
              return value ? t('Yes') : t('No');
            }

            if (modelName === 'pledgeOpportunities') {
              if (field.key === 'userId') {
                return <PledgeUserCell userId={value as string} />;
              }

              if (field.key === 'universityId') {
                return <PledgeUniversityCell universityId={value as string} />;
              }
              if (field.key === 'givingOpportunityId') {
                return (
                  <GivingOpportunityCell
                    givingOpportunityId={value as string}
                  />
                );
              }
              if (field.key === 'status') {
                return getLocalizedPledgeStatus(t, value as string);
              }

              if (field.key === 'pledgeType') {
                return getLocalizedPledgeType(t, value as string);
              }
            }

            if (
              modelName === 'givingOpportunities' &&
              field.key === 'universityId'
            ) {
              return <UniversityCell universityId={value as string} />;
            }

            if (
              modelName === 'givingOpportunities' &&
              field.key === 'goalAmount'
            ) {
              const numValue =
                typeof value === 'string' ? Number(value) : (value as number);

              if (!Number.isNaN(numValue)) {
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(numValue);
              }

              return value;
            }

            return value;
          },
        });
      })
      .flat();

    baseColumns.push(...fieldColumns);

    if (modelName !== 'userUniversities') {
      baseColumns.push(
        columnHelper.accessor('id', {
          id: `${modelName}-actions`,
          header: ({ column }) => (
            <HeaderComponent column={column} title={t('Action')} />
          ),
          cell: (context) => {
            const id = context.getValue<string>();
            return (
              <Link href={`/super-admin/${urlModel}/${id}`}>
                <Pencil1Icon />
              </Link>
            );
          },
        })
      );
    }

    if (
      modelName !== 'globalFeatureFlags' &&
      modelName !== 'pledgeOpportunities'
    ) {
      baseColumns.push(
        columnHelper.accessor('id', {
          id: `${modelName}-delete`,
          header: ({ column }) => (
            <HeaderComponent column={column} title={t('Delete')} />
          ),
          cell: (context) => {
            const id = context.getValue<string>();
            return (
              <DeleteRecord
                data={{ model: modelName, id }}
                onSuccessfulDelete={refetch}
              />
            );
          },
        })
      );
    }

    return baseColumns;
  }, [HeaderComponent, modelName, refetch, t, urlModel, onRowClick]);
};

const AdminModelPageContent: FC = () => {
  const { model, modelName } = useModelByRoute();

  const { t } = useTranslation();

  const searchParams = useParsedSearchParams(searchParamsSchema);

  const [isGivingOpportunityModalOpen, setIsGivingOpportunityModalOpen] =
    useState(false);
  const [isUniversityModalOpen, setIsUniversityModalOpen] = useState(false);
  const [isUserUniversitiesModalOpen, setIsUserUniversitiesModalOpen] =
    useState(false);
  const [selectedGivingOpportunity, setSelectedGivingOpportunity] =
    useState<DbGivingOpportunities>();
  const [selectedUniversity, setSelectedUniversity] = useState<DbUniversity>();
  const [selectedUserUniversity, setSelectedUserUniversity] =
    useState<DbUserUniversities>();
  const [isPledgeOpportunityModalOpen, setIsPledgeOpportunityModalOpen] =
    useState(false);
  const [selectedPledgeOpportunity, setSelectedPledgeOpportunity] =
    useState<DbPledgeOpportunity>();

  const params = {
    model: modelName,
    enabled: !!model,
    pagination: {
      pageIndex: searchParams.pagination.pageIndex,
      pageSize: searchParams.pagination.pageSize,
    },
    ...(modelName === 'userUniversities' && {
      filters: {
        role: 'alumni',
      },
    }),
    ...(modelName === 'users' && {
      filters: {
        isSuperAdmin: true,
      },
    }),
  };

  const { data, error, isLoading, refetch } = useGetRecords(params);

  const { refresh } = useAlgoliaRefresh();

  const handleRowClick = (rowData: unknown): void => {
    if (modelName === 'givingOpportunities') {
      setSelectedGivingOpportunity(rowData as DbGivingOpportunities);
      setIsGivingOpportunityModalOpen(true);
    } else if (modelName === 'university') {
      setSelectedUniversity(rowData as DbUniversity);
      setIsUniversityModalOpen(true);
    } else if (modelName === 'userUniversities') {
      setSelectedUserUniversity(rowData as DbUserUniversities);
      setIsUserUniversitiesModalOpen(true);
    } else if (modelName === 'pledgeOpportunities') {
      setSelectedPledgeOpportunity(rowData as DbPledgeOpportunity);
      setIsPledgeOpportunityModalOpen(true);
    }
  };

  const columns = useColumns({
    modelName,
    urlModel: model?.url || '',
    t,
    refetch: USE_ALGOLIA ? refresh : refetch,
    onRowClick: [
      'givingOpportunities',
      'university',
      'userUniversities',
      'pledgeOpportunities',
    ].includes(modelName)
      ? handleRowClick
      : undefined,
  });

  const pageCount = data?.pageCount || 1;

  if (!model || !modelsConfig[modelName]) {
    return <div>Model not found</div>;
  }

  const excludedModels = [
    'globalFeatureFlags',
    'userUniversities',
    'pledgeOpportunities',
  ];

  const commonComponent = (
    <div className="flex items-center justify-between pb-2">
      <h1>{modelsConfig[modelName]?.displayName || t('Model')}</h1>
      <div className="flex gap-2">
        {!excludedModels.includes(modelName) && (
          <Button>
            <Link
              href={
                model.url === 'university'
                  ? '/super-admin/wizard'
                  : `/super-admin/${model.url}/create`
              }
            >
              <Trans>Create</Trans>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {commonComponent}
      {USE_ALGOLIA ? (
        <AlgoliaTable columns={columns} hasViewOptions={false} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          error={error ? error.message : null}
          loading={isLoading}
          pagination={searchParams.pagination}
          pageCount={pageCount}
        />
      )}

      {modelName === 'givingOpportunities' && selectedGivingOpportunity && (
        <GivingOpportunityDetails
          isOpen={isGivingOpportunityModalOpen}
          onClose={() => setIsGivingOpportunityModalOpen(false)}
          givingOpportunityData={selectedGivingOpportunity}
        />
      )}
      {modelName === 'university' && (
        <UniversityDetails
          isOpen={isUniversityModalOpen}
          onClose={() => setIsUniversityModalOpen(false)}
          universityData={selectedUniversity as DbUniversity}
        />
      )}
      {modelName === 'userUniversities' && (
        <UserUniversityDetails
          isOpen={isUserUniversitiesModalOpen}
          onClose={() => setIsUserUniversitiesModalOpen(false)}
          userUniversities={selectedUserUniversity as DbUserUniversities}
        />
      )}
      {modelName === 'pledgeOpportunities' && (
        <PledgeOpportunityDetails
          isOpen={isPledgeOpportunityModalOpen}
          onClose={() => setIsPledgeOpportunityModalOpen(false)}
          pledgeOpportunityData={
            selectedPledgeOpportunity as DbPledgeOpportunity
          }
        />
      )}
    </div>
  );
};

const AdminModelPage: NextPageWithLayout = () => {
  const { model, modelName, indexName } = useModelByRoute();

  if (!model || !modelsConfig[modelName]) {
    return (
      <div>
        <Trans>Model not found</Trans>
      </div>
    );
  }

  if (!indexName) {
    return (
      <div>
        <Trans>Index name not found</Trans>
      </div>
    );
  }

  return (
    <AlgoliaTableWrapper indexName={indexName} key={indexName}>
      <AdminModelPageContent />
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

export default AdminModelPage;
