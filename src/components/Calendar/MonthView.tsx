import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarEvent, getEventsForDate, getModuleColor, getPeriodoLetivoForDate } from "@/utils/csvParser";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateChange: (date: Date) => void;
  onDayClick: (date: Date) => void;
  selectedDate: Date | null;
}

export const MonthView = ({ currentDate, events, onDateChange, onDayClick, selectedDate }: MonthViewProps) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const prevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    onDateChange(newDate);
  };
  
  const nextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    onDateChange(newDate);
  };
  
  const allModulos = Array.from(new Set(events.map(e => e.modulo)));
  
  const renderDay = (day: number) => {
    const date = new Date(year, month, day);
    const dayEvents = getEventsForDate(events, date);
    const periodoLetivo = getPeriodoLetivoForDate(events, date);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isToday = new Date().toDateString() === date.toDateString();
    const isSelected = selectedDate?.toDateString() === date.toDateString();
    
    
    return (
      <button
        key={day}
        onClick={() => onDayClick(date)}
        className={`
          min-h-24 p-2 border border-border rounded-lg
          hover:opacity-90 transition-all duration-200
          flex flex-col items-start relative
          ${isToday ? 'ring-2 ring-calendar-today' : ''}
          ${isSelected ? 'ring-2 ring-primary' : ''}
        `}
        style={{ 
          opacity: 1
        }}
      >
        {periodoLetivo && (
          <div 
            className="absolute inset-0 rounded-lg opacity-20"
            style={{ backgroundColor: getModuleColor(periodoLetivo.modulo, allModulos) }}
          />
        )}
        <span className={`text-sm font-bold mb-1 relative z-10 ${isToday ? 'text-calendar-today' : 'text-foreground'}`}>
          {day}
        </span>
        <div className="flex flex-wrap gap-1 w-full relative z-10">
          {dayEvents.slice(0, 3).map((event, idx) => (
            <div
              key={idx}
              className="h-1.5 flex-1 rounded-full"
              style={{ backgroundColor: getModuleColor(event.modulo, allModulos) }}
              title={event.atividade}
            />
          ))}
          {dayEvents.length > 3 && (
            <span className="text-xs text-muted-foreground font-semibold">+{dayEvents.length - 3}</span>
          )}
        </div>
      </button>
    );
  };
  
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-24" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(renderDay(day));
  }
  
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-calendar-header">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-bold text-foreground py-2 bg-muted rounded-t-lg">
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
};
