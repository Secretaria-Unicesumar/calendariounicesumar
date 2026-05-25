import React, { useState } from 'react';
import { Calendar, ChevronRight, ChevronDown, Clock } from 'lucide-react';

const CalendarTable = ({ data }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Finalizado': return 'status-past';
      case 'Em andamento': return 'status-active';
      case 'Próximo': return 'status-upcoming';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="calendar-card glass animate-fade-in">
      <table>
        <thead>
          <tr>
            <th>Módulo</th>
            <th>Data Início</th>
            <th>Data Fim</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <React.Fragment key={item.id}>
              <tr onClick={() => toggleRow(item.id)} style={{ cursor: 'pointer' }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {expandedRow === item.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <span style={{ fontWeight: 600 }}>{item.modulo}</span>
                  </div>
                </td>
                <td>{formatDate(item.inicio)}</td>
                <td>{formatDate(item.fim)}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {item.eventos?.length || 0} eventos
                  </span>
                </td>
              </tr>
              
              {expandedRow === item.id && (
                <tr style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <td colSpan="5" style={{ padding: '0 0 1.5rem 3.5rem' }}>
                    <div className="animate-fade-in" style={{ display: 'grid', gap: '0.75rem' }}>
                      {item.eventos && item.eventos.length > 0 ? (
                        item.eventos.map((ev, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>
                            <span style={{ minWidth: '100px', color: 'var(--text-muted)' }}>{formatDate(ev.data)}</span>
                            <span style={{ fontWeight: 500 }}>{ev.nome}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Nenhum evento cadastrado para este módulo.</span>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CalendarTable;
