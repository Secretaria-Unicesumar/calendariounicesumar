import { useState, useEffect } from "react";
import { Calendar, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonthView } from "@/components/Calendar/MonthView";
import { YearView } from "@/components/Calendar/YearView";
import { DayDetail } from "@/components/Calendar/DayDetail";
import { FilterPanel } from "@/components/Calendar/FilterPanel";
import { CalendarEvent, parseCSV, getEventsForDate } from "@/utils/csvParser";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedModulos, setSelectedModulos] = useState<string[]>([]);
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadEvents = async () => {
      const loadedEvents = await parseCSV('/calendario.csv');
      setEvents(loadedEvents);
      toast({
        title: "Calendário carregado",
        description: `${loadedEvents.length} eventos importados com sucesso.`,
      });
    };
    loadEvents();
  }, [toast]);
  
  const filteredEvents = events.filter(event => {
    const moduloMatch = selectedModulos.length === 0 || selectedModulos.includes(event.modulo);
    const categoriaMatch = selectedCategorias.length === 0 || selectedCategorias.includes(event.categoria);
    return moduloMatch && categoriaMatch;
  });
  
  const uniqueModulos = Array.from(new Set(events.map(e => e.modulo))).sort();
  const uniqueCategorias = Array.from(new Set(events.map(e => e.categoria))).sort();
  
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleMonthClick = (month: number) => {
    const newDate = new Date(currentDate.getFullYear(), month, 1);
    setCurrentDate(newDate);
    setViewMode('month');
  };
  
  const toggleModulo = (modulo: string) => {
    setSelectedModulos(prev =>
      prev.includes(modulo) ? prev.filter(m => m !== modulo) : [...prev, modulo]
    );
  };
  
  const toggleCategoria = (categoria: string) => {
    setSelectedCategorias(prev =>
      prev.includes(categoria) ? prev.filter(c => c !== categoria) : [...prev, categoria]
    );
  };
  
  const clearFilters = () => {
    setSelectedModulos([]);
    setSelectedCategorias([]);
  };
  
  const dayEvents = selectedDate ? getEventsForDate(filteredEvents, selectedDate) : [];
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-calendar-today" />
              <h1 className="text-3xl md:text-4xl font-bold text-calendar-header">
                Calendário Acadêmico
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                onClick={() => setViewMode('month')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Mês
              </Button>
              <Button
                variant={viewMode === 'year' ? 'default' : 'outline'}
                onClick={() => setViewMode('year')}
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                Ano
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Visualize e gerencie eventos acadêmicos por módulo e categoria
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterPanel
              modulos={uniqueModulos}
              categorias={uniqueCategorias}
              selectedModulos={selectedModulos}
              selectedCategorias={selectedCategorias}
              onModuloToggle={toggleModulo}
              onCategoriaToggle={toggleCategoria}
              onClearFilters={clearFilters}
            />
          </div>
          
          <div className="lg:col-span-2">
            {viewMode === 'month' ? (
              <MonthView
                currentDate={currentDate}
                events={filteredEvents}
                onDateChange={setCurrentDate}
                onDayClick={handleDayClick}
                selectedDate={selectedDate}
              />
            ) : (
              <YearView
                year={currentDate.getFullYear()}
                events={filteredEvents}
                onMonthClick={handleMonthClick}
              />
            )}
          </div>
          
          <div className="lg:col-span-1">
            {selectedDate && (
              <DayDetail
                date={selectedDate}
                events={dayEvents}
                onClose={() => setSelectedDate(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
