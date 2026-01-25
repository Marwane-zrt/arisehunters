import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Habit } from '../types/habit';

import { RuleViolation } from '../types/rule';

interface QuestCalendarProps {
  habits: Habit[];
  ruleViolations?: RuleViolation[];
}

export const QuestCalendar: React.FC<QuestCalendarProps> = ({ habits, ruleViolations = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Adjust for Monday start if needed, but let's stick to Sunday start for now
    // 0 = Sunday, 1 = Monday, etc.
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDayStatus = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    const now = new Date();

    // Future dates are neutral
    if (date > now) {
      return 'neutral';
    }

    // Check for violations on this date
    const hasViolation = ruleViolations.some(v => {
      const violationDate = new Date(v.violationDate);
      return violationDate.toISOString().split('T')[0] === dateString;
    });

    if (hasViolation) {
      return 'failure';
    }

    // Filter habits that were active on this date
    // Assuming habit.createdAt is a string or Date. 
    // In types/habit.ts it says createdAt: Date, but usually from JSON it might be string.
    // Let's handle both safely or rely on the type.
    const activeHabits = habits.filter(habit => {
      const created = new Date(habit.createdAt);
      // Normalize to YYYY-MM-DD to compare just dates
      const createdString = created.toISOString().split('T')[0];
      return createdString <= dateString;
    });

    if (activeHabits.length === 0) return 'neutral';

    // Check if all active habits were completed on this date
    // completedDates is string[] (YYYY-MM-DD)
    const allCompleted = activeHabits.every(habit =>
      habit.completedDates.includes(dateString)
    );

    return allCompleted ? 'success' : 'failure';
  };

  const renderDays = () => {
    const days = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const status = getDayStatus(i);
      let bgColor = '';
      let textColor = 'text-white';
      let borderColor = 'border-transparent';

      if (status === 'success') {
        bgColor = 'bg-green-500/20';
        textColor = 'text-green-400';
        borderColor = 'border-green-500/50';
      } else if (status === 'failure') {
        bgColor = 'bg-red-500/20';
        textColor = 'text-red-400';
        borderColor = 'border-red-500/50';
      } else {
        // Neutral/Future
        bgColor = 'bg-gray-700/30';
        textColor = 'text-gray-400';
      }

      // Highlight today
      const today = new Date();
      const isToday = today.getDate() === i &&
        today.getMonth() === currentDate.getMonth() &&
        today.getFullYear() === currentDate.getFullYear();

      if (isToday) {
        borderColor = 'border-blue-500';
        if (status === 'neutral') {
          textColor = 'text-blue-400';
        }
      }

      days.push(
        <div
          key={i}
          className={`
                    h-10 w-10 flex items-center justify-center rounded-lg border 
                    ${bgColor} ${textColor} ${borderColor}
                    transition-all duration-200 hover:scale-110
                `}
          title={status === 'success' ? 'All quests completed' : status === 'failure' ? 'Incomplete' : ''}
        >
          {i}
        </div>
      );
    }
    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-cyan-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Quest Consistency</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-white font-medium min-w-[100px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="h-8 w-10 flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {renderDays()}
      </div>

      <div className="flex items-center gap-6 mt-4 text-xs text-gray-400 justify-end">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/50"></div>
          <span>All Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50"></div>
          <span>Incomplete</span>
        </div>
      </div>
    </div>
  );
};
