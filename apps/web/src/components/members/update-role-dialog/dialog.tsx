import { Dialog, DialogContent, DialogTitle } from '@meltstudio/theme';
import { Trans } from 'next-i18next';
import React from 'react';

import type { UserUniversityPropsForUpdateRole } from './content';
import { UpdateUserUniversityRoleDialogContent } from './content';

export type UpdateRoleDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  universities?: UserUniversityPropsForUpdateRole;
  onClose?: () => void;
};

export const UpdateRoleDialog: React.FC<UpdateRoleDialogProps> = ({
  open,
  onOpenChange,
  universities,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          <Trans>Update Role for</Trans> {universities?.userId}
        </DialogTitle>
        <UpdateUserUniversityRoleDialogContent
          userUniversity={universities}
          onCloseDialog={(): void => {
            onOpenChange?.(false);
            onClose?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
