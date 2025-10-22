import { Trans, useTranslation } from 'next-i18next';
import type { FC } from 'react';
import { useState } from 'react';
import { z } from 'zod';

import { useCreatePledgeOpportunity } from '@/client-common/sdk';
import {
  CommunicationMethodEnum,
  PledgeStatusEnum,
  PledgeTypeEnum,
} from '@/common-types/pledge-opportunities';
import { useSessionUser } from '@/components/user/user-context';
import type { DbGivingOpportunities } from '@/db/schema';
import { Dialog, DialogContent, DialogTitle, toast } from '@/theme/index';
import { useFormHelper } from '@/ui/form-hook-helper';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  givingOpportunity: DbGivingOpportunities;
};

export const PledgeInterestModal: FC<Props> = ({
  open,
  onOpenChange,
  givingOpportunity,
}) => {
  const { t } = useTranslation();
  const { user } = useSessionUser();
  const [justSubmitted, setJustSubmitted] = useState(false);
  const { mutate } = useCreatePledgeOpportunity();

  const pledgeStatusOptions = [
    { value: PledgeStatusEnum.PLEDGE_INTENT, label: t('Pledge Intent') },
    {
      value: PledgeStatusEnum.AWAITING_CONFIRMATION,
      label: t('Awaiting Confirmation'),
    },
    {
      value: PledgeStatusEnum.PROCESSING_DONATION,
      label: t('Processing Donation'),
    },
    { value: PledgeStatusEnum.COMPLETED, label: t('Completed') },
    { value: PledgeStatusEnum.IMPACT_RECORDED, label: t('Impact Recorded') },
  ];

  const pledgeTypeOptions = [
    { value: PledgeTypeEnum.MONETARY_SUPPORT, label: t('Monetary Support') },
    {
      value: PledgeTypeEnum.MENTORSHIP_ENGAGEMENT,
      label: t('Mentorship Engagement'),
    },
    {
      value: PledgeTypeEnum.IN_KIND_SKILL_BASED_SUPPORT,
      label: t('In-kind / Skill-based Support'),
    },
    {
      value: PledgeTypeEnum.INNOVATION_ENTREPRENEURSHIP_SUPPORT,
      label: t('Innovation & Entrepreneurship Support'),
    },
  ];

  const communicationMethodOptions = [
    { value: CommunicationMethodEnum.EMAIL, label: t('Email') },
    { value: CommunicationMethodEnum.PHONE, label: t('Phone') },
  ];
  const pledgeFormSchema = z.object({
    email: z
      .string()
      .email({ message: t('Must be a valid email') })
      .min(1, { message: t('Email is required') }),
    status: z.nativeEnum(PledgeStatusEnum),
    pledgeType: z.nativeEnum(PledgeTypeEnum),
    phoneNumber: z.string().regex(/^\+?[0-9]{7,15}$/, {
      message: t('Must be a valid phone number'),
    }),
    reasonForInterest: z.string(),
    preferredCommunicationMethod: z.nativeEnum(CommunicationMethodEnum),
  });

  const { formComponent } = useFormHelper(
    {
      schema: pledgeFormSchema,
      fields: [
        {
          name: 'email',
          type: 'text',
          label: t('Email'),
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          label: t('Status'),
          options: pledgeStatusOptions,
          required: true,
          disabled: true,
        },
        {
          name: 'pledgeType',
          type: 'select',
          label: t('Pledge Type'),
          options: pledgeTypeOptions,
          required: true,
        },
        {
          name: 'phoneNumber',
          type: 'text',
          label: t('Phone Number'),
        },
        {
          name: 'preferredCommunicationMethod',
          type: 'select',
          label: t('Preferred Communication Method'),
          options: communicationMethodOptions,
          required: true,
        },
        {
          name: 'reasonForInterest',
          type: 'textarea',
          label: t('Reason for Interest'),
        },
      ],
      isLoading: justSubmitted,
      onSubmit: (values): void => {
        setJustSubmitted(true);
        setTimeout(() => setJustSubmitted(false), 10000);
        mutate(
          {
            ...values,
            userId: (user && user.id) ?? '',
            universityId: givingOpportunity?.universityId ?? '',
            givingOpportunityId: givingOpportunity.id ?? '',
          },
          {
            onSuccess: () => {
              toast({
                title: t('Success'),
                description: t('Giving opportunity created successfully'),
                variant: 'default',
              });
              onOpenChange(false);
            },
            onError: () => {
              toast({
                title: t('Error'),
                description: t('An error occurred'),
                variant: 'destructive',
              });
            },
          }
        );
      },
    },
    {
      defaultValues: {
        email: user?.email || '',
        amount: 0,
        status: PledgeStatusEnum.PLEDGE_INTENT,
        pledgeType: PledgeTypeEnum.MONETARY_SUPPORT,
        phoneNumber: '',
        reasonForInterest: '',
        preferredCommunicationMethod: CommunicationMethodEnum.EMAIL,
      },
    }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>
          <Trans>Pledge Interest</Trans> - {givingOpportunity.name}
        </DialogTitle>
        <div className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground">
            <p>
              <Trans>
                Express your interest in supporting this giving opportunity
              </Trans>
            </p>
          </div>
          {formComponent}
        </div>
      </DialogContent>
    </Dialog>
  );
};
