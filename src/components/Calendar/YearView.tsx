import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarEvent, getEventsForDate, getModuleColor, getPeriodoLetivoForDate } from "@/utils/csvParser";

interface YearViewProps {
  year: number;
  events: CalendarEvent[];
  onMonthClick: (month: number) => void;
  onYearChange: (year: number) => void;
}

export const YearView = ({ year, events, onMonthClick, onYearChange }: YearViewProps) => {
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  
  const weekDaysShort = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const allModulos = Array.from(new Set(events.map(e => e.modulo)));
  
  const prevYear = () => onYearChange(year - 1);
  const nextYear = () => onYearChange(year + 1);
  
  const renderMiniMonth = (month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="text-xs" />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const hasEvents = getEventsForDate(events, date).length > 0;
      const periodoLetivo = getPeriodoLetivoForDate(events, date);
      const isToday = new Date().toDateString() === date.toDateString();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      const bgColor = periodoLetivo 
        ? getModuleColor(periodoLetivo.modulo, allModulos)
        : isWeekend 
          ? 'hsl(var(--calendar-weekend))' 
          : 'transparent';
      
      days.push(
        <div
          key={day}
          className={`
            text-xs text-center py-1 rounded transition-all duration-200
            ${hasEvents ? 'font-bold' : 'text-muted-foreground'}
            ${isToday ? 'ring-1 ring-calendar-today' : ''}
          `}
          style={{ 
            backgroundColor: bgColor,
            opacity: periodoLetivo ? 0.3 : 1,
            color: isToday ? 'hsl(var(--calendar-today))' : undefined
          }}
        >
          {day}
        </div>
      );
    }
    
    return (
      <button
        onClick={() => onMonthClick(month)}
        className="bg-card rounded-lg border border-border p-3 hover:shadow-md transition-all duration-200 hover:scale-105 animate-fade-in"
      >
        <div className="text-sm font-semibold text-foreground mb-3">
          {monthNames[month]}
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDaysShort.map((day, idx) => (
            <div key={idx} className="text-[10px] text-center font-bold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </button>
    );
  };
  
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-calendar-header">{year}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevYear}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextYear}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }, (_, i) => renderMiniMonth(i))}
      </div>
    </div>
  );
};
