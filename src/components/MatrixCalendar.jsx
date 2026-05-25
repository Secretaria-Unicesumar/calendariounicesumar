import React, { useState, useMemo } from 'react';
import { getEventStatus } from '../utils/dateUtils';
import { PRODUCTS, getProductModuleLabel, sortCategories } from '../utils/productConfig';
import { Sparkles, Search } from 'lucide-react';

const MatrixCalendar = ({ data, referenceDate, productId, searchQuery = '', selectedCategory = 'all' }) => {
  const activeProduct = PRODUCTS[productId] || PRODUCTS.graduacao;
  const [hoveredModule, setHoveredModule] = useState(null);

  // Calcula estilo de cores de cabeçalho dinamicamente
  const getModuleStyle = (modKey, index) => {
    if (modKey === '1S') return { bg: 'var(--accent-blue)', color: 'white', bgSoft: 'rgba(59, 130, 246, 0.05)' };
    if (modKey === '2S') return { bg: 'var(--accent-green)', color: 'white', bgSoft: 'rgba(16, 185, 129, 0.05)' };

    const styles = [
      { bg: 'var(--accent-blue)', color: 'white', bgSoft: 'rgba(59, 130, 246, 0.05)' },
      { bg: '#60a5fa', color: '#0f172a', bgSoft: 'rgba(96, 165, 250, 0.05)' },
      { bg: 'var(--accent-green)', color: 'white', bgSoft: 'rgba(16, 185, 129, 0.05)' },
      { bg: '#34d399', color: '#0f172a', bgSoft: 'rgba(52, 211, 153, 0.05)' }
    ];

    return styles[index % styles.length];
  };

  // 1. Filtra os dados conforme a busca e categoria selecionada, aplicando ordenação customizada
  const filteredData = useMemo(() => {
    const rawFiltered = data
      .map(cat => {
        if (selectedCategory !== 'all' && cat.categoria !== selectedCategory) {
          return null;
        }

        const matchedEvents = cat.eventos.filter(ev =>
          ev.nome.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (matchedEvents.length === 0) return null;

        return {
          ...cat,
          eventos: matchedEvents
        };
      })
      .filter(Boolean);

    return sortCategories(rawFiltered);
  }, [data, searchQuery, selectedCategory]);

  // Renderiza a célula de data com status dinâmico
  const renderDateCell = (ev, m, index, type) => {
    const dates = ev.datas[m];
    const dateValue = dates ? dates[type] : '-';
    
    if (!dates || dateValue === '-') {
      return (
        <td 
          style={{ textAlign: 'center', color: 'var(--text-muted)', opacity: 0.4 }}
          className={hoveredModule === m ? 'col-hovered' : ''}
          onMouseEnter={() => setHoveredModule(m)}
          onMouseLeave={() => setHoveredModule(null)}
        >
          -
        </td>
      );
    }

    const status = getEventStatus(dates.inicio, dates.fim, referenceDate);
    const style = getModuleStyle(m, index);
    
    let cellClass = `matrix-cell-date status-${status}`;
    if (hoveredModule === m) {
      cellClass += ' col-hovered';
    }

    const isCurrentCellActive = status === 'active';
    const modLabel = getProductModuleLabel(productId, m);

    return (
      <td 
        className={cellClass}
        onMouseEnter={() => setHoveredModule(m)}
        onMouseLeave={() => setHoveredModule(null)}
        style={{
          position: 'relative',
          transition: 'all 0.2s ease',
          backgroundColor: isCurrentCellActive 
            ? 'var(--cell-active-bg)' 
            : hoveredModule === m 
              ? style.bgSoft 
              : 'transparent'
        }}
      >
        <div className="matrix-cell-content-wrapper">
          <span className="date-text">{dateValue}</span>
          <span className={`status-dot-indicator ${status}`} />
        </div>

        {/* Tooltip rápido */}
        <div className="matrix-cell-tooltip">
          <strong>{ev.nome} ({modLabel})</strong>
          <p>{type === 'inicio' ? 'Início das atividades' : 'Encerramento'}</p>
          <div className="tooltip-period">
            <span>De: {dates.inicio}</span>
            <span>Até: {dates.fim}</span>
          </div>
          <span className={`status-badge-mini ${status}`} style={{ marginTop: '0.4rem', display: 'inline-block' }}>
            {status === 'active' ? 'Em Andamento' : status === 'upcoming' ? 'Futuro' : 'Finalizado'}
          </span>
        </div>
      </td>
    );
  };

  const highlightTerm = (text, term) => {
    if (!term) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === term.toLowerCase() 
            ? <mark key={i} className="highlighted-text">{part}</mark> 
            : part
        )}
      </span>
    );
  };

  // Quantidade total de colunas para colspan correto
  const totalTableColumns = 1 + activeProduct.modules.length * 2;

  return (
    <div className="glass matrix-card-outer animate-fade-in">
      <div className="matrix-header-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles className="icon-blue" size={18} />
          <h3>Matriz Geral de Eventos - {activeProduct.name}</h3>
        </div>
        <div className="matrix-legend-mini">
          <span className="legend-dot-item"><span className="dot past" /> Finalizado</span>
          <span className="legend-dot-item"><span className="dot active" /> Em Andamento</span>
          <span className="legend-dot-item"><span className="dot upcoming" /> Futuro</span>
        </div>
      </div>

      <div className="matrix-scroll-container">
        <table className="matrix-table-premium">
          <thead>
            {/* Primeira linha do header */}
            <tr className="header-main-row">
              <th rowSpan="2" className="header-col-event">
                Atividades Acadêmicas
              </th>
              {activeProduct.modules.map((m, idx) => {
                const style = getModuleStyle(m, idx);
                return (
                  <th 
                    key={m} 
                    colSpan="2" 
                    className={`header-col-module ${hoveredModule === m ? 'header-col-hovered' : ''}`}
                    onMouseEnter={() => setHoveredModule(m)}
                    onMouseLeave={() => setHoveredModule(null)}
                    style={{
                      backgroundColor: style.bg,
                      color: style.color,
                      textAlign: 'center',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    {getProductModuleLabel(productId, m)}
                  </th>
                );
              })}
            </tr>
            {/* Segunda linha do header */}
            <tr className="header-sub-row">
              {activeProduct.modules.map(m => (
                <React.Fragment key={`${m}-sub`}>
                  <th 
                    className={`header-col-sub ${hoveredModule === m ? 'header-col-hovered' : ''}`}
                    onMouseEnter={() => setHoveredModule(m)}
                    onMouseLeave={() => setHoveredModule(null)}
                    style={{ opacity: 0.95 }}
                  >
                    Início
                  </th>
                  <th 
                    className={`header-col-sub ${hoveredModule === m ? 'header-col-hovered' : ''}`}
                    onMouseEnter={() => setHoveredModule(m)}
                    onMouseLeave={() => setHoveredModule(null)}
                    style={{ opacity: 0.95, borderRight: '1.5px solid var(--border)' }}
                  >
                    Término
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {filteredData.map((cat, catIdx) => (
              <React.Fragment key={catIdx}>
                {/* Linha da Categoria */}
                <tr className="category-header-row">
                  <td colSpan={totalTableColumns}>
                    <div className="category-row-flex">
                      <span className="category-folder-indicator" style={{ backgroundColor: activeProduct.color }} />
                      <span className="category-text-title">{cat.categoria}</span>
                      <span className="category-count-badge">{cat.eventos.length} itens</span>
                    </div>
                  </td>
                </tr>

                {/* Linhas dos Eventos */}
                {cat.eventos.map((ev, evIdx) => (
                  <tr key={evIdx} className="matrix-event-data-row">
                    <td className="matrix-event-name-col">
                      <div className="event-name-flex">
                        <span className="event-bullet-point" />
                        <span className="event-title-span">{highlightTerm(ev.nome, searchQuery)}</span>
                      </div>
                    </td>
                    
                    {/* Células de data dinâmicas */}
                    {activeProduct.modules.map((m, idx) => (
                      <React.Fragment key={`${evIdx}-${m}`}>
                        {renderDateCell(ev, m, idx, 'inicio')}
                        {renderDateCell(ev, m, idx, 'fim')}
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {filteredData.length === 0 && (
              <tr>
                <td colSpan={totalTableColumns} className="matrix-empty-cell">
                  <div className="matrix-empty-wrapper">
                    <Search size={32} className="text-muted" style={{ marginBottom: '0.5rem' }} />
                    <p className="text-muted">Nenhum evento acadêmico corresponde à sua busca.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatrixCalendar;
