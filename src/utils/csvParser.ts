export interface CalendarEvent {
  atividade: string;
  produto: string;
  categoria: string;
  modulo: string;
  dataInicio: Date;
  dataFim: Date;
}

export const parseCSV = async (filePath: string): Promise<CalendarEvent[]> => {
  try {
    const response = await fetch(filePath);
    const text = await response.text();
    
    const lines = text.split('\n').filter(line => line.trim());
    const events: CalendarEvent[] = [];
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(';');
      
      if (parts.length >= 6) {
        const [atividade, produto, categoria, modulo, dataInicioStr, dataFimStr] = parts;
        
        // Parse dates in DD/MM/YYYY format
        const parseDate = (dateStr: string): Date => {
          const [day, month, year] = dateStr.trim().split('/');
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        };
        
        events.push({
          atividade: atividade.trim(),
          produto: produto.trim(),
          categoria: categoria.trim(),
          modulo: modulo.trim(),
          dataInicio: parseDate(dataInicioStr),
          dataFim: parseDate(dataFimStr),
        });
      }
    }
    
    return events;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
};

export const getModuleColor = (modulo: string, allModulos: string[]): string => {
  const uniqueModulos = Array.from(new Set(allModulos)).sort();
  const index = uniqueModulos.indexOf(modulo);
  const colors = [
    'hsl(var(--module-1))',
    'hsl(var(--module-2))',
    'hsl(var(--module-3))',
    'hsl(var(--module-4))',
    'hsl(var(--module-5))',
    'hsl(var(--module-6))',
    'hsl(var(--module-7))',
    'hsl(var(--module-8))',
  ];
  return colors[index % colors.length];
};

export const getEventsForDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  return events.filter(event => {
    const eventStart = new Date(event.dataInicio);
    const eventEnd = new Date(event.dataFim);
    const checkDate = new Date(date);
    
    // Reset time parts for comparison
    eventStart.setHours(0, 0, 0, 0);
    eventEnd.setHours(0, 0, 0, 0);
    checkDate.setHours(0, 0, 0, 0);
    
    return checkDate >= eventStart && checkDate <= eventEnd;
  });
};
