import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@meltstudio/theme';
import type { FC } from 'react';

type University = {
  id: string;
  name: string;
};

export type UniversitiesSelectProps = {
  universities: University[];
  selectedUniversity: University | null;
  onSelectUniversity: (university: string) => void;
  isLoading: boolean;
};

const UniversitiesSelect: FC<UniversitiesSelectProps> = ({
  universities,
  selectedUniversity,
  onSelectUniversity,
  isLoading,
}) => {
  return (
    <div className="mb-4 w-full">
      <Select onValueChange={onSelectUniversity} disabled={isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <span
              className="block max-w-[155px] truncate"
              title={selectedUniversity?.name}
            >
              {selectedUniversity?.name}
            </span>
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {universities.map((w) => (
            <SelectItem key={w.id} value={w.id}>
              {w.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { UniversitiesSelect };
