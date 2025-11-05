'use client';

import type { Table } from '@tanstack/react-table';

import { DataTableDateRangeFilter } from './filters/date-range';
import { DataTableSearchFilter } from './filters/search';
import { DataTableSelectFilter } from './filters/select';
import type { DataTableFilter, DataTableGlobalFilter } from './types';
import { DataTableViewOptions } from './view-options';

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  globalFiltersDefs?: DataTableGlobalFilter[];
  columnFiltersDefs?: DataTableFilter[];
  actionButton?: React.ReactNode;
};

export const DataTableToolbar = <TData,>(
  props: DataTableToolbarProps<TData>
): React.ReactNode => {
  const {
    table,
    globalFiltersDefs = [],
    columnFiltersDefs = [],
    actionButton,
  } = props;

  const hasFilters =
    globalFiltersDefs.length > 0 || columnFiltersDefs.length > 0;

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-col justify-start space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
        {hasFilters && (
          <>
            {globalFiltersDefs.map((filter) => {
              if (filter.type === 'search') {
                return (
                  <DataTableSearchFilter
                    key={filter.id}
                    table={table}
                    id={filter.id}
                    placeholder={filter.placeholder}
                  />
                );
              }

              if (filter.type === 'select') {
                return (
                  <DataTableSelectFilter
                    key={filter.id}
                    table={table}
                    isGlobal
                    id={filter.id}
                    title={filter.title}
                    allowMultiple={filter.allowMultiple}
                    options={filter.options}
                  />
                );
              }

              if (filter.type === 'date-range') {
                return (
                  <DataTableDateRangeFilter
                    key={filter.id}
                    table={table}
                    id={filter.id}
                    disabledDays={filter.disabledDays}
                  />
                );
              }

              // @ts-expect-error it's best to leave this here to know when a bad
              // filter is passed
              throw new Error(`Unknown global filter type: ${filter.type}`);
            })}

            {columnFiltersDefs.map((filter) => {
              if (filter.type === 'select') {
                return (
                  <DataTableSelectFilter
                    key={filter.id}
                    table={table}
                    isGlobal={false}
                    id={filter.id}
                    title={filter.title}
                    allowMultiple={filter.allowMultiple}
                    options={filter.options}
                  />
                );
              }

              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              throw new Error(`Unknown filter type: ${filter.type}`);
            })}
          </>
        )}
      </div>

      <div className="flex items-end space-x-2">
        <DataTableViewOptions table={table} />
        {actionButton && <div className="flex justify-end">{actionButton}</div>}
      </div>
    </div>
  );
};
