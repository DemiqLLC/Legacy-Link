import { Trans, useTranslation } from 'next-i18next';
import React, { useState } from 'react';

import {
  useGetGivingOpportunitiesByUniversityId,
  useGetUniversityId,
} from '@/client-common/sdk';
import { PledgeInterestModal } from '@/components/pledge-opportunities/pledge-interest-modal';
import { useSessionUser } from '@/components/user/user-context';
import type { DbGivingOpportunities, DbUniversity } from '@/db/schema';
import type { GivingOpportunities } from '@/pages/giving-opportunities';
import { Button, FieldDisplay, SideModal } from '@/theme/index';
import { Typography } from '@/ui/typography';

type UniversityDetailsProps = {
  isOpen: boolean;
  onClose: () => void;
  universityData: DbUniversity;
};

export const UniversityDetails: React.FC<UniversityDetailsProps> = ({
  isOpen,
  onClose,
  universityData,
}) => {
  const { user } = useSessionUser();
  const { t } = useTranslation();
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [selectedPledgeOpportunity, setSelectedPledgeOpportunity] =
    useState<GivingOpportunities>();

  const { data: datavalues } = useGetUniversityId({
    id: universityData?.id ?? '',
  });

  const { data: dataGivingOpportunities } =
    useGetGivingOpportunitiesByUniversityId({
      universityId: universityData?.id ?? '',
    });

  const handlePledgeClick = (opportunity: DbGivingOpportunities): void => {
    const givingOpportunity: GivingOpportunities = {
      ...opportunity,
      university: universityData,
    };
    setSelectedPledgeOpportunity(givingOpportunity);
    setIsPledgeModalOpen(true);
  };

  return (
    <>
      <SideModal
        isOpen={isOpen}
        onClose={onClose}
        title={<Trans>University Details</Trans>}
        overlay
      >
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <Typography.H4 className="mb-2 ">
            {t('General Information')}
          </Typography.H4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <FieldDisplay label={t('Name')} value={datavalues?.name} />
            <FieldDisplay
              label={t('Description')}
              value={datavalues?.description}
            />
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <Typography.H4 className="mb-4">
            {t('University Giving Opportunities')}
          </Typography.H4>

          {dataGivingOpportunities && dataGivingOpportunities.length > 0 ? (
            <div className="space-y-6">
              {dataGivingOpportunities.map((opportunity, index) => (
                <div
                  key={opportunity.id}
                  className="rounded-lg border-2 border-gray-300 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-900"
                >
                  <div className="mb-3 flex items-center justify-between gap-2 border-b border-gray-200 pb-2 dark:border-gray-700">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {t('Opportunity')} #{index + 1}
                    </span>
                    {!user?.isSuperAdmin && (
                      <Button onClick={() => handlePledgeClick(opportunity)}>
                        <Trans>Pledge Interest</Trans>
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FieldDisplay label={t('Name')} value={opportunity.name} />
                    <FieldDisplay
                      label={t('Goal Amount')}
                      value={
                        opportunity.goalAmount
                          ? `$${parseFloat(opportunity.goalAmount).toLocaleString()}`
                          : '-'
                      }
                    />
                    <div className="md:col-span-2">
                      <FieldDisplay
                        label={t('Description')}
                        value={opportunity.description}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('No giving opportunities available')}
            </p>
          )}
        </div>
      </SideModal>

      {selectedPledgeOpportunity && (
        <PledgeInterestModal
          open={isPledgeModalOpen}
          onOpenChange={setIsPledgeModalOpen}
          givingOpportunity={selectedPledgeOpportunity}
        />
      )}
    </>
  );
};
