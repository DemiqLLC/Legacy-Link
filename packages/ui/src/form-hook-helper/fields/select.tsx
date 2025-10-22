import { useTranslation } from 'next-i18next';
import React from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

import {
  cn,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/theme/index';
import type { FieldData } from '@/ui/form-hook-helper/types';

export type SelectInputHelperProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  fieldData: FieldData<TFieldValues>;
  className?: string;
};

export const SelectInputHelper = <TFieldValues extends FieldValues>({
  form,
  fieldData,
  className,
}: SelectInputHelperProps<TFieldValues>): React.ReactNode => {
  const { t } = useTranslation();
  return (
    <FormField
      control={form.control}
      name={fieldData.name}
      key={fieldData.name}
      render={({ field: { onChange, ...field } }): React.ReactElement => (
        <FormItem className={cn('col-span-12', className)}>
          <FormLabel>
            {fieldData.label} {fieldData.required && ' *'}
          </FormLabel>
          <Select
            {...field}
            disabled={fieldData.disabled}
            onValueChange={(value): void => {
              onChange(value);
            }}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue
                  placeholder={fieldData.placeholder || t('Select an option')}
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[300px]" showScrollButtons>
              {fieldData.options?.map(
                ({ label: optionLabel, value: optionValue, isDisabled }) => (
                  <SelectItem
                    key={optionValue}
                    value={optionValue}
                    disabled={isDisabled ?? false}
                    className={
                      isDisabled ? 'cursor-not-allowed opacity-50' : ''
                    }
                  >
                    {optionLabel}
                  </SelectItem>
                )
              ) || []}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
