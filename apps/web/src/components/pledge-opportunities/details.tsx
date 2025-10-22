import { Trans, useTranslation } from 'next-i18next';
import React from 'react';

import {
  useGetGivingOpportunityById,
  useGetRecord,
  useGetUniversityId,
} from '@/client-common/sdk';
import type { DbPledgeOpportunity, DbUser } from '@/db/schema';
import { FieldDisplay, SideModal } from '@/theme/index';
import { Typography } from '@/ui/typography';
import {
  getLocalizedCommunicationMethod,
  getLocalizedPledgeStatus,
  getLocalizedPledgeType,
} from '@/utils/localization';

type PledgeOpportunityDetailsProps = {
  isOpen: boolean;
  onClose: () => void;
  pledgeOpportunityData: DbPledgeOpportunity;
};

export const PledgeOpportunityDetails: React.FC<
  PledgeOpportunityDetailsProps
> = ({ isOpen, onClose, pledgeOpportunityData }) => {
  const { t } = useTranslation();

  const { data: dataUser } = useGetRecord(
    'users',
    pledgeOpportunityData?.userId
  ) as { data: DbUser };

  const { data: dataUniversity } = useGetUniversityId({
    id: pledgeOpportunityData?.universityId ?? '',
  });

  const { data: dataGivingOpportunity } = useGetGivingOpportunityById({
    id: pledgeOpportunityData?.givingOpportunityId ?? '',
  });

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title={<Trans>Pledge Opportunity Details</Trans>}
      overlay
    >
      <div className="space-y-6">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <Typography.H4 className="mb-4">
            {t('Contact Information')}
          </Typography.H4>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <FieldDisplay label={t('Name')} value={dataUser?.name} />
            <FieldDisplay
              label={t('Email')}
              value={pledgeOpportunityData?.email}
            />
            <FieldDisplay
              label={t('Phone Number')}
              value={pledgeOpportunityData?.phoneNumber ?? ''}
            />
            <FieldDisplay
              label={t('Preferred Communication')}
              value={getLocalizedCommunicationMethod(
                t,
                pledgeOpportunityData?.preferredCommunicationMethod
              )}
            />
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <Typography.H4 className="mb-4">
            {t('Pledge Information')}
          </Typography.H4>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <FieldDisplay
              label="ID"
              value={pledgeOpportunityData?.referenceCode}
            />
            <FieldDisplay
              label={t('Status')}
              value={getLocalizedPledgeStatus(t, pledgeOpportunityData?.status)}
            />
            <FieldDisplay
              label={t('Pledge Type')}
              value={getLocalizedPledgeType(
                t,
                pledgeOpportunityData?.pledgeType
              )}
            />
            <div className="md:col-span-2">
              <FieldDisplay
                label={t('Reason for Interest')}
                value={pledgeOpportunityData?.reasonForInterest || '-'}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <Typography.H4 className="mb-4">
            {t('Giving Opportunity')}
          </Typography.H4>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <FieldDisplay
              label="ID"
              value={dataGivingOpportunity?.referenceCode}
            />
            <FieldDisplay
              label={t('Opportunity Name')}
              value={dataGivingOpportunity?.name}
            />
            <FieldDisplay
              label={t('Goal Amount')}
              value={
                dataGivingOpportunity?.goalAmount
                  ? `$${parseFloat(
                      dataGivingOpportunity?.goalAmount
                    ).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : '-'
              }
            />
            <div className="md:col-span-2">
              <FieldDisplay
                label={t('Description')}
                value={dataGivingOpportunity?.description}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <Typography.H4 className="mb-4">
            {t('University Information')}
          </Typography.H4>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <FieldDisplay label="ID" value={dataUniversity?.referenceCode} />
            <FieldDisplay
              label={t('University Name')}
              value={dataUniversity?.name}
            />
          </div>
        </div>
      </div>
    </SideModal>
  );
};
