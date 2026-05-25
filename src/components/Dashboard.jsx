import React, { useMemo } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseDateString, getDaysDiff, getEventStatus } from '../utils/dateUtils';
import { PRODUCTS, getProductModuleLabel } from '../utils/productConfig';

const Dashboard = ({ data, referenceDate, productId }) => {
  const activeProduct = PRODUCTS[productId] || PRODUCTS.graduacao;

  // Função auxiliar para encontrar informações de prazos para um determinado evento
  const getModuleInfoForEvent = (eventName, label) => {
    const eventCategory = data.find(cat => 
      cat.eventos.some(ev => ev.nome === eventName)
    );
    const event = eventCategory?.eventos.find(ev => ev.nome === eventName);
    if (!event) return null;

    let active = null;
    let nextUpcoming = null;
    let minUpcomingDiff = Infinity;

    activeProduct.modules.forEach(mod => {
      const dates = event.datas[mod];
      if (!dates || dates.inicio === '-' || dates.fim === '-') return;

      const start = parseDateString(dates.inicio);
      const end = parseDateString(dates.fim);
      if (!start || !end) return;

      const status = getEventStatus(dates.inicio, dates.fim, referenceDate);

      if (status === 'active') {
        active = { mod, start, end, dates };
      } else if (status === 'upcoming') {
        const diff = getDaysDiff(referenceDate, start);
        if (diff < minUpcomingDiff) {
          minUpcomingDiff = diff;
          nextUpcoming = { mod, start, end, dates, diff };
        }
      }
    });

    if (active) {
      const totalDays = getDaysDiff(active.start, active.end);
      const elapsedDays = getDaysDiff(active.start, referenceDate);
      const percentage = Math.max(0, Math.min(100, Math.round((elapsedDays / totalDays) * 100)));
      const daysRemaining = getDaysDiff(referenceDate, active.end);

      return {
        type: 'active',
        mod: active.mod,
        name: getProductModuleLabel(productId, active.mod),
        start: active.start,
        end: active.end,
        percentage,
        daysRemaining,
        dates: active.dates,
        label
      };
    } else if (nextUpcoming) {
      const start = parseDateString(nextUpcoming.dates.inicio);
      const end = parseDateString(nextUpcoming.dates.fim);
      return {
        type: 'upcoming',
        mod: nextUpcoming.mod,
        name: getProductModuleLabel(productId, nextUpcoming.mod),
        start,
        end,
        percentage: 0,
        daysRemaining: nextUpcoming.diff,
        dates: nextUpcoming.dates,
        label
      };
    }

    return null;
  };

  // Encontra o módulo "Rodando" (Período letivo) e o módulo "Em Captação"
  const runningModule = useMemo(() => {
    return getModuleInfoForEvent('Período letivo', activeProduct.type === 'semestral' ? 'Rodando / Semestre' : 'Rodando / Letivo');
  }, [data, referenceDate, productId]);

  const enrollingModule = useMemo(() => {
    return getModuleInfoForEvent('Período de Captação', 'Em Captação');
  }, [data, referenceDate, productId]);

  // 2. Coleta todos os eventos e calcula os próximos prazos do produto ativo (excluindo Letivo e Captação)
  const deadlines = useMemo(() => {
    const list = [];

    data.forEach(category => {
      category.eventos.forEach(event => {
        // NÃO considera Período letivo e captação nos prazos (prazos gerais já exibidos à esquerda)
        const nameClean = event.nome.toLowerCase();
        if (nameClean.includes('letivo') || nameClean.includes('capta')) {
          return;
        }

        activeProduct.modules.forEach(mod => {
          const dates = event.datas[mod];
          if (!dates || dates.inicio === '-' || dates.fim === '-') return;

          const start = parseDateString(dates.inicio);
          const end = parseDateString(dates.fim);
          if (!start || !end) return;

          const status = getEventStatus(dates.inicio, dates.fim, referenceDate);
          
          if (status === 'active') {
            const daysLeft = getDaysDiff(referenceDate, end);
            list.push({
              eventName: event.nome,
              categoryName: category.categoria,
              mod,
              status,
              daysLeft,
              label: `Termina em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`,
              dateLabel: `Fim em ${dates.fim}`,
              urgency: daysLeft <= 5 ? 'high' : 'medium'
            });
          } else if (status === 'upcoming') {
            const daysUntil = getDaysDiff(referenceDate, start);
            list.push({
              eventName: event.nome,
              categoryName: category.categoria,
              mod,
              status,
              daysLeft: daysUntil,
              label: `Começa em ${daysUntil} ${daysUntil === 1 ? 'dia' : 'dias'}`,
              dateLabel: `Início em ${dates.inicio}`,
              urgency: 'low'
            });
          }
        });
      });
    });

    return list
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 10); // Aumentado para 10 prazos
  }, [data, referenceDate, productId]);

  return (
    <div className="dashboard-grid two-columns animate-fade-in">
      {/* CARD 1: MÓDULOS EM FOCO (RODANDO E EM CAPTAÇÃO) */}
      <div className="glass dashboard-card card-active-module" style={{ minHeight: '340px' }}>
        <div className="card-header-icon" style={{ marginBottom: '0.75rem' }}>
          <Calendar className="icon-blue" size={22} />
          <h3>Módulos em Foco</h3>
        </div>

        <div className="module-info-body" style={{ gap: '1rem' }}>
          {/* 1. MÓDULO LETIVO (RODANDO) */}
          <div className="module-focus-item">
            <div className="module-title-wrapper" style={{ marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="module-badge-glow" style={{ fontSize: '0.9rem', padding: '0.2rem 0.5rem', background: activeProduct.type === 'semestral' ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' : '' }}>
                  {runningModule ? runningModule.name : 'N/A'}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                  [{activeProduct.type === 'semestral' ? 'Semestre Letivo' : 'Rodando / Letivo'}]
                </span>
              </div>
              {runningModule && (
                <span className={`status-badge-mini ${runningModule.type === 'active' ? 'active' : 'upcoming'}`}>
                  {runningModule.type === 'active' ? 'Em Andamento' : 'Próximo'}
                </span>
              )}
            </div>

            {runningModule ? (
              <>
                <div className="progress-container" style={{ marginBottom: '0.4rem' }}>
                  <div className="progress-text" style={{ fontSize: '0.7rem' }}>
                    <span>Progresso do período</span>
                    <strong>{runningModule.percentage}%</strong>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${runningModule.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="module-dates-details" style={{ fontSize: '0.725rem', padding: '0.35rem' }}>
                  <div>
                    <span className="label-muted" style={{ fontSize: '0.6rem' }}>Início</span>
                    <span>{runningModule.dates.inicio}</span>
                  </div>
                  <div>
                    <span className="label-muted" style={{ fontSize: '0.6rem' }}>Término</span>
                    <span>{runningModule.dates.fim}</span>
                  </div>
                  <div>
                    <span className="label-muted" style={{ fontSize: '0.6rem' }}>
                      {runningModule.type === 'active' ? 'Restam' : 'Faltam'}
                    </span>
                    <span className="highlight-days" style={{ fontSize: '0.725rem' }}>
                      {runningModule.daysRemaining} {runningModule.daysRemaining === 1 ? 'dia' : 'dias'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Nenhum período letivo ativo.</p>
            )}
          </div>

          <div style={{ borderTop: '1px dashed var(--border)', margin: '0.1rem 0' }} />

          {/* 2. MÓDULO EM CAPTAÇÃO */}
          <div className="module-focus-item">
            <div className="module-title-wrapper" style={{ marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="module-badge-glow" style={{ fontSize: '0.9rem', padding: '0.2rem 0.5rem', background: 'linear-gradient(135deg, var(--accent-green), #047857)' }}>
                  {enrollingModule ? enrollingModule.name : 'N/A'}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                  [Captação]
                </span>
              </div>
              {enrollingModule && (
                <span className={`status-badge-mini ${enrollingModule.type === 'active' ? 'active' : 'upcoming'}`} style={{
                  backgroundColor: enrollingModule.type === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  color: enrollingModule.type === 'active' ? '#34d399' : '#60a5fa'
                }}>
                  {enrollingModule.type === 'active' ? 'Em Andamento' : 'Próximo'}
                </span>
              )}
            </div>

            {enrollingModule ? (
              <>
                <div className="progress-container" style={{ marginBottom: '0.4rem' }}>
                  <div className="progress-text" style={{ fontSize: '0.7rem' }}>
                    <span>Progresso da captação</span>
                    <strong>{enrollingModule.percentage}%</strong>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${enrollingModule.percentage}%`,
                        background: 'linear-gradient(to right, var(--accent-green), #34d399)',
                        boxShadow: '0 0 8px rgba(52, 211, 153, 0.5)'
                      }}
                    />
                  </div>
                </div>

                <div className="module-dates-details" style={{ fontSize: '0.725rem', padding: '0.35rem' }}>
                  <div>
                    <span className="label-muted" style={{ fontSize: '0.6rem' }}>Início</span>
                    <span>{enrollingModule.dates.inicio}</span>
                  </div>
                  <div>
                    <span className="label-muted" style={{ fontSize: '0.6rem' }}>Término</span>
                    <span>{enrollingModule.dates.fim}</span>
                  </div>
                  <div>
                    <span className="label-muted" style={{ fontSize: '0.6rem' }}>
                      {enrollingModule.type === 'active' ? 'Restam' : 'Faltam'}
                    </span>
                    <span className="highlight-days" style={{ fontSize: '0.725rem', color: 'var(--accent-green)' }}>
                      {enrollingModule.daysRemaining} {enrollingModule.daysRemaining === 1 ? 'dia' : 'dias'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Nenhum período de captação ativo.</p>
            )}
          </div>
        </div>
      </div>

      {/* CARD 2: PRÓXIMOS PRAZOS */}
      <div className="glass dashboard-card card-deadlines" style={{ minHeight: '340px' }}>
        <div className="card-header-icon">
          <Clock className="icon-orange" size={22} />
          <h3>Próximos Prazos</h3>
        </div>

        <div className="deadlines-list" style={{ maxHeight: '240px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {deadlines.length > 0 ? (
            deadlines.map((dl, idx) => (
              <div key={idx} className={`deadline-item ${dl.urgency}`} style={{ marginBottom: '0.6rem' }}>
                <div className="deadline-dot" />
                <div className="deadline-content">
                  <div className="deadline-row-main">
                    <span className="deadline-event-name" title={dl.eventName}>{dl.eventName}</span>
                    <span className="deadline-mod-badge">
                      {getProductModuleLabel(productId, dl.mod)}
                    </span>
                  </div>
                  <div className="deadline-row-sub">
                    <span className="deadline-days-text">{dl.label}</span>
                    <span className="deadline-date-text">{dl.dateLabel}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-deadlines">
              <CheckCircle2 className="icon-green" size={24} />
              <p>Nenhum prazo ativo ou próximo cadastrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
