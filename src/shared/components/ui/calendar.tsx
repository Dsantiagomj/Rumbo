'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';

import { cn } from '@/shared/lib/utils';
import { buttonVariants } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  month: propsMonth,
  onMonthChange: propsOnMonthChange,
  ...props
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(propsMonth || new Date());
  const [selectorsKey, setSelectorsKey] = React.useState(0);

  // Update internal month when propsMonth changes
  React.useEffect(() => {
    if (propsMonth) {
      setInternalMonth(propsMonth);
      setSelectorsKey((prev) => prev + 1);
    }
  }, [propsMonth]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const handleMonthChange = (value: string) => {
    const newDate = new Date(internalMonth.getFullYear(), parseInt(value), 1);
    setInternalMonth(newDate);
    setSelectorsKey((prev) => prev + 1);
  };

  const handleYearChange = (value: string) => {
    const newDate = new Date(parseInt(value), internalMonth.getMonth(), 1);
    setInternalMonth(newDate);
    setSelectorsKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2 px-3 pt-3">
        <Select value={internalMonth.getMonth().toString()} onValueChange={handleMonthChange}>
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue>{months[internalMonth.getMonth()]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {months.map((monthName, index) => (
              <SelectItem key={monthName} value={index.toString()}>
                {monthName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={internalMonth.getFullYear().toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="h-8 w-[90px]">
            <SelectValue>{internalMonth.getFullYear()}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DayPicker
        locale={es}
        showOutsideDays={showOutsideDays}
        className={cn('p-3 pt-0', className)}
        {...props}
        key={selectorsKey}
        month={internalMonth}
        onMonthChange={(newMonth) => {
          setInternalMonth(newMonth);
          propsOnMonthChange?.(newMonth);
        }}
        classNames={{
          months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
          month: 'space-y-4',
          month_caption: 'hidden',
          nav: 'hidden',
          month_grid: 'w-full border-collapse space-y-1',
          weekdays: 'flex',
          weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
          week: 'flex w-full mt-2',
          day: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:rounded-full focus-within:relative focus-within:z-20',
          day_button: cn(
            buttonVariants({ variant: 'ghost' }),
            'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-full',
          ),
          selected:
            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full relative z-10',
          today: 'bg-accent text-accent-foreground rounded-full',
          outside:
            'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
          disabled: 'text-muted-foreground opacity-50',
          range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
          hidden: 'invisible',
          ...classNames,
        }}
      />
    </div>
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
