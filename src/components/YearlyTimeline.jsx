import React, { useMemo, useState } from 'react';
import { parseDateString, getEventStatus, getDaysDiff } from '../utils/dateUtils';
import { PRODUCTS, getProductModuleLabel } from '../utils/productConfig';
import { Filter, Eye, EyeOff, LayoutGrid } from 'lucide-react';

const YearlyTimeline = ({ data, referenceDate, productId, selectedYear }) => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  const [filterModule, setFilterModule] = useState('all');
  const [showGridlines, setShowGridlines] = useState(true);

  const activeProduct = PRODUCTS[productId] || PRODUCTS.graduacao;

  const getModuleStyle = (modKey, index) => {
    if (modKey === '1S') return { bg: 'rgba(59, 130, 246, 0.75)', border: '#3b82f6', text: '#ffffff', bgClass: 'mod-51-bg' };
    if (modKey === '2S') return { bg: 'rgba(16, 185, 129, 0.75)', border: '#10b981', text: '#ffffff', bgClass: 'mod-53-bg' };

    const styles = [
      { bg: 'rgba(59, 130, 246, 0.75)', border: '#3b82f6', text: '#ffffff', bgClass: 'mod-51-bg' }, // Azul
      { bg: 'rgba(157, 195, 230, 0.75)', border: '#2f5597', text: '#002060', bgClass: 'mod-52-bg' }, // Azul Claro
      { bg: 'rgba(16, 185, 129, 0.75)', border: '#10b981', text: '#ffffff', bgClass: 'mod-53-bg' }, // Verde
      { bg: 'rgba(198, 224, 180, 0.75)', border: '#548235', text: '#385723', bgClass: 'mod-54-bg' }  // Verde Claro
    ];

    return styles[index % styles.length];
  };

  // Calcula a posição percentual dinâmica baseada no ano letivo ativo (selectedYear)
  const getPosition = (dateObj) => {
    if (!dateObj) return 0;
    const startOfYear = new Date(selectedYear, 0, 1);
    const endOfYear = new Date(selectedYear, 11, 31);
    
    if (dateObj < startOfYear) return 0;
    if (dateObj > endOfYear) return 100;
    
    const totalMs = endOfYear - startOfYear;
    const diffMs = dateObj - startOfYear;
    return (diffMs / totalMs) * 100;
  };

  const ganttRows = useMemo(() => {
    const rows = [];
    
    data.forEach(category => {
      category.eventos.forEach(event => {
        const eventPeriods = [];
        
        activeProduct.modules.forEach((m, idx) => {
          if (filterModule !== 'all' && filterModule !== m) return;
          
          const dates = event.datas[m];
          if (!dates || dates.inicio === '-' || dates.fim === '-') return;
          
          const start = parseDateString(dates.inicio);
          const end = parseDateString(dates.fim);
          
          if (start && end) {
            const left = getPosition(start);
            const right = getPosition(end);
            const width = Math.max(1, right - left);
            const status = getEventStatus(dates.inicio, dates.fim, referenceDate);
            
            eventPeriods.push({
              mod: m,
              startStr: dates.inicio,
              endStr: dates.fim,
              start,
              end,
              left,
              width,
              status,
              index: idx
            });
          }
        });
        
        if (eventPeriods.length > 0) {
          rows.push({
            eventName: event.nome,
            categoryName: category.categoria,
            periods: eventPeriods
          });
        }
      });
    });

    return rows;
  }, [data, filterModule, referenceDate, productId, selectedYear]);

  const referenceLinePos = useMemo(() => {
    return getPosition(referenceDate);
  }, [referenceDate, selectedYear]);

  return (
    <div className="glass yearly-gantt-container animate-fade-in">
      {/* HEADER DE CONTROLES DO GANTT */}
      <div className="gantt-header">
        <div>
          <h3>Gráfico de Gantt Acadêmico - {selectedYear}</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Visualização cronológica anual e sobreposição de eventos ({activeProduct.name} - {selectedYear}).
          </p>
        </div>
        
        <div className="gantt-controls">
          <div className="control-select-wrapper">
            <Filter size={14} className="text-muted" />
            <select 
              value={filterModule} 
              onChange={(e) => setFilterModule(e.target.value)}
              className="gantt-select"
            >
              <option value="all">Ver Todos</option>
              {activeProduct.modules.map(m => (
                <option key={m} value={m}>
                  {getProductModuleLabel(productId, m)}
                </option>
              ))}
            </select>
          </div>

          <button 
            className={`btn btn-outline btn-icon-text ${showGridlines ? 'active' : ''}`}
            onClick={() => setShowGridlines(!showGridlines)}
            title="Alternar grade visual"
          >
            {showGridlines ? <Eye size={16} /> : <EyeOff size={16} />}
            Grade
          </button>
        </div>
      </div>

      {/* ÁREA GRÁFICA DO GANTT */}
      <div className="gantt-viewport">
        <div className="gantt-chart-table">
          <div className="gantt-row gantt-header-row">
            <div className="gantt-col-title">Atividades / Eventos</div>
            <div className="gantt-col-timeline">
              <div className="gantt-months-grid">
                {months.map((m, i) => (
                  <div key={m} className="gantt-month-label">
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="gantt-body-container" style={{ position: 'relative' }}>
            <div 
              className="gantt-reference-line"
              style={{ left: `calc(280px + (100% - 280px) * (${referenceLinePos} / 100))` }}
            >
              <div className="gantt-reference-label">Simulado</div>
              <div className="gantt-reference-dot" />
            </div>

            {ganttRows.map((row, idx) => (
              <div key={idx} className="gantt-row gantt-data-row">
                <div className="gantt-col-title">
                  <span className="gantt-category-tag">{row.categoryName}</span>
                  <span className="gantt-event-name" title={row.eventName}>{row.eventName}</span>
                </div>

                <div className="gantt-col-timeline">
                  {showGridlines && (
                    <div className="gantt-gridlines-bg">
                      {months.map((_, i) => (
                        <div key={i} className="gantt-gridline-col" />
                      ))}
                    </div>
                  )}

                  <div className="gantt-bars-container" style={{ height: '100%', position: 'relative', minHeight: '36px' }}>
                    {row.periods.map((period, pIdx) => {
                      const style = getModuleStyle(period.mod, period.index);
                      const daysTotal = getDaysDiff(period.start, period.end);
                      const isEventActive = period.status === 'active';
                      const label = getProductModuleLabel(productId, period.mod);

                      return (
                        <div
                          key={pIdx}
                          className={`gantt-event-bar mod-${period.mod} ${isEventActive ? 'bar-pulse-active' : ''} ${period.status}`}
                          style={{
                            position: 'absolute',
                            left: `${period.left}%`,
                            width: `${period.width}%`,
                            backgroundColor: style.bg,
                            border: `1.5px solid ${style.border}`,
                            color: style.text,
                            borderRadius: '6px',
                            height: '24px',
                            top: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 8px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease',
                            zIndex: isEventActive ? 5 : 2
                          }}
                        >
                          <span className="gantt-bar-text">{label}</span>
                          
                          <div className="gantt-tooltip">
                            <div className="gantt-tooltip-header">
                              <span className="category">{row.categoryName}</span>
                              <span className={`status-badge-mini ${period.status}`}>
                                {period.status === 'active' ? 'Ativo' : period.status === 'upcoming' ? 'Futuro' : 'Encerrado'}
                              </span>
                            </div>
                            <h4 className="title">{row.eventName}</h4>
                            <div className="gantt-tooltip-details">
                              <p><strong>Período:</strong> {label}</p>
                              <p><strong>Início:</strong> {period.startStr}</p>
                              <p><strong>Término:</strong> {period.endStr}</p>
                              <p><strong>Duração:</strong> {daysTotal} dias</p>
                              {isEventActive && (
                                <p className="gantt-tooltip-highlight-active">
                                  🔥 Em andamento!
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {ganttRows.length === 0 && (
              <div className="gantt-empty-state">
                <LayoutGrid size={32} className="text-muted" style={{ marginBottom: '0.5rem' }} />
                <p className="text-muted">Nenhum evento corresponde aos filtros selecionados.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="gantt-legend-footer">
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Cabeçalhos:</span>
          {activeProduct.modules.map((m, idx) => {
            const style = getModuleStyle(m, idx);
            return (
              <div key={m} className="legend-badge-item" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span 
                  className={`legend-badge-dot ${style.bgClass}`} 
                  style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderHex: '50%',
                    borderRadius: '50%',
                    display: 'inline-block'
                  }} 
                />
                <strong>{getProductModuleLabel(productId, m)}</strong>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem' }} className="text-muted">Status:</span>
          <span className="legend-status-text upcoming">⚪ Futuro</span>
          <span className="legend-status-text active">🟢 Ativo (Glow)</span>
          <span className="legend-status-text past">⚫ Encerrado</span>
        </div>
      </div>
    </div>
  );
};

export default YearlyTimeline;
