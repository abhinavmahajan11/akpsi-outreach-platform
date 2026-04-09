'use client';

import type { CalendarEvent } from '@/types';
import {
  EVENT_TYPE_CONFIG,
  isOverdue,
  isSameDay,
  getMonthGrid,
} from './calendarConfig';

interface MonthGridProps {
  year: number;
  month: number; // 0-indexed
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthGrid({
  year,
  month,
  events,
  onDayClick,
  onEventClick,
}: MonthGridProps) {
  const today = new Date();
  const grid = getMonthGrid(year, month);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* 6-row day grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6">
        {grid.map((day, i) => {
          const isToday = isSameDay(day.date, today);
          const isPast =
            day.date < today &&
            !isSameDay(day.date, today) &&
            day.isCurrentMonth;
          const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;

          const dayEvents = events
            .filter((e) => isSameDay(new Date(e.startAt), day.date))
            .filter((e) => e.status !== 'cancelled');

          const visibleEvents = dayEvents.slice(0, 3);
          const overflow = dayEvents.length - 3;

          return (
            <div
              key={i}
              onClick={() => onDayClick(day.date)}
              className={[
                'relative flex flex-col p-1.5 border-r border-b border-slate-100 cursor-pointer transition-colors min-h-[90px]',
                !day.isCurrentMonth ? 'bg-slate-50/40' : '',
                isWeekend && day.isCurrentMonth ? 'bg-slate-50/20' : '',
                isToday ? 'bg-blue-50/50' : 'hover:bg-slate-50/80',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/* Day number */}
              <span
                className={[
                  'inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium mb-1 flex-shrink-0',
                  isToday
                    ? 'bg-[#0d1f3c] text-white'
                    : day.isCurrentMonth
                      ? isPast
                        ? 'text-slate-400'
                        : 'text-slate-700'
                      : 'text-slate-300',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {day.date.getDate()}
              </span>

              {/* Event chips */}
              <div className="space-y-0.5 flex-1 overflow-hidden">
                {visibleEvents.map((evt) => {
                  const cfg = EVENT_TYPE_CONFIG[evt.eventType];
                  const overdue = isOverdue(evt);
                  return (
                    <button
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(evt);
                      }}
                      title={evt.title}
                      className={[
                        'w-full text-left flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate',
                        'border-l-2 transition-opacity hover:opacity-80',
                        overdue
                          ? 'bg-rose-50 text-rose-700 border-rose-400'
                          : `${cfg.chipBg} ${cfg.chipText} ${cfg.chipBorder}`,
                        evt.status === 'completed' ? 'opacity-50 line-through' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span className="truncate">{evt.title}</span>
                    </button>
                  );
                })}
                {overflow > 0 && (
                  <span className="text-[10px] text-slate-400 font-medium px-1.5 leading-none block">
                    +{overflow} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
