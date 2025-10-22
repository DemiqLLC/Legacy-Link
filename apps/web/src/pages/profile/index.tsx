import { FeatureFlag, FeatureFlagWrapper } from '@meltstudio/feature-flags';
import type { GetServerSideProps } from 'next';
import { Trans } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { useGetUserProfileByUserId } from '@/client-common/sdk';
import { Loading } from '@/components/common/loading';
import { BasicDataForm } from '@/components/profile-settings/basic-data-form';
import { ChangePasswordForm } from '@/components/profile-settings/password-form';
import { TwoFactSettings } from '@/components/two-auth-factor-setup';
import { useSessionUser } from '@/components/user/user-context';
import type { DbUserProfile } from '@/db/schema';
import type { NextPageWithLayout } from '@/types/next';
import { Typography } from '@/ui/typography';

const ProfilePage: NextPageWithLayout = () => {
  const { user, profileImage } = useSessionUser();
  const { data: userProfileData } = useGetUserProfileByUserId({
    userId: user?.id ?? '',
  }) as unknown as { data: DbUserProfile };

  if (!user) return <Loading />;

  return (
    <div className="mx-[2px]">
      <Typography.H2>
        <Trans>Your data</Trans>
      </Typography.H2>
      <BasicDataForm
        user={user}
        userProfile={userProfileData}
        profileImageQuery={profileImage}
      />
      <br />
      <Typography.H2>
        <Trans>Change your password</Trans>
      </Typography.H2>
      <ChangePasswordForm />
      <FeatureFlagWrapper flag={FeatureFlag.TWO_FACTOR_AUTH}>
        <TwoFactSettings is2faEnabled={user?.is2faEnabled || false} />
      </FeatureFlagWrapper>
    </div>
  );
};

const UserSettingsPage: NextPageWithLayout = () => {
  return (
    <div className="rounded-lg">
      <ProfilePage />
    </div>
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

export default UserSettingsPage;
