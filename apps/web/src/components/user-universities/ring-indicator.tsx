import type { FC } from 'react';

import { LegacyRingLevelEnum } from '@/common-types/index';

type RingIndicatorProps = {
  ringLevel: LegacyRingLevelEnum | null;
};

export const RingIndicator: FC<RingIndicatorProps> = ({ ringLevel }) => {
  const getRingColor = (level: LegacyRingLevelEnum | null): string => {
    switch (level) {
      case LegacyRingLevelEnum.RING_ONE_BUILDER:
        return 'border-[#D97706] bg-[#F59E0B]';
      case LegacyRingLevelEnum.RING_TWO_ADVOCATE:
        return 'border-[#9CA3AF] bg-[#E5E7EB]';
      case LegacyRingLevelEnum.RING_THREE_LEADER:
        return 'border-[#FBBF24] bg-[#FACC15]';
      case LegacyRingLevelEnum.RING_FOUR_VISIONARY:
        return 'border-[#A5F3FC] bg-[#E0F2FE]';
      case LegacyRingLevelEnum.RING_FIVE_LEGACY:
        return 'border-[#111827] bg-[#374151]';
      default:
        return '';
    }
  };

  const getRingLabel = (level: LegacyRingLevelEnum | null): string => {
    switch (level) {
      case LegacyRingLevelEnum.RING_ONE_BUILDER:
        return 'Ring One – Builder: $1 – $499';
      case LegacyRingLevelEnum.RING_TWO_ADVOCATE:
        return 'Ring Two – Advocate: $500 – $4,999';
      case LegacyRingLevelEnum.RING_THREE_LEADER:
        return 'Ring Three – Leader: $5,000 – $24,999';
      case LegacyRingLevelEnum.RING_FOUR_VISIONARY:
        return 'Ring Four – Visionary: $25,000 – $99,999';
      case LegacyRingLevelEnum.RING_FIVE_LEGACY:
        return 'Ring Five – Legacy: $100,000+';
      default:
        return 'Not defined';
    }
  };

  return (
    <div className="group relative inline-block">
      <div
        className={`size-4 rounded-full border-[3px] ${getRingColor(ringLevel)} cursor-help transition-all hover:scale-110`}
      />
      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-gray-700">
        {getRingLabel(ringLevel)}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
      </div>
    </div>
  );
};
