import { Trans } from 'next-i18next';

const WizardUniversityProfileStep1: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold">
        <Trans>Welcome to the University Creation Wizard!</Trans>
      </h2>
      <p className="mt-2">
        <Trans>
          In just a few easy steps, you&apos;ll set up a university. This wizard
          will guide you through
        </Trans>
        :
      </p>
      <ul className="mt-2 list-inside list-disc">
        <li>
          <Trans>Add a name for your university</Trans>
        </li>
        <li>
          <Trans>Add a description for your university</Trans>
        </li>
        <li>
          <Trans>Add a abbreviation for your university</Trans>
        </li>
      </ul>
      <p className="mt-4">
        <Trans>Let’s get started on building your university!</Trans>
      </p>
    </div>
  );
};

export { WizardUniversityProfileStep1 };
