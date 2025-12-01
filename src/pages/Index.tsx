import { useState, useEffect } from "react";
import { Calendar, Grid3x3, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonthView } from "@/components/Calendar/MonthView";
import { YearView } from "@/components/Calendar/YearView";
import { ListView } from "@/components/Calendar/ListView";
import { DayDetail } from "@/components/Calendar/DayDetail";
import { FilterPanel } from "@/components/Calendar/FilterPanel";
import { Footer } from "@/components/Footer";
import { Tutorial } from "@/components/Tutorial";
import { CalendarEvent, parseCSV, getEventsForDate } from "@/utils/csvParser";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import logoUnicesumar from "@/assets/logo-unicesumar-horizontal.png";

const Index = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'year' | 'list'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedModulos, setSelectedModulos] = useState<string[]>([]);
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [selectedProdutos, setSelectedProdutos] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const isMobile = useIsMobile();
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
    const produtoMatch = selectedProdutos.length === 0 || selectedProdutos.includes(event.produto);
    return moduloMatch && categoriaMatch && produtoMatch;
  });

  // Events that match currently selected products (used to compute available modulos/categorias)
  const availableEvents = selectedProdutos.length === 0 ? events : events.filter(e => selectedProdutos.includes(e.produto));
  
  const availableModulos = Array.from(new Set(availableEvents.map(e => e.modulo))).sort();
  const availableCategorias = Array.from(new Set(availableEvents.map(e => e.categoria))).sort();
  const uniqueProdutos = Array.from(new Set(events.map(e => e.produto))).sort();
  
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleMonthClick = (month: number) => {
    const newDate = new Date(currentDate.getFullYear(), month, 1);
    setCurrentDate(newDate);
    setViewMode('month');
  };
  
  const handleYearChange = (year: number) => {
    const newDate = new Date(year, currentDate.getMonth(), 1);
    setCurrentDate(newDate);
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

  const toggleProduto = (produto: string) => {
    setSelectedProdutos(prev =>
      prev.includes(produto) ? prev.filter(c => c !== produto) : [...prev, produto]
    );
  };

  // When produto selection changes, ensure module/category selections remain valid
  useEffect(() => {
    setSelectedModulos(prev => prev.filter(m => availableModulos.includes(m)));
    setSelectedCategorias(prev => prev.filter(c => availableCategorias.includes(c)));
  }, [selectedProdutos, availableModulos, availableCategorias]);

  // Hide filters automatically on mobile
  useEffect(() => {
    setShowFilters(!isMobile);
  }, [isMobile]);
  
  const clearFilters = () => {
    setSelectedModulos([]);
    setSelectedCategorias([]);
    setSelectedProdutos([]);
  };
  
  const dayEvents = selectedDate ? getEventsForDate(filteredEvents, selectedDate) : [];
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <img src={logoUnicesumar} alt="Unicesumar" className="h-10 md:h-12" />
              <h1 className="text-2xl md:text-3xl font-bold text-calendar-header">
                Calendário Acadêmico
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className="hidden lg:flex"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
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
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                Lista
              </Button>
              <Tutorial />
            </div>
          </div>
          <p className="text-muted-foreground">
            Visualize e gerencie eventos acadêmicos por módulo e categoria
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="mt-2 lg:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {showFilters && (
            <div className="lg:col-span-1">
              <FilterPanel
                modulos={availableModulos}
                categorias={availableCategorias}
                produtos={uniqueProdutos}
                selectedModulos={selectedModulos}
                selectedCategorias={selectedCategorias}
                selectedProdutos={selectedProdutos}
                onModuloToggle={toggleModulo}
                onCategoriaToggle={toggleCategoria}
                onProdutoToggle={toggleProduto}
                onClearFilters={clearFilters}
              />
            </div>
          )}
          
          <div className={
            viewMode === 'list' || !selectedDate 
              ? (showFilters ? 'lg:col-span-3' : 'lg:col-span-4') 
              : (showFilters ? 'lg:col-span-2' : 'lg:col-span-3')
          }>
            {viewMode === 'month' ? (
              <MonthView
                currentDate={currentDate}
                events={filteredEvents}
                onDateChange={setCurrentDate}
                onDayClick={handleDayClick}
                selectedDate={selectedDate}
              />
            ) : viewMode === 'year' ? (
              <YearView
                year={currentDate.getFullYear()}
                events={filteredEvents}
                onMonthClick={handleMonthClick}
                onYearChange={handleYearChange}
              />
            ) : (
              <ListView
                events={filteredEvents}
                allModulos={availableModulos}
              />
            )}
          </div>
          
          {selectedDate && viewMode !== 'list' && (
            <div className="lg:col-span-1">
              <DayDetail
                date={selectedDate}
                events={dayEvents}
                allModulos={availableModulos}
                onClose={() => setSelectedDate(null)}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
