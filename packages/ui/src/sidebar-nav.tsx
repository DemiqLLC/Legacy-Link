'use client';

import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';

import { SidebarNavItemComponent } from './sidebar-nav-item';
import type { UniversitiesSelectProps } from './universities-select';
import { UniversitiesSelect } from './universities-select';

export type SidebarNavItem = {
  id?: string;
  title: ReactNode;
  disabled?: boolean;
  icon?: React.FC;
  href?: string;
  children?: SidebarNavItem[];
  isCollapsible?: boolean;
};

const useSubmenuState = (): {
  toggleExpanded: (itemId: string) => void;
  isExpanded: (itemId: string) => boolean;
} => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      newSet.has(itemId) ? newSet.delete(itemId) : newSet.add(itemId);
      return newSet;
    });
  }, []);

  const isExpanded = useCallback(
    (itemId: string) => expandedItems.has(itemId),
    [expandedItems]
  );

  return { toggleExpanded, isExpanded };
};

type SidebarNavProps = {
  items: SidebarNavItem[];
  universities: UniversitiesSelectProps | null;
};

export const SidebarNav: React.FC<SidebarNavProps> = (props) => {
  const { items, universities } = props;

  // TODO: find a way to use hooks both from next/navigation and next/router
  const { asPath } = useRouter();
  const { toggleExpanded, isExpanded } = useSubmenuState();

  const getAllHrefs = useCallback((subItems: SidebarNavItem[]): string[] => {
    return subItems.flatMap((item) => [
      ...(item.href ? [item.href] : []),
      ...(item.children ? getAllHrefs(item.children) : []),
    ]);
  }, []);

  const allHrefs = getAllHrefs(items).sort((a, b) => b.length - a.length);
  const current = allHrefs.find((href) => asPath.startsWith(href));

  const universityComponent = useMemo(() => {
    if (!universities || universities.universities.length === 0) return null;

    return (
      <UniversitiesSelect
        universities={universities.universities}
        selectedUniversity={universities.selectedUniversity}
        onSelectUniversity={universities.onSelectUniversity}
        isLoading={universities.isLoading}
      />
    );
  }, [universities]);

  if (items.length === 0) return null;

  return (
    <div>
      {universityComponent}
      <nav className="grid items-start gap-2">
        {items.map((item) => (
          <SidebarNavItemComponent
            key={item.id || item.title?.toString()}
            item={item}
            current={current}
            isExpanded={isExpanded}
            toggleExpanded={toggleExpanded}
          />
        ))}
      </nav>
    </div>
  );
};
