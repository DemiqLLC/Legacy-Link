type FieldDisplayProps = {
  label: string;
  value?: string | number;
};

export const FieldDisplay: React.FC<FieldDisplayProps> = ({ label, value }) => {
  return (
    <div>
      <div className="mb-1 text-base font-bold tracking-wide text-gray-900 dark:text-white">
        {label}
      </div>
      <div
        className={`text-sm text-gray-900 dark:text-white ${
          label === 'Description' ? 'max-w-full truncate' : ''
        }`}
        title={value?.toString()}
      >
        {value || '-'}
      </div>
    </div>
  );
};
