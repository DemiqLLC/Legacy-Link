import { Trans, useTranslation } from 'next-i18next';
import React from 'react';

import {
  useGetGivingOpportunityById,
  useGetPledgeOpportunitiesByGivingId,
} from '@/client-common/sdk';
import { useSessionUser } from '@/components/user/user-context';
import type { DbGivingOpportunities } from '@/db/schema';
import { FieldDisplay, SideModal } from '@/theme/index';
import { Typography } from '@/ui/typography';
import {
  getLocalizedCommunicationMethod,
  getLocalizedPledgeStatus,
  getLocalizedPledgeType,
} from '@/utils/localization';

type GivingOpportunityDetailsProps = {
  isOpen: boolean;
  onClose: () => void;
  givingOpportunityData: DbGivingOpportunities;
};

export const GivingOpportunityDetails: React.FC<
  GivingOpportunityDetailsProps
> = ({ isOpen, onClose, givingOpportunityData }) => {
  const { t } = useTranslation();
  const { user } = useSessionUser();

  const { data: datavalues } = useGetGivingOpportunityById({
    id: givingOpportunityData.id,
  });

  const { data: dataPledgeOpportunities } = useGetPledgeOpportunitiesByGivingId(
    {
      givingOpportunityId: givingOpportunityData.id,
    }
  );

  const pledgeOpportunities = dataPledgeOpportunities ?? [];

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title={<Trans>Giving Opportunity Details</Trans>}
      overlay
    >
      <div className="space-y-6">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <Typography.H4 className="mb-4">
            {t('General Information')}
          </Typography.H4>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <FieldDisplay label="ID" value={datavalues?.referenceCode} />
            <FieldDisplay label={t('Name')} value={datavalues?.name} />
            <FieldDisplay
              label={t('Goal Amount')}
              value={
                datavalues?.goalAmount
                  ? `$${parseFloat(datavalues.goalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '-'
              }
            />
            <FieldDisplay
              label={t('University')}
              value={datavalues?.universityName}
            />
            <div className="md:col-span-2">
              <FieldDisplay
                label={t('Description')}
                value={datavalues?.description}
              />
            </div>
          </div>
        </div>

        <div>
          <Typography.H4 className="mb-4">
            {user?.isSuperAdmin
              ? t('Pledge Opportunities')
              : t('My pledge Opportunities')}
          </Typography.H4>

          {pledgeOpportunities.length > 0 ? (
            <div className="space-y-6">
              {pledgeOpportunities.map((pledge, index) => (
                <div
                  key={pledge.id}
                  className="rounded-lg border-2 border-gray-300 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900"
                >
                  <div className="mb-3 flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-700">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                      {t('Pledge')} #{index + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FieldDisplay
                      label={t('Email')}
                      value={getLocalizedCommunicationMethod(t, pledge.email)}
                    />
                    <FieldDisplay
                      label={t('Phone Number')}
                      value={pledge.phoneNumber || '-'}
                    />
                    <FieldDisplay
                      label={t('Pledge Type')}
                      value={getLocalizedPledgeType(t, pledge.pledgeType)}
                    />
                    <FieldDisplay
                      label={t('Status')}
                      value={getLocalizedPledgeStatus(t, pledge.status)}
                    />
                    <div className="md:col-span-2">
                      <FieldDisplay
                        label={t('Reason For Interest')}
                        value={pledge.reasonForInterest || '-'}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('No pledge opportunities found for this giving opportunity')}
            </p>
          )}
        </div>
      </div>
    </SideModal>
  );
};
