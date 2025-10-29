import type { ReactNode } from 'react';
import React from 'react';

type FieldDisplayProps = {
  label: string;
  value?: string | number | ReactNode;
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
        title={
          typeof value === 'string' || typeof value === 'number'
            ? value.toString()
            : undefined
        }
      >
        {value || '-'}
      </div>
    </div>
  );
};
