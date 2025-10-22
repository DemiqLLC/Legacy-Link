import {
  formatZodiosError,
  useGetRecord,
  useUpdateRecord,
} from '@meltstudio/client-common';
import { Skeleton, useToast } from '@meltstudio/theme';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Trans, useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { z } from 'zod';

import { ErrorMessageBox } from '@/components/error-message-box';
import type { ModelConfigData } from '@/config/super-admin';
import type { DbPledgeOpportunity } from '@/db/schema';
import { useModelByRoute } from '@/hooks/use-model-by-route';
import { useRelationsByModel } from '@/hooks/use-relations-by-model';
import type { NextPageWithLayout } from '@/types/next';
import {
  addMinLengthValidationToRequiredStrings,
  useFormHelper,
} from '@/ui/form-hook-helper';
import { buildRecordRequest } from '@/utils/build-record-request';
import { getLocalizedModelName } from '@/utils/localization';

type AdminRecordComponentProps = {
  model: ModelConfigData;
  recordId: string;
};
const AdminRecordComponent: React.FC<AdminRecordComponentProps> = ({
  recordId,
  model,
}) => {
  const { t } = useTranslation();
  // Fetch the record data
  const { data, error, isLoading } = useGetRecord(model.name, recordId);
  // Setup the update mutation
  const updateRecord = useUpdateRecord({
    params: { model: model.name || '', id: recordId },
  });

  const formFieldsWithRelations = useRelationsByModel(model);

  const filteredFields =
    model.name === 'pledgeOpportunities'
      ? formFieldsWithRelations.filter((field) => field.name === 'status')
      : formFieldsWithRelations;

  const { toast } = useToast();

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const getSchema = () => {
    if (model.name === 'pledgeOpportunities') {
      return model.schema.partial().required({ status: true });
    }
    return addMinLengthValidationToRequiredStrings(
      model.schema.extend({
        password: z.string().min(8).or(z.literal('')).nullable().optional(),
        flag: z.string().optional(),
      })
    );
  };

  const { formComponent } = useFormHelper(
    {
      schema: getSchema(),
      fields: filteredFields,
      isLoading: updateRecord.isLoading,
      submitContent: 'Update',
      onSubmit: (values) => {
        const submitData =
          model.name === 'pledgeOpportunities'
            ? {
                ...data,
                status: values.status as string,
              }
            : values;
        const { data: basicData, relations } = buildRecordRequest(
          model,
          submitData
        );
        updateRecord.mutate(
          {
            data: basicData,
            relations,
          },
          {
            onSuccess: () => {
              toast({
                title: t('Record updated!'),
                description: t('The record has been updated successfully'),
              });
            },
            onError: (zodiosError) => {
              const e = formatZodiosError('updateRecord', zodiosError, {
                method: 'post',
                path: `/api/admin/:model`,
              });
              let message = t('There was an error updating the record');
              let description = '';
              if (e) {
                message = e.error;
                description = JSON.stringify(e.validationErrors);
              }
              toast({
                title: message,
                description,
              });
            },
          }
        );
      },
      centered: true,
    },
    {
      values:
        model.name === 'pledgeOpportunities'
          ? { status: (data as DbPledgeOpportunity)?.status }
          : {
              ...data,
              password: '',
            },
    }
  );

  // Handle loading state
  if (isLoading) {
    return (
      <Skeleton
        style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
      >
        <Trans>Loading</Trans>...
      </Skeleton>
    );
  }

  const errorString = formatZodiosError('getRecord', error)?.error;

  // Handle error state
  if (errorString) {
    return <div style={{ marginTop: '20px' }}>{errorString}</div>;
  }

  // If no data found
  if (!data) {
    return <div style={{ marginTop: '20px' }}>Not found</div>;
  }

  // Render the form with the update option
  return (
    <div style={{ marginTop: '20px', padding: '20px' }}>
      <div className="mb-6 py-4">
        <h1 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
          <Trans>Update</Trans> {getLocalizedModelName(t, model.name)}
        </h1>
      </div>
      {formComponent}
    </div>
  );
};

const AdminRecordPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const recordId = typeof id === 'string' ? id : '';

  const { model, isReady } = useModelByRoute();

  if (!isReady) {
    return null;
  }

  if (!model || !recordId) {
    return <ErrorMessageBox error="Record not found" />;
  }

  return <AdminRecordComponent model={model} recordId={recordId} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props = {};

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale);

    props = { ...props, ...translations };
  }

  return { props };
};

export default AdminRecordPage;
