import { authOptions } from '@meltstudio/auth';
import {
  formatZodiosError,
  useCreateUserProfile,
  useCreateUserUniversity,
  useGetInvitation,
  useGetRecords,
  useMemberAcceptInvitation,
  useSignUp,
} from '@meltstudio/client-common';
import { useSearchParams } from '@meltstudio/core';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { getServerSession } from 'next-auth';
import { signIn } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import { z } from 'zod';

import type { ApiCommonErrorType } from '@/api/routers/def-utils';
import { ErrorComponent } from '@/components/wizard-example/error-component';
import { FinalAlumniComponent } from '@/components/wizard-example/final-alumni-component';
import type { DbUniversity } from '@/db/schema';
import { AuthLayoutAlumni } from '@/layouts/auth-layout-alumni';
import type { NextPageWithLayout } from '@/types/next';
import type { WizardCompletionResult } from '@/ui/index';
import { Wizard, WizardCompletionAction, WizardFormStep } from '@/ui/index';

const SignUpPageAlumni: NextPageWithLayout = () => {
  const { t } = useTranslation();
  const params = useSearchParams();
  const token = params.get('token') || '';
  const { data: dataUniversity } = useGetRecords({
    model: 'university',
    pagination: {
      pageSize: 0,
    },
  });

  const BasicAccountSchema = z
    .object({
      name: z.string().min(1, t('Name is required')),
      email: z
        .string()
        .email()
        .transform((v) => v.trim())
        .transform((v) => v.toLowerCase()),
      password1: z.string().min(8, t('Password must be at least 8 characters')),
      password2: z.string().min(8, t('Password must be at least 8 characters')),
    })
    .superRefine((val, ctx) => {
      if (val.password1 !== val.password2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("Passwords don't match"),
          path: ['password2'],
        });
      }
    });

  const CoreIdentitySchema = z.object({
    graduationYear: z.coerce.number().min(1900).max(2100),
    degreeMajor: z.string().min(1, t('Degree Major is required')),
    university: z.string().nonempty(),
  });

  const MotivationGivingIdentitySchema = z.object({
    givingInspiration: z.array(z.string()).optional(),
    legacyDefinition: z.string().optional(),
    importantCauses: z.array(z.string()).optional(),
    anonymousGiving: z.boolean().optional(),
  });

  const EngagementSchema = z.object({
    givingTypes: z.array(z.string()).optional(),
    mentorshipHours: z.coerce.number().optional(),
    lifetimeGiving: z.coerce.number().optional(),
    notifyGivingOpportunities: z.boolean(),
  });

  const DemographicsSchema = z.object({
    cityState: z.string().min(1, t('City/State is required')),
    country: z.string().min(1, t('Country is required')),
    hometownAtEnrollment: z.string().optional(),
    genderIdentity: z
      .union([
        z.enum(['male', 'female', 'non_binary', 'prefer_not_say', 'other']),
        z.literal(''),
        z.undefined(),
      ])
      .optional(),
    racialEthnicBackground: z.array(z.string()).optional(),
    firstGenerationGraduate: z.boolean().optional(),
    relationshipStatus: z
      .union([
        z.enum([
          'single',
          'married',
          'domestic_partnership',
          'divorced',
          'widowed',
          'prefer_not_say',
        ]),
        z.literal(''),
        z.undefined(),
      ])
      .optional(),
    dependentsInCollege: z.boolean().optional(),
  });

  const ProfessionalSchema = z.object({
    employmentStatus: z.string().min(1, t('Employment Status is required')),
    industry: z.string().min(1, t('Industry is required')),
    occupation: z.string().optional().or(z.literal('')),
    employer: z.string().optional().or(z.literal('')),
    incomeRange: z
      .union([
        z.enum([
          'under_50k',
          '50k_100k',
          '100k_150k',
          '150k_250k',
          'over_250k',
          'prefer_not_say',
        ]),
        z.literal(''),
        z.undefined(),
      ])
      .optional(),
    educationGivingPercentage: z.coerce.number().optional(),
    hasCurrentContributions: z.boolean().optional(),
    interestedInFund: z
      .union([
        z.enum(['yes', 'maybe', 'not_now']),
        z.literal(''),
        z.undefined(),
      ])
      .optional(),
  });

  const CommunityConnectionSchema = z.object({
    willingToMentor: z.boolean().optional(),
    wantsAlumniConnections: z.boolean().optional(),
    interestedInEvents: z.boolean().optional(),
    recognitionPreferences: z.array(z.string()).optional(),
  });

  const wizardSchema = z.object({
    step1: BasicAccountSchema,
    step2: CoreIdentitySchema,
    step3: MotivationGivingIdentitySchema,
    step4: EngagementSchema,
    step5: DemographicsSchema,
    step6: ProfessionalSchema,
    step7: CommunityConnectionSchema,
  });

  const signUp = useSignUp();

  const getInvitation = useGetInvitation({
    queries: { token },
  });
  const acceptInvitation = useMemberAcceptInvitation();
  const userUniversity = useCreateUserUniversity();
  const createUserProfile = useCreateUserProfile();

  const [isCreating, setIsCreating] = useState(false);

  const finalComponent = (data: z.infer<typeof wizardSchema>): JSX.Element => {
    return (
      <FinalAlumniComponent
        fullName={data.step1.name}
        graduationYear={data.step2.graduationYear}
        degree={data.step2.degreeMajor}
      />
    );
  };

  const handleCreate = async (
    data: z.infer<typeof wizardSchema>
  ): Promise<
    WizardCompletionResult<
      { userId: string; name: string },
      ApiCommonErrorType | null
    >
  > => {
    const { step1, step2, step3, step4, step5, step6, step7 } = data;
    const emailValue = step1.email.trim().toLowerCase();
    const emptyToNull = (value?: string | null): string | null => value || null;
    try {
      setIsCreating(true);

      let userId: string;

      if (getInvitation.data) {
        const acceptResult = await acceptInvitation.mutateAsync({
          name: step1.name,
          password: step1.password1,
          token,
        });
        userId = acceptResult.user.id;
      } else {
        const signUpResult = await signUp.mutateAsync({
          name: step1.name,
          email: emailValue,
          password: step1.password1,
        });
        userId = signUpResult.user.id;
      }

      await userUniversity.mutateAsync({
        universityId: step2.university,
        email: emailValue,
        role: 'alumni',
      });

      await createUserProfile.mutateAsync({
        userId,
        universityId: step2.university,
        graduationYear: Number(step2.graduationYear),
        degreeMajor: step2.degreeMajor,
        givingInspiration: step3.givingInspiration ?? null,
        legacyDefinition: step3.legacyDefinition ?? null,
        importantCauses: step3.importantCauses ?? null,
        anonymousGiving: step3.anonymousGiving ?? null,
        givingTypes: step4.givingTypes ?? null,
        mentorshipHours: step4.mentorshipHours ?? null,
        lifetimeGiving: step4.lifetimeGiving ?? null,
        notifyGivingOpportunities: step4.notifyGivingOpportunities ?? null,
        cityState: step5.cityState,
        country: step5.country,
        hometownAtEnrollment: step5.hometownAtEnrollment ?? null,
        genderIdentity: emptyToNull(step5.genderIdentity),
        racialEthnicBackground: step5.racialEthnicBackground ?? null,
        firstGenerationGraduate: step5.firstGenerationGraduate ?? null,
        relationshipStatus: emptyToNull(step5.relationshipStatus),
        dependentsInCollege: step5.dependentsInCollege ?? null,
        employmentStatus: step6.employmentStatus,
        industry: step6.industry,
        occupation: step6.occupation ?? '',
        employer: step6.employer ?? null,
        incomeRange: emptyToNull(step6.incomeRange),
        educationGivingPercentage: step6.educationGivingPercentage ?? null,
        hasCurrentContributions: step6.hasCurrentContributions ?? null,
        interestedInFund: emptyToNull(step6.interestedInFund),
        willingToMentor: step7.willingToMentor ?? null,
        wantsAlumniConnections: step7.wantsAlumniConnections ?? null,
        interestedInEvents: step7.interestedInEvents ?? null,
        recognitionPreferences: step7.recognitionPreferences ?? null,
      });

      setTimeout(async () => {
        await signIn('credentials', {
          email: emailValue,
          password: step1.password1,
          redirect: true,
          callbackUrl: '/',
        });
      }, 2000);

      return {
        action: WizardCompletionAction.goToSuccess,
        response: { userId, name: step1.name },
      };
    } catch (error) {
      const zodiosError = error as Error;
      const e = formatZodiosError('signUp', zodiosError);
      return { action: WizardCompletionAction.goToError, error: e };
    } finally {
      setIsCreating(false);
    }
  };

  const givingInspirationOptions = [
    { label: t('Gratitude'), value: 'gratitude' },
    { label: t('Equity'), value: 'equity' },
    { label: t('Innovation'), value: 'innovation' },
    { label: t('Legacy'), value: 'legacy' },
    { label: t('Social Impact'), value: 'social_impact' },
    { label: t('Community Building'), value: 'community_building' },
  ];

  const importantCausesOptions = [
    { label: t('Scholarships'), value: 'scholarships' },
    { label: t('Research'), value: 'research' },
    { label: t('Athletics'), value: 'athletics' },
    { label: t('Arts & Culture'), value: 'arts_culture' },
    { label: t('Infrastructure'), value: 'infrastructure' },
    { label: t('Student Support Services'), value: 'student_support' },
    { label: t('DEI Initiatives'), value: 'dei_initiatives' },
    { label: t('Environmental Sustainability'), value: 'environmental' },
  ];

  const givingTypesOptions = [
    { label: t('Financial'), value: 'financial' },
    { label: t('Mentorship'), value: 'mentorship' },
    { label: t('Volunteering'), value: 'volunteering' },
    { label: t('Advocacy'), value: 'advocacy' },
  ];

  const employmentStatusOptions = [
    { label: t('Employed Full-time'), value: 'employed_full_time' },
    { label: t('Employed Part-time'), value: 'employed_part_time' },
    { label: t('Self-employed'), value: 'self_employed' },
    { label: t('Unemployed'), value: 'unemployed' },
    { label: t('Student'), value: 'student' },
    { label: t('Retired'), value: 'retired' },
  ];

  const industryOptions = [
    { label: t('Technology'), value: 'technology' },
    { label: t('Healthcare'), value: 'healthcare' },
    { label: t('Finance'), value: 'finance' },
    { label: t('Education'), value: 'education' },
    { label: t('Manufacturing'), value: 'manufacturing' },
    { label: t('Retail'), value: 'retail' },
    { label: t('Consulting'), value: 'consulting' },
    { label: t('Government'), value: 'government' },
    { label: t('Non-profit'), value: 'non_profit' },
    { label: t('Other'), value: 'other' },
  ];

  const incomeRangeOptions = [
    { label: t('Less than $50,000'), value: 'under_50k' },
    { label: '$50,000 - $100,000', value: '50k_100k' },
    { label: '$100,000 - $150,000', value: '100k_150k' },
    { label: '$150,000 - $250,000', value: '150k_250k' },
    { label: '$250,000+', value: 'over_250k' },
    { label: t('Prefer not to say'), value: 'prefer_not_say' },
  ];

  const genderIdentityOptions = [
    { label: t('Male'), value: 'male' },
    { label: t('Female'), value: 'female' },
    { label: t('Non-binary'), value: 'non_binary' },
    { label: t('Prefer not to say'), value: 'prefer_not_say' },
    { label: t('Other'), value: 'other' },
  ];

  const racialEthnicBackgroundOptions = [
    { label: t('Asian'), value: 'asian' },
    { label: t('Black or African American'), value: 'black' },
    { label: t('Hispanic or Latino'), value: 'hispanic' },
    { label: t('White'), value: 'white' },
    { label: t('Native American or Alaska Native'), value: 'native_american' },
    {
      label: t('Native Hawaiian or Pacific Islander'),
      value: 'pacific_islander',
    },
    { label: t('Two or More Races'), value: 'multiracial' },
    { label: t('Prefer not to say'), value: 'prefer_not_say' },
  ];

  const relationshipStatusOptions = [
    { label: t('Single'), value: 'single' },
    { label: t('Married'), value: 'married' },
    { label: t('Domestic Partnership'), value: 'domestic_partnership' },
    { label: t('Divorced'), value: 'divorced' },
    { label: t('Widowed'), value: 'widowed' },
    { label: t('Prefer not to say'), value: 'prefer_not_say' },
  ];

  const interestedInFundOptions = [
    { label: t('Yes'), value: 'yes' },
    { label: t('Maybe'), value: 'maybe' },
    { label: t('Not Now'), value: 'not_now' },
  ];

  const recognitionPreferencesOptions = [
    { label: t('Digital Badge'), value: 'digital_badge' },
    { label: t('Newsletter Feature'), value: 'newsletter_feature' },
    { label: t('Website Recognition'), value: 'website_recognition' },
    { label: t('Annual Report'), value: 'annual_report' },
    { label: t('Prefer Anonymous'), value: 'prefer_anonymous' },
  ];

  return (
    <Wizard<
      typeof wizardSchema,
      { userId: string; name: string },
      ApiCommonErrorType | null
    >
      onCompleted={(data) => handleCreate(data)}
      renderCompletionComponent={(data) => finalComponent(data)}
      renderErrorComponent={(data, error, onTryAgain) => {
        return (
          <ErrorComponent
            name={data.step1.name}
            errorMessage={error?.error}
            onTryAgain={onTryAgain}
          />
        );
      }}
      completionLoading={
        signUp.isLoading ||
        acceptInvitation.isLoading ||
        userUniversity.isLoading ||
        createUserProfile.isLoading ||
        isCreating
      }
      isSignUp
    >
      <WizardFormStep
        label={t('Basic Account Information')}
        schema={BasicAccountSchema}
        fields={[
          {
            name: 'name',
            type: 'text',
            label: t('Full Name'),
            size: 'full',
            required: true,
          },
          {
            name: 'email',
            type: 'text',
            label: t('E-mail'),
            size: 'full',
            required: true,
          },
          {
            name: 'password1',
            type: 'password',
            label: t('Password'),
            size: 'full',
            required: true,
          },
          {
            name: 'password2',
            type: 'password',
            label: t('Confirm Password'),
            size: 'full',
            required: true,
          },
        ]}
        defaultValues={{
          name: '',
          email: getInvitation.data?.email || '',
          password1: '',
          password2: '',
        }}
        stepKey="step1"
      />

      <WizardFormStep
        label={t('Core Identity')}
        schema={CoreIdentitySchema}
        fields={[
          {
            name: 'graduationYear',
            type: 'number',
            label: t('Graduation Year'),
            placeholder: t('Enter your graduation year'),
            size: 'full',
            required: true,
          },
          {
            name: 'degreeMajor',
            type: 'text',
            label: t('Degree Major'),
            placeholder: t('Enter your degree major'),
            size: 'full',
            required: true,
          },
          {
            name: 'university',
            type: 'select',
            label: t('University'),
            size: 'full',
            options: dataUniversity?.items.map((university) => ({
              label: (university as DbUniversity).name,
              value: (university as DbUniversity).id,
            })),
            required: true,
          },
        ]}
        defaultValues={{
          graduationYear: new Date().getFullYear(),
          degreeMajor: '',
          university: '',
        }}
        stepKey="step2"
      />

      <WizardFormStep
        label={t('Motivation & Giving Identity')}
        schema={MotivationGivingIdentitySchema}
        fields={[
          {
            name: 'givingInspiration',
            type: 'multiselect',
            label: t('What inspires your giving?'),
            size: 'full',
            options: givingInspirationOptions,
          },
          {
            name: 'legacyDefinition',
            type: 'textarea',
            label: t('How do you define your legacy?'),
            placeholder: t(
              'Share your thoughts about the legacy you want to create...'
            ),
            size: 'full',
          },
          {
            name: 'importantCauses',
            type: 'multiselect',
            label: t('What causes are most important to you?'),
            size: 'full',
            options: importantCausesOptions,
          },
          {
            name: 'anonymousGiving',
            type: 'checkbox',
            label: t('Would you like your giving to remain anonymous?'),
            size: 'full',
            checkboxMode: 'boolean',
          },
        ]}
        defaultValues={{
          givingInspiration: [],
          legacyDefinition: '',
          importantCauses: [],
          anonymousGiving: false,
        }}
        stepKey="step3"
      />

      <WizardFormStep
        label={t('Engagement & Contribution Types')}
        schema={EngagementSchema}
        fields={[
          {
            name: 'givingTypes',
            type: 'multiselect',
            label: t('How have you given back since graduating?'),
            size: 'full',
            options: givingTypesOptions,
          },
          {
            name: 'mentorshipHours',
            type: 'number',
            label: t('Estimated hours of mentorship or volunteering'),
            placeholder: t('Enter approximate hours'),
            size: 'full',
          },
          {
            name: 'lifetimeGiving',
            type: 'number',
            label: t('Total lifetime giving (if known)'),
            placeholder: t('Enter amount (optional)'),
            size: 'full',
          },
          {
            name: 'notifyGivingOpportunities',
            type: 'checkbox',
            label: t(
              'Would you like to be notified about new giving opportunities?'
            ),
            size: 'full',
            checkboxMode: 'boolean',
          },
        ]}
        defaultValues={{
          givingTypes: [],
          mentorshipHours: 0,
          lifetimeGiving: 0,
          notifyGivingOpportunities: true,
        }}
        stepKey="step4"
      />

      <WizardFormStep
        label={t('Demographics')}
        schema={DemographicsSchema}
        fields={[
          {
            name: 'cityState',
            type: 'text',
            label: t('City & State'),
            placeholder: t('Enter your city and state'),
            size: 'full',
            required: true,
          },
          {
            name: 'country',
            type: 'text',
            label: t('Country'),
            placeholder: t('Enter your country'),
            size: 'full',
            required: true,
          },
          {
            name: 'hometownAtEnrollment',
            type: 'text',
            label: t('Hometown at time of enrollment'),
            placeholder: t('Enter your hometown (optional)'),
            size: 'full',
          },
          {
            name: 'genderIdentity',
            type: 'select',
            label: t('Gender Identity'),
            size: 'full',
            options: genderIdentityOptions,
          },
          {
            name: 'racialEthnicBackground',
            type: 'multiselect',
            label: t('Racial / Ethnic Background'),
            size: 'full',
            options: racialEthnicBackgroundOptions,
          },
          {
            name: 'firstGenerationGraduate',
            type: 'checkbox',
            label: t('First-Generation College Graduate?'),
            size: 'full',
            checkboxMode: 'boolean',
          },
          {
            name: 'relationshipStatus',
            type: 'select',
            label: t('Relationship Status'),
            size: 'full',
            options: relationshipStatusOptions,
          },
          {
            name: 'dependentsInCollege',
            type: 'checkbox',
            label: t('Dependents in or approaching college?'),
            size: 'full',
            checkboxMode: 'boolean',
          },
        ]}
        defaultValues={{
          cityState: '',
          country: '',
          hometownAtEnrollment: '',
          genderIdentity: '',
          racialEthnicBackground: [],
          firstGenerationGraduate: false,
          relationshipStatus: '',
          dependentsInCollege: false,
        }}
        stepKey="step5"
      />

      <WizardFormStep
        label={t('Professional & Economic Profile')}
        schema={ProfessionalSchema}
        fields={[
          {
            name: 'employmentStatus',
            type: 'select',
            label: t('Employment Status'),
            size: 'full',
            options: employmentStatusOptions,
            required: true,
          },
          {
            name: 'industry',
            type: 'select',
            label: t('Industry'),
            size: 'full',
            options: industryOptions,
            required: true,
          },
          {
            name: 'occupation',
            type: 'text',
            label: t('Occupation'),
            placeholder: t('Enter your occupation (optional)'),
            size: 'full',
          },
          {
            name: 'employer',
            type: 'text',
            label: t('Employer'),
            placeholder: t('Enter your employer (optional)'),
            size: 'full',
          },
          {
            name: 'incomeRange',
            type: 'select',
            label: t('Estimated Annual Income Range'),
            size: 'full',
            options: incomeRangeOptions,
          },
          {
            name: 'educationGivingPercentage',
            type: 'number',
            label: t('% of giving typically directed to education causes'),
            placeholder: t('Enter percentage (0-100)'),
            size: 'full',
          },
          {
            name: 'hasCurrentContributions',
            type: 'checkbox',
            label: t('Current contributions (scholarships, endowments)'),
            size: 'full',
            checkboxMode: 'boolean',
          },
          {
            name: 'interestedInFund',
            type: 'select',
            label: t('Interested in creating or naming a fund?'),
            size: 'full',
            options: interestedInFundOptions,
          },
        ]}
        defaultValues={{
          employmentStatus: '',
          industry: '',
          occupation: '',
          employer: '',
          incomeRange: '',
          educationGivingPercentage: undefined,
          hasCurrentContributions: false,
          interestedInFund: '',
        }}
        stepKey="step6"
      />

      <WizardFormStep
        label={t('Community & Connection')}
        schema={CommunityConnectionSchema}
        fields={[
          {
            name: 'willingToMentor',
            type: 'checkbox',
            label: t('Would you be interested in mentoring students?'),
            size: 'full',
            checkboxMode: 'boolean',
          },
          {
            name: 'wantsAlumniConnections',
            type: 'checkbox',
            label: t(
              'Would you like to connect with other alumni in your field or city?'
            ),
            size: 'full',
            checkboxMode: 'boolean',
          },
          {
            name: 'interestedInEvents',
            type: 'checkbox',
            label: t(
              'Are you interested in attending or hosting alumni events?'
            ),
            size: 'full',
            checkboxMode: 'boolean',
          },
          {
            name: 'recognitionPreferences',
            type: 'multiselect',
            label: t(
              'How would you like to be recognized for your contributions?'
            ),
            size: 'full',
            options: recognitionPreferencesOptions,
          },
        ]}
        defaultValues={{
          willingToMentor: false,
          wantsAlumniConnections: false,
          interestedInEvents: false,
          recognitionPreferences: [],
        }}
        stepKey="step7"
      />
    </Wizard>
  );
};

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<unknown>> {
  const session = await getServerSession(context.req, context.res, authOptions);
  let props = {};

  if (session != null) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  if (context.locale != null) {
    const translations = await serverSideTranslations(context.locale);

    props = { ...props, ...translations };
  }

  return { props };
}

SignUpPageAlumni.Layout = AuthLayoutAlumni;

export default SignUpPageAlumni;
