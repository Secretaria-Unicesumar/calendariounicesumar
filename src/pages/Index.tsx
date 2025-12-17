import { useState, useEffect } from "react";
import { Calendar, Grid3x3, List, Filter, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonthView } from "@/components/Calendar/MonthView";
import { YearView } from "@/components/Calendar/YearView";
import { ListView } from "@/components/Calendar/ListView";
import { DayDetail } from "@/components/Calendar/DayDetail";
import { FilterPanel } from "@/components/Calendar/FilterPanel";
import { Footer } from "@/components/Footer";
import { Tutorial } from "@/components/Tutorial";
import { CalendarEvent, parseCSV, getEventsForDate } from "@/utils/csvParser";
import { printCalendar } from "@/components/Calendar/PrintView";
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
      const basePath = import.meta.env.BASE_URL;
      const loadedEvents = await parseCSV(`${basePath}calendario.csv`);
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
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        <header className="mb-4 sm:mb-8">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <img src={logoUnicesumar} alt="Unicesumar" className="h-8 sm:h-10 md:h-12" />
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-calendar-header">
                  Calendário Administrativo
                </h1>
              </div>
              <Tutorial />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                size="sm"
                className="hidden lg:flex"
              >
                <Filter className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filtros</span>
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                onClick={() => setViewMode('month')}
                size="sm"
              >
                <Calendar className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Mês</span>
              </Button>
              <Button
                variant={viewMode === 'year' ? 'default' : 'outline'}
                onClick={() => setViewMode('year')}
                size="sm"
              >
                <Grid3x3 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Ano</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                size="sm"
              >
                <List className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Lista</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => printCalendar(filteredEvents, availableModulos, logoUnicesumar)}
                size="sm"
              >
                <Printer className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Visualize e gerencie eventos administrativos por módulo e categoria
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6">
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
