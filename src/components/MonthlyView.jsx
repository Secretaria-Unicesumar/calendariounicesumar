import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { parseDateString, getEventStatus } from '../utils/dateUtils';
import { PRODUCTS, getProductModuleLabel } from '../utils/productConfig';

const MonthlyView = ({ data, referenceDate, productId }) => {
  const activeProduct = PRODUCTS[productId] || PRODUCTS.graduacao;
  
  const [currentYear, setCurrentYear] = useState(referenceDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(referenceDate.getMonth()); // 0-11

  // Sincroniza a visão mensal com a data de referência quando esta mudar
  useEffect(() => {
    setCurrentYear(referenceDate.getFullYear());
    setCurrentMonth(referenceDate.getMonth());
  }, [referenceDate]);

  const monthsList = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Navegação de meses
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Coleta todos os eventos válidos com suas datas analisadas do produto ativo
  const allParsedEvents = useMemo(() => {
    const list = [];
    data.forEach(category => {
      category.eventos.forEach(event => {
        activeProduct.modules.forEach((m, idx) => {
          const dates = event.datas[m];
          if (!dates || dates.inicio === '-' || dates.fim === '-') return;

          const start = parseDateString(dates.inicio);
          const end = parseDateString(dates.fim);
          if (start && end) {
            // Mapeia o índice do módulo para a classe de cor existente
            const colorClass = idx === 0 ? 'mod-51' : idx === 1 ? 'mod-52' : idx === 2 ? 'mod-53' : 'mod-54';
            
            list.push({
              eventName: event.nome,
              categoryName: category.categoria,
              mod: m,
              start,
              end,
              colorClass
            });
          }
        });
      });
    });
    return list;
  }, [data, productId]);

  // Estrutura os dias do calendário mensal
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const cells = [];
    
    // Células vazias do mês anterior
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ isPadding: true, key: `pad-start-${i}` });
    }
    
    // Células do mês atual
    for (let day = 1; day <= totalDays; day++) {
      const cellDate = new Date(currentYear, currentMonth, day);
      
      // Encontra eventos ativos para esta data
      const activeEvents = allParsedEvents.filter(ev => {
        const s = new Date(ev.start.getFullYear(), ev.start.getMonth(), ev.start.getDate());
        const e = new Date(ev.end.getFullYear(), ev.end.getMonth(), ev.end.getDate());
        return cellDate >= s && cellDate <= e;
      });

      // Verifica se é a data de referência (hoje simulada)
      const isRefDate = 
        cellDate.getDate() === referenceDate.getDate() &&
        cellDate.getMonth() === referenceDate.getMonth() &&
        cellDate.getFullYear() === referenceDate.getFullYear();

      cells.push({
        isPadding: false,
        day,
        date: cellDate,
        activeEvents,
        isRefDate,
        key: `day-${day}`
      });
    }

    // Células vazias do próximo mês para fechar a semana
    const totalCellsSoFar = cells.length;
    const remainingCells = (7 - (totalCellsSoFar % 7)) % 7;
    for (let i = 0; i < remainingCells; i++) {
      cells.push({ isPadding: true, key: `pad-end-${i}` });
    }

    return cells;
  }, [currentYear, currentMonth, allParsedEvents, referenceDate]);

  return (
    <div className="glass monthly-view-container animate-fade-in">
      {/* CABEÇALHO DO CALENDÁRIO MENSAL */}
      <div className="monthly-view-header">
        <div>
          <h3>Calendário Mensal</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Visualização detalhada dia a dia de prazos ativos ({activeProduct.name}).
          </p>
        </div>
        <div className="monthly-nav-controls">
          <button className="btn btn-outline btn-icon-only" onClick={handlePrevMonth}>
            <ChevronLeft size={18} />
          </button>
          <span className="current-month-display">
            <strong>{monthsList[currentMonth]}</strong> {currentYear}
          </span>
          <button className="btn btn-outline btn-icon-only" onClick={handleNextMonth}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* GRADE DO CALENDÁRIO */}
      <div className="monthly-calendar-grid">
        {/* Nomes dos Dias da Semana */}
        {daysOfWeek.map(day => (
          <div key={day} className="monthly-grid-header-day">
            {day}
          </div>
        ))}

        {/* Células de Dias */}
        {calendarCells.map((cell, idx) => {
          if (cell.isPadding) {
            return <div key={cell.key} className="monthly-grid-cell padding-cell" />;
          }

          return (
            <div 
              key={cell.key} 
              className={`monthly-grid-cell ${cell.isRefDate ? 'is-reference-date' : ''}`}
            >
              <div className="day-number-wrapper">
                <span className={`day-number ${cell.isRefDate ? 'active-ref-day-num' : ''}`}>
                  {cell.day}
                </span>
                {cell.isRefDate && <span className="today-badge-dot" title="Hoje Simulador" />}
              </div>

              <div className="cell-events-list">
                {cell.activeEvents.slice(0, 3).map((ev, evIdx) => {
                  const modLabel = getProductModuleLabel(productId, ev.mod);
                  return (
                    <div 
                      key={evIdx} 
                      className={`monthly-event-strip ${ev.colorClass}`}
                      title={`[${modLabel}] ${ev.categoryName} - ${ev.eventName}`}
                    >
                      <span className="strip-mod-prefix">{ev.mod}</span>
                      <span className="strip-event-name">{ev.eventName}</span>
                    </div>
                  );
                })}
                {cell.activeEvents.length > 3 && (
                  <div className="monthly-event-more-tag" title="Passe o mouse no ícone 'i' no topo do dia para ver todos os prazos">
                    + {cell.activeEvents.length - 3} prazos
                  </div>
                )}
              </div>

              {cell.activeEvents.length > 0 && (
                <div className="cell-tooltip-trigger">
                  <Info size={12} className="cell-info-icon" />
                  <div className="cell-tooltip-content">
                    <strong>Prazos ativos no dia {cell.day}:</strong>
                    <ul>
                      {cell.activeEvents.map((ev, evIdx) => {
                        const modLabel = getProductModuleLabel(productId, ev.mod);
                        return (
                          <li key={evIdx} className={ev.colorClass}>
                            <strong>[{modLabel}]</strong> {ev.eventName} ({ev.categoryName})
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* LEGENDA DE CORES DINÂMICA */}
      <div className="monthly-legend">
        <span className="legend-label">Legenda {activeProduct.type === 'semestral' ? 'Semestres' : 'Módulos'}:</span>
        <div className="legend-items">
          {activeProduct.modules.map((m, idx) => {
            const colorClass = idx === 0 ? 'mod-51-bg' : idx === 1 ? 'mod-52-bg' : idx === 2 ? 'mod-53-bg' : 'mod-54-bg';
            return (
              <div key={m} className="legend-item">
                <span className={`legend-color ${colorClass}`} />
                {getProductModuleLabel(productId, m)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthlyView;
