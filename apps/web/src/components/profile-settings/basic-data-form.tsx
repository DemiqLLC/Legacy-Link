import type { User } from '@meltstudio/client-common';
import {
  formatZodiosError,
  useUpdateOwnUser,
  useUpdateUserProfile,
} from '@meltstudio/client-common';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { z } from 'zod';

import type { UserContextProfileImageQuery } from '@/components/user/user-context';
import { useSessionUser } from '@/components/user/user-context';
import type { DbUserProfile } from '@/db/schema';
import { useDataUrlFromFile } from '@/hooks/use-data-url-from-file';
import { useFileInput } from '@/hooks/use-file-input';
import { toast } from '@/theme/index';
import { useFormHelper } from '@/ui/form-hook-helper';
import { ImagePreview, ImagePreviewLoadErrorAction } from '@/ui/image-preview';

const profileFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Must be a valid email' }),
  photo: z.object({
    newFile: z.instanceof(File).optional(),
  }),
  graduationYear: z.coerce.number().min(1900).max(2100),
  degreeMajor: z.string().min(1, { message: 'Degree Major is required' }),
  givingInspiration: z.array(z.string()).optional(),
  legacyDefinition: z.string().optional(),
  importantCauses: z.array(z.string()).optional(),
  anonymousGiving: z.boolean().optional(),
  givingTypes: z.array(z.string()).optional(),
  mentorshipHours: z.coerce.number().optional(),
  lifetimeGiving: z.coerce.number().optional(),
  notifyGivingOpportunities: z.boolean().optional(),
  cityState: z.string().min(1, { message: 'City/State is required' }),
  country: z.string().min(1, { message: 'Country is required' }),
  hometownAtEnrollment: z.string().optional(),
  genderIdentity: z.string().optional(),
  racialEthnicBackground: z.array(z.string()).optional(),
  firstGenerationGraduate: z.boolean().optional(),
  relationshipStatus: z.string().optional(),
  dependentsInCollege: z.boolean().optional(),
  employmentStatus: z
    .string()
    .min(1, { message: 'Employment Status is required' }),
  industry: z.string().min(1, { message: 'Industry is required' }),
  occupation: z.string().optional().or(z.literal('')),
  employer: z.string().optional().or(z.literal('')),
  incomeRange: z.string().optional().or(z.literal('')),
  educationGivingPercentage: z.coerce.number().optional(),
  hasCurrentContributions: z.boolean().optional(),
  interestedInFund: z.string().optional().or(z.literal('')),
  willingToMentor: z.boolean().optional(),
  wantsAlumniConnections: z.boolean().optional(),
  interestedInEvents: z.boolean().optional(),
  recognitionPreferences: z.array(z.string()).optional(),
});

export type BasicDataFormProps = {
  user: User;
  userProfile: DbUserProfile;
  profileImageQuery: UserContextProfileImageQuery;
};

