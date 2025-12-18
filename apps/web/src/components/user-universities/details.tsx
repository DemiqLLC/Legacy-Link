import { useQuery } from '@tanstack/react-query';
import { Trans, useTranslation } from 'next-i18next';
import React, { useState } from 'react';

import { useGetRecord, useGetUserProfileByUserId } from '@/client-common/sdk';
import type { LegacyRingLevelEnum } from '@/common-types/index';
import { useSessionUser } from '@/components/user/user-context';
import type {
  DbUniversity,
  DbUser,
  DbUserProfile,
  DbUserUniversities,
} from '@/db/schema';
import { Button, FieldDisplay, SideModal } from '@/theme/index';
import { Typography } from '@/ui/typography';
import {
  getLocalizedEmploymentStatus,
  getLocalizedGenderIdentity,
  getLocalizedGivingInspiration,
  getLocalizedGivingType,
  getLocalizedImportantCause,
  getLocalizedIncomeRange,
  getLocalizedIndustry,
  getLocalizedInterestedInFund,
  getLocalizedLegacyRingLevel,
  getLocalizedRacialEthnicBackground,
  getLocalizedRecognitionPreference,
  getLocalizedRelationshipStatus,
} from '@/utils/localization';

import { LegacyRingModal } from './legacy-ring-modal';
import { RingIndicator } from './ring-indicator';

type UserUniversityDetailsProps = {
  isOpen: boolean;
  onClose: () => void;
  userUniversities: DbUserUniversities;
};

export const UserUniversityDetails: React.FC<UserUniversityDetailsProps> = ({
  isOpen,
  onClose,
  userUniversities,
}) => {
  const { t } = useTranslation();
  const { user } = useSessionUser();
  const [isLegacyRingModalOpen, setIsLegacyRingModalOpen] = useState(false);
  const { data: userUniversitiesData } = useQuery({
    queryKey: [
      'userUniversities',
      userUniversities?.userId,
      userUniversities?.universityId,
    ],
    queryFn: () => userUniversities,
    enabled: !!userUniversities,
    initialData: userUniversities,
  });

  const currentUserUniversities = userUniversitiesData ?? userUniversities;

  const { data: userData } = useGetRecord(
    'users',
    currentUserUniversities?.userId || ''
  ) as {
    data: DbUser;
  };

  const { data: universityData } = useGetRecord(
    'university',
    currentUserUniversities?.universityId || ''
  ) as { data: DbUniversity };

  const { data: userProfileData } = useGetUserProfileByUserId({
    userId: currentUserUniversities?.userId,
  }) as unknown as { data: DbUserProfile };

  return (
    <>
      <SideModal
        isOpen={isOpen}
        onClose={onClose}
        title={<Trans>Alumni Details</Trans>}
        overlay
      >
        {user && user?.isSuperAdmin && (
          <div className="mb-4 flex justify-end">
            <Button
              onClick={() => setIsLegacyRingModalOpen(true)}
              variant="secondary"
            >
              <Trans>Add Legacy Ring</Trans>
            </Button>
          </div>
        )}
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <Typography.H4 className="mb-2">
            {t('General Information')}
          </Typography.H4>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <FieldDisplay
              label="ID"
              value={userProfileData?.legacyLinkId ?? '-'}
            />
            <FieldDisplay label={t('Name')} value={userData?.name ?? '-'} />
            <FieldDisplay label={t('Email')} value={userData?.email ?? '-'} />
            <FieldDisplay
              label={t('Status')}
              value={userData?.active ? t('Active') : t('Inactive')}
            />
            <FieldDisplay
              label={t('University')}
              value={universityData?.name}
            />
            <FieldDisplay
              label={t('Role')}
              value={currentUserUniversities?.role}
            />
            <FieldDisplay
              label={t('Legacy Ring')}
              value={
                currentUserUniversities?.ringLevel ? (
                  <div className="flex items-center gap-2">
                    <span>
                      {getLocalizedLegacyRingLevel(
                        t,
                        currentUserUniversities.ringLevel
                      )}
                    </span>
                    <RingIndicator
                      ringLevel={
                        currentUserUniversities.ringLevel as LegacyRingLevelEnum
                      }
                    />
                  </div>
                ) : (
                  t('Not defined')
                )
              }
            />
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <Typography.H4 className="mb-2">
            {t('Profile Information')}
          </Typography.H4>

          {userProfileData && typeof userProfileData === 'object' ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <FieldDisplay
                label={t('Legacy Links ID')}
                value={userProfileData.legacyLinkId ?? '-'}
              />
              <FieldDisplay
                label={t('Graduation Year')}
                value={userProfileData.graduationYear ?? '-'}
              />
              <FieldDisplay
                label={t('Degree Major')}
                value={userProfileData.degreeMajor ?? '-'}
              />
              <FieldDisplay
                label={t('City & State')}
                value={userProfileData.cityState ?? '-'}
              />
              <FieldDisplay
                label={t('Country')}
                value={userProfileData.country ?? '-'}
              />
              <FieldDisplay
                label={t('Employment Status')}
                value={
                  userProfileData.employmentStatus
                    ? getLocalizedEmploymentStatus(
                        t,
                        userProfileData.employmentStatus
                      )
                    : '-'
                }
              />
              <FieldDisplay
                label={t('Industry')}
                value={
                  userProfileData.industry
                    ? getLocalizedIndustry(t, userProfileData.industry)
                    : '-'
                }
              />
              <FieldDisplay
                label={t('Occupation')}
                value={userProfileData.occupation ?? '-'}
              />
              <FieldDisplay
                label={t('Notify Giving Opportunities')}
                value={
                  userProfileData.notifyGivingOpportunities ? t('Yes') : t('No')
                }
              />
              {userProfileData.hometownAtEnrollment && (
                <FieldDisplay
                  label={t('Hometown at Enrollment')}
                  value={userProfileData.hometownAtEnrollment}
                />
              )}

              {userProfileData.genderIdentity && (
                <FieldDisplay
                  label={t('Gender Identity')}
                  value={getLocalizedGenderIdentity(
                    t,
                    userProfileData.genderIdentity
                  )}
                />
              )}

              {userProfileData.racialEthnicBackground?.length ? (
                <FieldDisplay
                  label={t('Racial / Ethnic Background')}
                  value={userProfileData.racialEthnicBackground
                    .map((r) => getLocalizedRacialEthnicBackground(t, r))
                    .join(', ')}
                />
              ) : null}

              {userProfileData.firstGenerationGraduate != null && (
                <FieldDisplay
                  label={t('First Generation Graduate')}
                  value={
                    userProfileData.firstGenerationGraduate ? t('Yes') : t('No')
                  }
                />
              )}

              {userProfileData.relationshipStatus && (
                <FieldDisplay
                  label={t('Relationship Status')}
                  value={getLocalizedRelationshipStatus(
                    t,
                    userProfileData.relationshipStatus
                  )}
                />
              )}

              {userProfileData.dependentsInCollege != null && (
                <FieldDisplay
                  label={t('Dependents in College')}
                  value={
                    userProfileData.dependentsInCollege ? t('Yes') : t('No')
                  }
                />
              )}

              {userProfileData.employer && (
                <FieldDisplay
                  label={t('Employer')}
                  value={userProfileData.employer}
                />
              )}

              {userProfileData.incomeRange && (
                <FieldDisplay
                  label={t('Income Range')}
                  value={getLocalizedIncomeRange(
                    t,
                    userProfileData.incomeRange
                  )}
                />
              )}

              {userProfileData.educationGivingPercentage != null && (
                <FieldDisplay
                  label={t('Education Giving Percentage')}
                  value={`${userProfileData.educationGivingPercentage}%`}
                />
              )}

              {userProfileData.lifetimeGiving != null && (
                <FieldDisplay
                  label={t('Lifetime Giving')}
                  value={`$${Number(userProfileData.lifetimeGiving).toLocaleString()}`}
                />
              )}

              {userProfileData.givingInspiration?.length ? (
                <FieldDisplay
                  label={t('Giving Inspiration')}
                  value={userProfileData.givingInspiration
                    .map((g) => getLocalizedGivingInspiration(t, g))
                    .join(', ')}
                />
              ) : null}

              {userProfileData.legacyDefinition && (
                <FieldDisplay
                  label={t('Legacy Definition')}
                  value={userProfileData.legacyDefinition}
                />
              )}

              {userProfileData.importantCauses?.length ? (
                <FieldDisplay
                  label={t('Important Causes')}
                  value={userProfileData.importantCauses
                    .map((c) => getLocalizedImportantCause(t, c))
                    .join(', ')}
                />
              ) : null}

              {userProfileData.anonymousGiving != null && (
                <FieldDisplay
                  label={t('Anonymous Giving')}
                  value={userProfileData.anonymousGiving ? t('Yes') : t('No')}
                />
              )}

              {userProfileData.givingTypes?.length ? (
                <FieldDisplay
                  label={t('Giving Types')}
                  value={userProfileData.givingTypes
                    .map((g) => getLocalizedGivingType(t, g))
                    .join(', ')}
                />
              ) : null}

              {userProfileData.mentorshipHours != null && (
                <FieldDisplay
                  label={t('Mentorship Hours')}
                  value={`${userProfileData.mentorshipHours}h`}
                />
              )}

              {userProfileData.hasCurrentContributions != null && (
                <FieldDisplay
                  label={t('Has Current Contributions')}
                  value={
                    userProfileData.hasCurrentContributions ? t('Yes') : t('No')
                  }
                />
              )}

              {userProfileData.interestedInFund && (
                <FieldDisplay
                  label={t('Interested in Fund')}
                  value={getLocalizedInterestedInFund(
                    t,
                    userProfileData.interestedInFund
                  )}
                />
              )}

              {userProfileData.willingToMentor != null && (
                <FieldDisplay
                  label={t('Willing to Mentor')}
                  value={userProfileData.willingToMentor ? t('Yes') : t('No')}
                />
              )}

              {userProfileData.wantsAlumniConnections != null && (
                <FieldDisplay
                  label={t('Wants Alumni Connections')}
                  value={
                    userProfileData.wantsAlumniConnections ? t('Yes') : t('No')
                  }
                />
              )}

              {userProfileData.interestedInEvents != null && (
                <FieldDisplay
                  label={t('Interested in Events')}
                  value={
                    userProfileData.interestedInEvents ? t('Yes') : t('No')
                  }
                />
              )}

              {userProfileData.recognitionPreferences?.length ? (
                <FieldDisplay
                  label={t('Recognition Preferences')}
                  value={userProfileData.recognitionPreferences
                    .map((r) => getLocalizedRecognitionPreference(t, r))
                    .join(', ')}
                />
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('No profile information available')}
            </p>
          )}
        </div>
      </SideModal>
      <LegacyRingModal
        open={isLegacyRingModalOpen}
        onOpenChange={setIsLegacyRingModalOpen}
        userId={currentUserUniversities?.userId}
        universityId={currentUserUniversities?.universityId}
        userName={userData?.name}
      />
    </>
  );
};
