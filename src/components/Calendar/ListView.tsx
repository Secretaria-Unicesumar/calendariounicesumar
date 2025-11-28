import { CalendarEvent, getModuleColor } from "@/utils/csvParser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ListViewProps {
  events: CalendarEvent[];
  allModulos: string[];
}

export const ListView = ({ events, allModulos }: ListViewProps) => {
  // Filtra eventos com datas válidas
  const validEvents = events.filter((event) => {
    return (
      event.dataInicio instanceof Date &&
      !isNaN(event.dataInicio.getTime())
    );
  });

  // Ordena eventos por data
  const sortedEvents = [...validEvents].sort((a, b) => {
    return a.dataInicio.getTime() - b.dataInicio.getTime();
  });

  // Agrupa por mês
  const groupedByMonth = sortedEvents.reduce((acc, event) => {
    const monthKey = format(event.dataInicio, "MMMM yyyy", { locale: ptBR });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  if (sortedEvents.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            Nenhum evento encontrado com os filtros selecionados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Eventos ({sortedEvents.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[700px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedByMonth).map(([month, monthEvents]) => (
              <div key={month}>
                <h3 className="text-lg font-semibold mb-3 capitalize text-foreground">
                  {month}
                </h3>
                <div className="space-y-3">
                  {monthEvents.map((event, idx) => {
                    const moduleColor = getModuleColor(event.modulo, allModulos);
                    return (
                      <div
                        key={`${event.dataInicio}-${idx}`}
                        className="relative border border-border rounded-lg p-4 hover:opacity-90 transition-all overflow-hidden"
                      >
                        <div
                          className="absolute inset-0 opacity-15"
                          style={{ backgroundColor: moduleColor }}
                        />
                        <div className="relative z-10 flex items-start gap-3">
                          <div
                            className="w-1 h-full rounded-full flex-shrink-0"
                            style={{ backgroundColor: moduleColor }}
                          />
                          <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-foreground">
                                {event.atividade}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(event.dataInicio, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                {event.dataInicio.getTime() !== event.dataFim.getTime() && 
                                  ` - ${format(event.dataFim, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                                }
                              </p>
                            </div>
                            <Badge variant="secondary">{event.categoria}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Módulo:</span>
                              <span className="text-foreground font-medium">{event.modulo}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Produto:</span>
                              <span className="text-foreground font-medium">{event.produto}</span>
                            </div>
                          </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
