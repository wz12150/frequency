"use client";

import * as React from "react";
import { format, parse } from "date-fns";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { cn } from "./utils";

export interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = "Select date", className }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (value) {
      try {
        return parse(value, "yyyy-MM-dd", new Date());
      } catch {
        return undefined;
      }
    }
    return undefined;
  });
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      onChange?.(format(selectedDate, "yyyy-MM-dd"));
    }
    setOpen(false);
  };

  const displayValue = date ? format(date, "yyyy-MM-dd") : value ?? "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full px-4 py-2 border border-border rounded-lg bg-input-background text-left",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            !displayValue && "text-muted-foreground",
            className
          )}
        >
          {displayValue || placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}