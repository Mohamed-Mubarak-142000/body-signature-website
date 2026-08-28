"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30; // 08:00 .. 20:00
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
});

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toValue(day: Date, time: string) {
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}T${time}`;
}

function parseValue(value: string): { day: Date | null; time: string | null } {
  if (!value) return { day: null, time: null };
  const [datePart, timePart] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  return { day: new Date(y, m - 1, d), time: timePart ?? null };
}

export function DateTimePicker({
  id,
  value,
  onChange,
  min,
  placeholder,
  timeLabel,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  min: Date;
  placeholder: string;
  timeLabel: string;
}) {
  const locale = useLocale();
  const { day: selectedDay, time: selectedTime } = parseValue(value);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = selectedDay ?? min;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const minDay = startOfDay(min);

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(gridStart.getDate() - firstOfMonth.getDay());

    const cells: Date[] = Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      return d;
    });

    const result: Date[][] = [];
    for (let i = 0; i < cells.length; i += 7) result.push(cells.slice(i, i + 7));
    return result;
  }, [viewMonth]);

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return weeks[0]?.map((d) => formatter.format(d)) ?? [];
  }, [weeks, locale]);

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(viewMonth),
    [viewMonth, locale],
  );

  const timeFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }), [locale]);

  function formatTime(time: string) {
    const [h, m] = time.split(":").map(Number);
    return timeFormatter.format(new Date(2000, 0, 1, h, m));
  }

  function isDisabledDay(day: Date) {
    return startOfDay(day) < minDay;
  }

  function isDisabledTime(time: string) {
    if (!selectedDay) return false;
    if (startOfDay(selectedDay).getTime() !== minDay.getTime()) return false;
    const [h, m] = time.split(":").map(Number);
    const slot = new Date(selectedDay);
    slot.setHours(h, m, 0, 0);
    return slot < min;
  }

  function pickDay(day: Date) {
    if (isDisabledDay(day)) return;
    const nextTime = selectedTime && !isDisabledTime(selectedTime) ? selectedTime : "";
    onChange(nextTime ? toValue(day, nextTime) : toValue(day, TIME_SLOTS[0]));
  }

  function pickTime(time: string) {
    if (!selectedDay || isDisabledTime(time)) return;
    onChange(toValue(selectedDay, time));
  }

  const label =
    selectedDay && selectedTime
      ? `${new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(selectedDay)} · ${formatTime(selectedTime)}`
      : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            id={id}
            type="button"
            className="flex h-11 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50"
          />
        }
      >
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn("truncate", !selectedDay && "text-muted-foreground")}>{label}</span>
      </PopoverTrigger>

      <PopoverContent className="w-[19rem]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
            aria-label="Previous month"
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </button>
          <span className="font-heading text-sm text-foreground">{monthLabel}</span>
          <button
            type="button"
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
            aria-label="Next month"
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {weekdayLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {weeks.flat().map((day, i) => {
            const inMonth = day.getMonth() === viewMonth.getMonth();
            const disabled = isDisabledDay(day);
            const active = selectedDay && startOfDay(day).getTime() === startOfDay(selectedDay).getTime();
            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => pickDay(day)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-sm transition-colors",
                  !inMonth && "text-muted-foreground/40",
                  inMonth && !disabled && !active && "text-foreground hover:bg-muted",
                  disabled && "cursor-not-allowed text-muted-foreground/30",
                  active && "bg-primary text-primary-foreground",
                )}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>

        {selectedDay && (
          <div className="mt-4 border-t border-border/70 pt-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="size-3.5" />
              {timeLabel}
            </div>
            <div className="grid max-h-40 grid-cols-3 gap-1.5 overflow-y-auto pe-1">
              {TIME_SLOTS.map((time) => {
                const disabled = isDisabledTime(time);
                const active = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    disabled={disabled}
                    onClick={() => pickTime(time)}
                    className={cn(
                      "rounded-lg border px-2 py-1.5 text-xs transition-colors",
                      disabled && "cursor-not-allowed border-transparent text-muted-foreground/30",
                      !disabled && !active && "border-border/70 text-foreground hover:border-gold-400 hover:bg-muted",
                      active && "border-primary bg-primary text-primary-foreground",
                    )}
                  >
                    {formatTime(time)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
