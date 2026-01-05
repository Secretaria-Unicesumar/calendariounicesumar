import { CalendarEvent, getModuleColor } from "@/utils/csvParser";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PrintViewProps {
  events: CalendarEvent[];
  allModulos: string[];
}

interface GroupedEvents {
  [modulo: string]: {
    [categoria: string]: CalendarEvent[];
  };
}

export const PrintView = ({ events, allModulos }: PrintViewProps) => {
  // Group events by module and category
  const groupedEvents: GroupedEvents = {};
  
  events.forEach(event => {
    if (!groupedEvents[event.modulo]) {
      groupedEvents[event.modulo] = {};
    }
    if (!groupedEvents[event.modulo][event.categoria]) {
      groupedEvents[event.modulo][event.categoria] = [];
    }
    groupedEvents[event.modulo][event.categoria].push(event);
  });

  // Sort modules
  const sortedModulos = Object.keys(groupedEvents).sort();

  const formatDateRange = (start: Date, end: Date): string => {
    if (!(start instanceof Date) || isNaN(start.getTime()) || 
        !(end instanceof Date) || isNaN(end.getTime())) {
      return "Data inválida";
    }
    
    const startStr = format(start, "dd/MM/yyyy", { locale: ptBR });
    const endStr = format(end, "dd/MM/yyyy", { locale: ptBR });
    
    if (startStr === endStr) {
      return startStr;
    }
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="print-view p-4 bg-white text-black">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-view, .print-view * {
              visibility: visible;
            }
            .print-view {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white !important;
              color: black !important;
              font-size: 10px;
            }
            .print-module {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      
      <div className="text-center mb-4 border-b pb-2">
        <h1 className="text-lg font-bold">Calendário Administrativo</h1>
        <p className="text-xs text-gray-600">
          Gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
        {sortedModulos.map(modulo => {
          const moduleColor = getModuleColor(modulo, allModulos);
          const categorias = Object.keys(groupedEvents[modulo]).sort((a, b) => {
            const minOrdemA = Math.min(...groupedEvents[modulo][a].map(e => e.ordem));
            const minOrdemB = Math.min(...groupedEvents[modulo][b].map(e => e.ordem));
            return minOrdemA - minOrdemB;
          });
          
          return (
            <div 
              key={modulo} 
              className="print-module border rounded p-2 text-xs"
              style={{ borderLeftColor: moduleColor, borderLeftWidth: '4px' }}
            >
              <h2 
                className="font-bold text-sm mb-2 pb-1 border-b"
                style={{ color: moduleColor }}
              >
                {modulo}
              </h2>
              
              {categorias.map(categoria => {
                const categoryEvents = groupedEvents[modulo][categoria]
                  .sort((a, b) => a.ordem - b.ordem || a.dataInicio.getTime() - b.dataInicio.getTime());
                
                return (
                  <div key={categoria} className="mb-2">
                    <h3 className="font-semibold text-[11px] text-gray-700 mb-1">
                      {categoria}
                    </h3>
                    <ul className="space-y-0.5 pl-2">
                      {categoryEvents.map((event, idx) => (
                        <li key={idx} className="text-[10px] leading-tight">
                          <span className="font-medium">
                            {formatDateRange(event.dataInicio, event.dataFim)}
                          </span>
                          {" - "}
                          <span className="text-gray-600">{event.atividade}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

import logoSecretaria from "@/assets/logo-secretaria-academica.png";
import logoCSC from "@/assets/logo-csc.png";
import logoUnicesumarFooter from "@/assets/logo-unicesumar.png";

export const printCalendar = async (events: CalendarEvent[], allModulos: string[], logoUrl?: string) => {
  // Convert logos to base64 for print window
  const convertToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error('Error loading image:', e);
      return '';
    }
  };

  const [logoBase64, logoSecretariaBase64, logoCscBase64, logoUnicesumarFooterBase64] = await Promise.all([
    logoUrl ? convertToBase64(logoUrl) : Promise.resolve(''),
    convertToBase64(logoSecretaria),
    convertToBase64(logoCSC),
    convertToBase64(logoUnicesumarFooter),
  ]);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita pop-ups para imprimir o calendário.');
    return;
  }

  // Group events
  const groupedEvents: GroupedEvents = {};
  events.forEach(event => {
    if (!groupedEvents[event.modulo]) {
      groupedEvents[event.modulo] = {};
    }
    if (!groupedEvents[event.modulo][event.categoria]) {
      groupedEvents[event.modulo][event.categoria] = [];
    }
    groupedEvents[event.modulo][event.categoria].push(event);
  });

  const sortedModulos = Object.keys(groupedEvents).sort();

  const formatDateRange = (start: Date, end: Date): string => {
    if (!(start instanceof Date) || isNaN(start.getTime()) || 
        !(end instanceof Date) || isNaN(end.getTime())) {
      return "Data inválida";
    }
    
    const formatDate = (d: Date) => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    const startStr = formatDate(start);
    const endStr = formatDate(end);
    
    return startStr === endStr ? startStr : `${startStr} - ${endStr}`;
  };

  const getColor = (modulo: string): string => {
    const uniqueModulos = Array.from(new Set(allModulos)).sort();
    const index = uniqueModulos.indexOf(modulo);
    const colors = [
      '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', 
      '#EF4444', '#EC4899', '#06B6D4', '#84CC16'
    ];
    return colors[index % colors.length];
  };

  // Get unique modalidades for each module
  const getModalidadesForModule = (modulo: string): string => {
    const modalidades = new Set<string>();
    Object.values(groupedEvents[modulo]).forEach(categoryEvents => {
      categoryEvents.forEach(event => {
        if (event.produto) {
          modalidades.add(event.produto);
        }
      });
    });
    return Array.from(modalidades).join(', ');
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Calendário Administrativo</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 10px; padding: 10px; }
        .header { text-align: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #ccc; }
        .header img { height: 40px; margin-bottom: 8px; }
        .header h1 { font-size: 16px; margin-bottom: 5px; }
        .header p { font-size: 9px; color: #666; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .module { border: 1px solid #ddd; border-radius: 4px; padding: 8px; page-break-inside: avoid; }
        .module-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #eee; }
        .module-title { font-size: 11px; font-weight: bold; }
        .module-modalidade { font-size: 9px; color: #666; font-weight: normal; }
        .category { margin-bottom: 6px; }
        .category h3 { font-size: 10px; color: #444; margin-bottom: 3px; font-weight: 600; }
        .events { padding-left: 8px; }
        .event { font-size: 9px; line-height: 1.4; margin-bottom: 2px; }
        .event-date { font-weight: 600; }
        .event-name { color: #555; }
        .footer { margin-top: 20px; padding: 15px; background-color: #1e293b; border-radius: 6px; }
        .footer-qr-row { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px solid #334155; }
        .footer-text { font-size: 9px; color: #cbd5e1; flex: 1; }
        .footer-text a { color: #60a5fa; text-decoration: none; }
        .qr-code { width: 80px; height: 80px; background: white; padding: 4px; border-radius: 4px; }
        .footer-branding { display: flex; align-items: center; justify-content: space-between; }
        .footer-logos { display: flex; align-items: center; gap: 15px; }
        .footer-logos img { height: 30px; object-fit: contain; }
        .footer-logos img.logo-secretaria { height: 40px; width: 40px; }
        .footer-logos img.logo-csc { height: 30px; width: 30px; }
        .footer-copyright { font-size: 8px; color: #cbd5e1; text-align: right; }
        @media print {
          body { padding: 5mm; }
          .module { break-inside: avoid; }
          .footer { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Unicesumar" />` : ''}
        <h1>Calendário Administrativo</h1>
        <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      <div class="grid">
        ${sortedModulos.map(modulo => {
          const color = getColor(modulo);
          const categorias = Object.keys(groupedEvents[modulo]).sort((a, b) => {
            const minOrdemA = Math.min(...groupedEvents[modulo][a].map(e => e.ordem));
            const minOrdemB = Math.min(...groupedEvents[modulo][b].map(e => e.ordem));
            return minOrdemA - minOrdemB;
          });
          const modalidades = getModalidadesForModule(modulo);
          
          return `
            <div class="module" style="border-left: 4px solid ${color};">
              <div class="module-header">
                <span class="module-title" style="color: ${color};">${modulo}</span>
                <span class="module-modalidade">${modalidades}</span>
              </div>
              ${categorias.map(categoria => {
                const categoryEvents = groupedEvents[modulo][categoria]
                  .filter(e => e.dataInicio instanceof Date && !isNaN(e.dataInicio.getTime()))
                  .sort((a, b) => a.ordem - b.ordem || a.dataInicio.getTime() - b.dataInicio.getTime());
                
                return `
                  <div class="category">
                    <h3>${categoria}</h3>
                    <div class="events">
                      ${categoryEvents.map(event => `
                        <div class="event">
                          <span class="event-date">${formatDateRange(event.dataInicio, event.dataFim)}</span>
                          - <span class="event-name">${event.atividade}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('')}
      </div>
      <div class="footer">
        <div class="footer-qr-row">
          <p class="footer-text">O calendário atualizado pode ser consultado através do link: <a href="https://secretaria-unicesumar.github.io/calendariounicesumar/">https://secretaria-unicesumar.github.io/calendariounicesumar/</a> ou no QR Code ao lado.</p>
          <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://secretaria-unicesumar.github.io/calendariounicesumar/" alt="QR Code" />
        </div>
        <div class="footer-branding">
          <div class="footer-logos">
            ${logoSecretariaBase64 ? `<img class="logo-secretaria" src="${logoSecretariaBase64}" alt="Secretaria Acadêmica" />` : ''}
            ${logoCscBase64 ? `<img class="logo-csc" src="${logoCscBase64}" alt="CSC" />` : ''}
            ${logoUnicesumarFooterBase64 ? `<img src="${logoUnicesumarFooterBase64}" alt="Unicesumar" />` : ''}
          </div>
          <p class="footer-copyright">© 2026 CSC Secretaria Acadêmica Unicesumar | Desenvolvimento e Qualidade | Guilherme Caniato</p>
        </div>
      </div>
      <script>
        window.onload = () => { window.print(); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
