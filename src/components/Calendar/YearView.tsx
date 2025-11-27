import { CalendarEvent, getEventsForDate } from "@/utils/csvParser";

interface YearViewProps {
  year: number;
  events: CalendarEvent[];
  onMonthClick: (month: number) => void;
}

export const YearView = ({ year, events, onMonthClick }: YearViewProps) => {
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  
  const renderMiniMonth = (month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const hasEvents = getEventsForDate(events, date).length > 0;
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
        <div
          key={day}
          className={`
            text-xs text-center py-1
            ${hasEvents ? 'font-bold text-calendar-today' : 'text-muted-foreground'}
            ${isToday ? 'bg-calendar-today text-white rounded-full' : ''}
          `}
        >
          {day}
        </div>
      );
    }
    
    return (
      <button
        onClick={() => onMonthClick(month)}
        className="bg-card rounded-lg border border-border p-3 hover:shadow-md transition-all duration-200 hover:scale-105"
      >
        <div className="text-sm font-semibold text-foreground mb-2">
          {monthNames[month]}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </button>
    );
  };
  
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-2xl font-bold text-calendar-header mb-6">{year}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }, (_, i) => renderMiniMonth(i))}
      </div>
    </div>
  );
};
