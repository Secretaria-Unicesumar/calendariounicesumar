import { X, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarEvent, getModuleColor } from "@/utils/csvParser";

interface DayDetailProps {
  date: Date | null;
  events: CalendarEvent[];
  onClose: () => void;
}

export const DayDetail = ({ date, events, onClose }: DayDetailProps) => {
  if (!date) return null;
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  
  const allModulos = Array.from(new Set(events.map(e => e.modulo)));
  
  const formatDate = (d: Date) => {
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };
  
  return (
    <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5" />
          <div>
            <h3 className="font-bold text-lg">
              {weekDays[date.getDay()]}, {date.getDate()} de {monthNames[date.getMonth()]}
            </h3>
            <p className="text-sm opacity-90">{date.getFullYear()}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-primary-foreground hover:bg-primary-foreground/20">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="h-[500px]">
        <div className="p-4">
          {events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum evento neste dia</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event, idx) => (
                <div
                  key={idx}
                  className="bg-background rounded-lg p-4 border-l-4 hover:shadow-md transition-shadow duration-200"
                  style={{ borderLeftColor: getModuleColor(event.modulo, allModulos) }}
                >
                  <h4 className="font-semibold text-foreground mb-2">{event.atividade}</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><span className="font-medium">Produto:</span> {event.produto}</p>
                    <p><span className="font-medium">Categoria:</span> {event.categoria}</p>
                    <p>
                      <span className="font-medium">Módulo:</span>{' '}
                      <span
                        className="inline-block px-2 py-0.5 rounded text-white font-medium"
                        style={{ backgroundColor: getModuleColor(event.modulo, allModulos) }}
                      >
                        {event.modulo}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Período:</span>{' '}
                      {formatDate(event.dataInicio)} - {formatDate(event.dataFim)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
