import { Trans } from 'next-i18next';
import type { FC } from 'react';

type FinalComponentProps = {
  name: string;
  description: string;
  // members: string[];
  // universityID: string;
  // universityName: string;
};

const FinalComponent: FC<FinalComponentProps> = ({
  name,
  description,
  // members,
  // universityID,
  // universityName,
}) => {
  // const { t } = useTranslation();

  // const { changeToNewUniversity } = useUniversities();

  // const onGoToUniversity = async (): Promise<void> => {
  //   await changeToNewUniversity({
  //     id: universityID,
  //     name: universityName,
  //     role: UserRoleEnum.ADMIN,
  //   });
  // };

  return (
    <div>
      <h2 className="text-2xl font-bold">
        <Trans>University Created!</Trans>
      </h2>
      <p className="mt-4">
        <Trans>
          Congratulations! Your university profile has been created
          successfully.
        </Trans>
      </p>
      <p className="mt-2">
        <strong>
          <Trans>University Profile Name</Trans>:
        </strong>{' '}
        {name}
      </p>
      <p className="mt-2">
        <strong>
          <Trans>Description</Trans>:
        </strong>{' '}
        {description}
      </p>
      {/* <p className="mt-2">
        <strong>
          <Trans>Members</Trans>:
        </strong>{' '}
        {members.length ? members.join(', ') : t('No members added')}
      </p> */}
      {/* <Button className="mt-2" onClick={onGoToUniversity}>
        <Trans>Go to university</Trans>
      </Button> */}
    </div>
  );
};

export { FinalComponent };
