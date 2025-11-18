import { Trans, useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { useUpdateLegacyRing } from '@/client-common/sdk';
import { LegacyRingLevelEnum } from '@/common-types/index';
import { Dialog, DialogContent, DialogTitle, toast } from '@/theme/index';
import { useFormHelper } from '@/ui/form-hook-helper';

type LegacyRingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  universityId: string;
  userName?: string;
};

export const LegacyRingModal: React.FC<LegacyRingModalProps> = ({
  open,
  onOpenChange,
  userId,
  universityId,
  userName,
}) => {
  const { t } = useTranslation();
  const [justSubmitted, setJustSubmitted] = useState(false);
  const updateLegacyRing = useUpdateLegacyRing();

  const legacyRingOptions = [
    {
      value: LegacyRingLevelEnum.RING_ONE_BUILDER,
      label: t('Ring One – Builder: $1 – $499'),
    },
    {
      value: LegacyRingLevelEnum.RING_TWO_ADVOCATE,
      label: t('Ring Two – Advocate: $500 – $4,999'),
    },
    {
      value: LegacyRingLevelEnum.RING_THREE_LEADER,
      label: t('Ring Three – Leader: $5,000 – $24,999'),
    },
    {
      value: LegacyRingLevelEnum.RING_FOUR_VISIONARY,
      label: t('Ring Four – Visionary: $25,000 – $99,999'),
    },
    {
      value: LegacyRingLevelEnum.RING_FIVE_LEGACY,
      label: t('Ring Five – Legacy: $100,000+'),
    },
  ];

  const legacyRingSchema = z.object({
    legacyRing: z.string().min(1, { message: t('Legacy Ring is required') }),
    notes: z.string().optional(),
  });

  const { formComponent, form } = useFormHelper(
    {
      schema: legacyRingSchema,
      fields: [
        {
          name: 'legacyRing',
          type: 'select',
          label: t('Legacy Ring Type'),
          options: legacyRingOptions,
          required: true,
        },
      ],
      isLoading: justSubmitted,
      onSubmit: (values): void => {
        setJustSubmitted(true);
        updateLegacyRing.mutate(
          {
            userId,
            universityId,
            ringLevel: values.legacyRing,
          },
          {
            onSuccess: () => {
              toast({
                title: t('Success'),
                description: t('Legacy Ring added successfully'),
                variant: 'default',
              });
              form.reset();
              onOpenChange(false);
              setJustSubmitted(false);
            },
            onError: () => {
              toast({
                title: t('Error'),
                description: t('An error occurred while adding Legacy Ring'),
                variant: 'destructive',
              });
              setJustSubmitted(false);
            },
          }
        );
      },
    },
    {
      defaultValues: {
        legacyRing: '',
        notes: '',
      },
    }
  );

  useEffect(() => {
    if (open) {
      form.reset({
        legacyRing: '',
        notes: '',
      });
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>
          <Trans>Add Legacy Ring</Trans>
          {userName && ` - ${userName}`}
        </DialogTitle>
        <div className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground">
            <p>
              <Trans>Select the Legacy Ring type for this alumni</Trans>
            </p>
          </div>
          {formComponent}
        </div>
      </DialogContent>
    </Dialog>
  );
};
