import {
  formatZodiosError,
  useCreateRecord,
  useCreateUniversityProfile,
} from '@meltstudio/client-common';
import type { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { z } from 'zod';

import type { ApiCommonErrorType } from '@/api/routers/def-utils';
import { UserRoleEnum } from '@/common-types/auth';
import { ErrorComponent } from '@/components/wizard-example/error-component';
import { FinalComponent } from '@/components/wizard-example/final-component';
import { WizardUniversityProfileStep1 } from '@/components/wizard-example/step-1';
import type { NextPageWithLayout } from '@/types/next';
import type { WizardCompletionResult } from '@/ui/wizard';
import {
  Wizard,
  WizardCompletionAction,
  WizardFormStep,
  WizardStep,
} from '@/ui/wizard';

type WizardUniversitySaveResponse = { id: string; name: string };

const WizardUniversityProfilePage: NextPageWithLayout = () => {
  const { t } = useTranslation();

  const UniversityProfileSchema = z.object({
    name: z.string().min(1, t('Name is required')),
    universityAbbreviation: z.string().min(1, t('University Code is required')),
    description: z.string().min(1, t('Description is required')),
  });

  const LogoSchema = z.object({
    logo: z.instanceof(File),
  });

  const SocialMediaSchema = z.object({
    instagram: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    webpage: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
  });

  const MembersSchema = z.object({
    members: z.array(
      z.object({
        email: z.string().email(),
        role: z.nativeEnum(UserRoleEnum),
      })
    ),
  });

  const wizardSchema = z.object({
    step2: UniversityProfileSchema,
    step3: LogoSchema,
    step4: SocialMediaSchema,
    step5: MembersSchema,
  });

  const createRecord = useCreateRecord({
    params: { model: 'university' },
  });
  const createUniversityProfile = useCreateUniversityProfile();
  // const { uploadFile } = useFileInput();
  // const createDefaultFeatureFlags = useCreateFeatureFlag();
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Final component to show the data
  const finalComponent = (
    data: z.infer<typeof wizardSchema>
    // response: WizardUniversitySaveResponse
  ): JSX.Element => {
    // const selectedMembersByName = data.step5?.members.map(({ email }) => email);
    return (
      <FinalComponent
        name={data.step2.name}
        description={data.step2.description}
        // members={selectedMembersByName}
        // universityID={response.id}
        // universityName={response.name}
      />
    );
  };

  const handleCreate = async (
    data: z.infer<typeof wizardSchema>
  ): Promise<
    WizardCompletionResult<
      WizardUniversitySaveResponse,
      ApiCommonErrorType | null
    >
  > => {
    const { step2 } = data;
    const values = {
      name: step2.name,
      universityAbbreviation: step2.universityAbbreviation,
    };
    try {
      setIsUploadingFile(true);
      // const { key: logoID } = await uploadFile(step3.logo);
      setIsUploadingFile(false);
      const result = (await createRecord.mutateAsync({
        data: values,
      })) as { id: string };
      // await createUniversityProfile.mutateAsync({
      //   universityId: result.id,
      //   description: step2.description,
      //   logoFile: logoID,
      //   companyUrl: step4.webpage || undefined,
      //   facebookUrl: step4.facebook || undefined,
      //   instagramUrl: step4.instagram || undefined,
      //   linkedinUrl: step4.linkedin || undefined,
      //   members: step5.members,
      //   includeCreatorInUniversity: true,
      // });
      // await createDefaultFeatureFlags.mutateAsync({
      //   universityId: result.id,
      // });
      return {
        action: WizardCompletionAction.goToSuccess,
        response: { id: result.id, name: values.name },
      };
    } catch (error) {
      const zodiosError = error as Error;
      const e = formatZodiosError('createUniversityProfile', zodiosError);
      return { action: WizardCompletionAction.goToError, error: e };
    } finally {
      setIsUploadingFile(false);
    }
  };
  return (
    <Wizard<
      typeof wizardSchema,
      WizardUniversitySaveResponse,
      ApiCommonErrorType | null
    >
      onCompleted={(
        data
      ): Promise<
        WizardCompletionResult<
          WizardUniversitySaveResponse,
          ApiCommonErrorType | null
        >
      > => handleCreate(data)}
      renderCompletionComponent={(data): JSX.Element => finalComponent(data)}
      renderErrorComponent={(data, error, onTryAgain): ReactElement => {
        return (
          <ErrorComponent
            name={data.step2.name}
            errorMessage={error?.error}
            onTryAgain={onTryAgain}
          />
        );
      }}
      completionLoading={
        createRecord.isLoading ||
        createUniversityProfile.isLoading ||
        isUploadingFile
      }
    >
      <WizardStep label={t('Step 1')}>
        <WizardUniversityProfileStep1 />
      </WizardStep>
      <WizardFormStep
        label={t('Name, Description and Abbreviation')}
        schema={UniversityProfileSchema}
        fields={[
          {
            name: 'name',
            type: 'text',
            label: t('University name'),
            placeholder: t('Enter a name for the university'),
            size: 'full',
            required: true,
          },
          {
            name: 'description',
            type: 'textarea',
            label: t('University Description'),
            placeholder: t('Enter a description for the university'),
            size: 'full',
            required: true,
          },
          {
            name: 'universityAbbreviation',
            type: 'text',
            label: t('University Abbreviation'),
            placeholder: t('Write the abbreviation in capital letters'),
            size: 'full',
            required: true,
          },
        ]}
        defaultValues={{
          name: '',
          universityAbbreviation: '',
          description: '',
        }}
        stepKey="step2"
      />
      {/* <WizardFormStep
        label={t('Add your logo')}
        schema={LogoSchema}
        fields={[
          {
            name: 'logo',
            type: 'file',
            label: t('Add your logo'),
            size: 'full',
            enableCrop: true,
            required: true,
          },
        ]}
        defaultValues={{
          logo: null,
        }}
        stepKey="step3"
      />
      <WizardFormStep
        label={t('Adding social media links')}
        schema={SocialMediaSchema}
        fields={[
          {
            name: 'instagram',
            type: 'text',
            label: 'Instagram',
            size: 'full',
          },
          {
            name: 'facebook',
            type: 'text',
            label: 'Facebook',
            size: 'full',
          },
          {
            name: 'webpage',
            type: 'text',
            label: t('Web page'),
            size: 'full',
          },
          {
            name: 'linkedin',
            type: 'text',
            label: 'Linkedin',
            size: 'full',
          },
        ]}
        defaultValues={{
          instagram: '',
          facebook: '',
          webpage: '',
          linkedin: '',
        }}
        stepKey="step4"
      />
      <WizardFormStep
        label={t('Add Members')}
        schema={MembersSchema}
        fields={[
          {
            name: 'members',
            type: 'array',
            label: t('Members'),
            size: 'full',
            children: [
              {
                name: 'email',
                type: 'text',
                label: t('Email'),
                size: 'half',
                required: true,
              },
              {
                name: 'role',
                type: 'select',
                label: t('Role'),
                size: 'half',
                options: userRoleList.map((role) => ({
                  label: getUserRoleName(t, role as UserRoleEnum),
                  value: role,
                })),
                required: true,
              },
            ],
            required: true,
          },
        ]}
        defaultValues={{
          members: [],
        }}
        stepKey="step5"
      /> */}
    </Wizard>
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

export default WizardUniversityProfilePage;
