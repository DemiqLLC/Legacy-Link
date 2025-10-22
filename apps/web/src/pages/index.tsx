import { Typography } from '@meltstudio/ui';
import type { GetServerSideProps } from 'next';
import { Trans } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { Loading } from '@/components/common/loading';
import { useSessionUser } from '@/components/user/user-context';
import type { NextPageWithLayout } from '@/types/next';

const HomePage: NextPageWithLayout = () => {
  const { user, isLoading } = useSessionUser();

  if (!user || isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Typography.H2>
        <Trans>Metrics</Trans>
      </Typography.H2>
      {/* <div>
        <MetricsDashboard />
      </div> */}
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

export default HomePage;