export const BasicDataForm: React.FC<BasicDataFormProps> = ({
  user,
  userProfile,
  profileImageQuery,
}) => {
  const { t } = useTranslation();
  const { update: updateSession } = useSession();
  const { refetch, selectedUniversity } = useSessionUser();
  const { uploadFile } = useFileInput();
  const [ignoreExistingPhoto, setIgnoreExistingPhoto] = useState(false);

  const existingPhotoUrl = profileImageQuery.url;

  const { mutate: updateOwnUser, isLoading: isLoadingUser } = useUpdateOwnUser(
    {
      params: { universityId: selectedUniversity?.id || '' },
    },
    {
      onError: (error) => {
        const formattedError = formatZodiosError('updateUserProfile', error);
        toast({
          title: t('Something went wrong!'),
          description: formattedError?.error,
          variant: 'destructive',
        });
      },
    }
  );

  const { mutate: updateUserProfile, isLoading: isLoadingProfile } =
    useUpdateUserProfile(
      {
        params: { userId: user.id || '' },
      },
      {
        onError: (error) => {
          toast({
            title: t('Something went wrong updating profile!'),
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );

  const isLoading = isLoadingUser || isLoadingProfile;

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

  const { formComponent, form } = useFormHelper(
    {
      schema: profileFormSchema,
      fields: [
        {
          name: 'name',
          type: 'text',
          label: t('Name'),
          required: true,
          size: 'full',
        },
        {
          name: 'email',
          type: 'text',
          label: t('E-mail'),
          required: true,
          size: 'full',
        },
        {
          name: 'photo.newFile',
          type: 'file',
          label: t('Profile Photo'),
          size: 'full',
        },
        {
          name: 'graduationYear',
          type: 'number',
          label: t('Graduation Year'),
          placeholder: t('Enter your graduation year'),
          required: true,
          size: 'half',
        },
        {
          name: 'degreeMajor',
          type: 'text',
          label: t('Degree Major'),
          placeholder: t('Enter your degree major'),
          required: true,
          size: 'half',
        },
        {
          name: 'givingInspiration',
          type: 'multiselect',
          label: t('What inspires your giving?'),
          options: givingInspirationOptions,
          size: 'full',
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
          options: importantCausesOptions,
          size: 'full',
        },
        {
          name: 'anonymousGiving',
          type: 'checkbox',
          label: t('Would you like your giving to remain anonymous?'),
          checkboxMode: 'boolean',
          size: 'full',
        },
        {
          name: 'givingTypes',
          type: 'multiselect',
          label: t('How have you given back since graduating?'),
          options: givingTypesOptions,
          size: 'full',
        },
        {
          name: 'mentorshipHours',
          type: 'number',
          label: t('Estimated hours of mentorship or volunteering'),
          placeholder: t('Enter approximate hours'),
          size: 'half',
        },
        {
          name: 'lifetimeGiving',
          type: 'number',
          label: t('Total lifetime giving (if known)'),
          placeholder: t('Enter amount (optional)'),
          size: 'half',
        },
        {
          name: 'notifyGivingOpportunities',
          type: 'checkbox',
          label: t(
            'Would you like to be notified about new giving opportunities?'
          ),
          checkboxMode: 'boolean',
          size: 'full',
        },
        {
          name: 'cityState',
          type: 'text',
          label: t('City & State'),
          placeholder: t('Enter your city and state'),
          required: true,
          size: 'half',
        },
        {
          name: 'country',
          type: 'text',
          label: t('Country'),
          placeholder: t('Enter your country'),
          required: true,
          size: 'half',
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
          options: genderIdentityOptions,
          size: 'half',
        },
        {
          name: 'racialEthnicBackground',
          type: 'multiselect',
          label: t('Racial / Ethnic Background'),
          options: racialEthnicBackgroundOptions,
          size: 'full',
        },
        {
          name: 'firstGenerationGraduate',
          type: 'checkbox',
          label: t('First-Generation College Graduate?'),
          checkboxMode: 'boolean',
          size: 'half',
        },
        {
          name: 'relationshipStatus',
          type: 'select',
          label: t('Relationship Status'),
          options: relationshipStatusOptions,
          size: 'half',
        },
        {
          name: 'dependentsInCollege',
          type: 'checkbox',
          label: t('Dependents in or approaching college?'),
          checkboxMode: 'boolean',
          size: 'full',
        },
        {
          name: 'employmentStatus',
          type: 'select',
          label: t('Employment Status'),
          options: employmentStatusOptions,
          required: true,
          size: 'half',
        },
        {
          name: 'industry',
          type: 'select',
          label: t('Industry'),
          options: industryOptions,
          required: true,
          size: 'half',
        },
        {
          name: 'occupation',
          type: 'text',
          label: t('Occupation'),
          placeholder: t('Enter your occupation (optional)'),
          size: 'half',
        },
        {
          name: 'employer',
          type: 'text',
          label: t('Employer'),
          placeholder: t('Enter your employer (optional)'),
          size: 'half',
        },
        {
          name: 'incomeRange',
          type: 'select',
          label: t('Estimated Annual Income Range'),
          options: incomeRangeOptions,
          size: 'full',
        },
        {
          name: 'educationGivingPercentage',
          type: 'number',
          label: t('% of giving typically directed to education causes'),
          placeholder: t('Enter percentage (0-100)'),
          size: 'half',
        },
        {
          name: 'hasCurrentContributions',
          type: 'checkbox',
          label: t('Current contributions (scholarships, endowments)'),
          checkboxMode: 'boolean',
          size: 'half',
        },
        {
          name: 'interestedInFund',
          type: 'select',
          label: t('Interested in creating or naming a fund?'),
          options: interestedInFundOptions,
          size: 'full',
        },
        {
          name: 'willingToMentor',
          type: 'checkbox',
          label: t('Would you be interested in mentoring students?'),
          checkboxMode: 'boolean',
          size: 'full',
        },
        {
          name: 'wantsAlumniConnections',
          type: 'checkbox',
          label: t(
            'Would you like to connect with other alumni in your field or city?'
          ),
          checkboxMode: 'boolean',
          size: 'full',
        },
        {
          name: 'interestedInEvents',
          type: 'checkbox',
          label: t('Are you interested in attending or hosting alumni events?'),
          checkboxMode: 'boolean',
          size: 'full',
        },
        {
          name: 'recognitionPreferences',
          type: 'multiselect',
          label: t(
            'How would you like to be recognized for your contributions?'
          ),
          options: recognitionPreferencesOptions,
          size: 'full',
        },
      ],
      isLoading,
      onSubmit: async (values): Promise<void> => {
        const { newFile } = values.photo;
        const uploaded = newFile ? await uploadFile(newFile) : undefined;
        let newFileKey = uploaded?.key;
        if (ignoreExistingPhoto && !newFileKey) {
          newFileKey = undefined;
        }

        await new Promise<void>((resolve, reject) => {
          updateOwnUser(
            {
              name: values.name,
              email: values.email,
              profileImage: newFileKey,
            },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            }
          );
        });
        await new Promise<void>((resolve, reject) => {
          const emptyToNull = (value?: string | null): string | null =>
            value || null;
          updateUserProfile(
            {
              graduationYear: values.graduationYear,
              degreeMajor: values.degreeMajor,
              givingInspiration: values.givingInspiration,
              legacyDefinition: values.legacyDefinition,
              importantCauses: values.importantCauses,
              anonymousGiving: values.anonymousGiving,
              givingTypes: values.givingTypes,
              mentorshipHours: values.mentorshipHours,
              lifetimeGiving: values.lifetimeGiving,
              notifyGivingOpportunities: values.notifyGivingOpportunities,
              cityState: values.cityState,
              country: values.country,
              hometownAtEnrollment: values.hometownAtEnrollment,
              genderIdentity: emptyToNull(values.genderIdentity),
              racialEthnicBackground: values.racialEthnicBackground,
              firstGenerationGraduate: values.firstGenerationGraduate,
              relationshipStatus: emptyToNull(values.relationshipStatus),
              dependentsInCollege: values.dependentsInCollege,
              employmentStatus: values.employmentStatus,
              industry: values.industry,
              occupation: values.occupation || '',
              employer: values.employer || '',
              incomeRange: emptyToNull(values.incomeRange),
              educationGivingPercentage: values.educationGivingPercentage,
              hasCurrentContributions: values.hasCurrentContributions,
              interestedInFund: emptyToNull(values.interestedInFund),
              willingToMentor: values.willingToMentor,
              wantsAlumniConnections: values.wantsAlumniConnections,
              interestedInEvents: values.interestedInEvents,
              recognitionPreferences: values.recognitionPreferences,
            },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            }
          );
        });
        await updateSession();
        await refetch();

        toast({ title: t('Profile updated successfully!') });
      },
    },
    {
      defaultValues: {
        name: user.name,
        email: user.email,
        photo: { newFile: undefined },
        graduationYear: userProfile?.graduationYear || new Date().getFullYear(),
        degreeMajor: userProfile?.degreeMajor || '',
        givingInspiration: userProfile?.givingInspiration || [],
        legacyDefinition: userProfile?.legacyDefinition || '',
        importantCauses: userProfile?.importantCauses || [],
        anonymousGiving: userProfile?.anonymousGiving || false,
        givingTypes: userProfile?.givingTypes || [],
        mentorshipHours: userProfile?.mentorshipHours || undefined,
        lifetimeGiving: userProfile?.lifetimeGiving
          ? Number(userProfile.lifetimeGiving)
          : undefined,
        notifyGivingOpportunities:
          userProfile?.notifyGivingOpportunities ?? true,
        cityState: userProfile?.cityState || '',
        country: userProfile?.country || '',
        hometownAtEnrollment: userProfile?.hometownAtEnrollment || '',
        genderIdentity: userProfile?.genderIdentity || '',
        racialEthnicBackground: userProfile?.racialEthnicBackground || [],
        firstGenerationGraduate: userProfile?.firstGenerationGraduate || false,
        relationshipStatus: userProfile?.relationshipStatus || '',
        dependentsInCollege: userProfile?.dependentsInCollege || false,
        employmentStatus: userProfile?.employmentStatus || '',
        industry: userProfile?.industry || '',
        occupation: userProfile?.occupation || '',
        employer: userProfile?.employer || '',
        incomeRange: userProfile?.incomeRange || '',
        educationGivingPercentage:
          userProfile?.educationGivingPercentage || undefined,
        hasCurrentContributions: userProfile?.hasCurrentContributions || false,
        interestedInFund: userProfile?.interestedInFund || '',
        willingToMentor: userProfile?.willingToMentor || false,
        wantsAlumniConnections: userProfile?.wantsAlumniConnections || false,
        interestedInEvents: userProfile?.interestedInEvents || false,
        recognitionPreferences: userProfile?.recognitionPreferences || [],
      },
    }
  );

  const newPhotoFile = form.watch('photo.newFile');
  const newPhotoDataUrl = useDataUrlFromFile(newPhotoFile);
  const userPhotoUrl = newPhotoDataUrl || existingPhotoUrl || undefined;
  const showEmptyInput =
    (ignoreExistingPhoto || !profileImageQuery.id) && !newPhotoFile;

  const handleClearPhoto = async (): Promise<void> => {
    form.setValue('photo.newFile', undefined);
    await form.trigger('photo.newFile');
    setIgnoreExistingPhoto(true);
  };

  return (
    <div className="mb-8 w-full space-y-8">
      <div className="space-y-4">
        <h3 className="border-b pb-2 text-lg font-semibold">
          {t('Basic Information')}
        </h3>
        {formComponent}
      </div>

      {!showEmptyInput && (
        <ImagePreview
          loadErrorAction={
            userPhotoUrl === existingPhotoUrl
              ? ImagePreviewLoadErrorAction.showErrorIcon
              : ImagePreviewLoadErrorAction.clearPhoto
          }
          photoUrl={userPhotoUrl}
          profileImageQuery={profileImageQuery}
          onClearPhoto={handleClearPhoto}
        />
      )}
    </div>
  );
};
