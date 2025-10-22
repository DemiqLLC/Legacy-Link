import { Trans } from 'next-i18next';
import type { FC } from 'react';

type FinalAlumniComponentProps = {
  fullName: string;
  graduationYear: number;
  degree: string;
};

const FinalAlumniComponent: FC<FinalAlumniComponentProps> = ({
  fullName,
  graduationYear,
  degree,
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold">
        <Trans>Account Created!</Trans>
      </h2>
      <p className="mt-4">
        <Trans>
          Congratulations! Your alumni account has been successfully created.
        </Trans>
      </p>
      <p className="mt-2">
        <strong>
          <Trans>Full Name</Trans>:
        </strong>{' '}
        {fullName}
      </p>
      <p className="mt-2">
        <strong>
          <Trans>Graduation Year</Trans>:
        </strong>{' '}
        {graduationYear}
      </p>
      <p className="mt-2">
        <strong>
          <Trans>Degree</Trans>:
        </strong>{' '}
        {degree}
      </p>
    </div>
  );
};

export { FinalAlumniComponent };
