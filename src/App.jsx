import React, { useState, useEffect, useMemo } from 'react';
import MatrixCalendar from './components/MatrixCalendar';
import YearlyTimeline from './components/YearlyTimeline';
import MonthlyView from './components/MonthlyView';
import Dashboard from './components/Dashboard';
import initialData from './data/calendarData.js';
import { PRODUCTS, sortCategoryNames } from './utils/productConfig';
import { fetchGoogleSheetData } from './utils/googleSheetsUtils';
import { 
  Printer, Sun, Moon, Search, LayoutGrid, CalendarRange, 
  Calendar, Clock, Sparkles, GraduationCap, Briefcase, 
  BookOpen, Layers, Globe, AlertTriangle
} from 'lucide-react';
import './index.css';

const HARDCODED_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxYhTSF-WIvQqITKcusez42NaZAulAFE9crM9RBwjgybElcsVV2ub1m1kMQBWMjV6t9F-594AjNY2c/pub?output=csv';

function App() {
  const [data, setData] = useState(initialData);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  // Estados de Portfólio e Ano Ativos
  const [selectedProduct, setSelectedProduct] = useState('graduacao');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Estados de Busca e Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('matrix');

  // Estados de Sincronização do Google Sheets
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 1. Sincroniza em nuvem a partir do link fixo
  const loadSheetData = async (sheetId) => {
    if (!sheetId) return;
    setSyncStatus('loading');
    setSyncError('');
    try {
      const sheetData = await fetchGoogleSheetData(sheetId);
      
      const merged = { ...initialData };
      
      Object.keys(sheetData).forEach(year => {
        if (!merged[year]) {
          merged[year] = sheetData[year];
        } else {
          merged[year] = { ...merged[year] };
          Object.keys(sheetData[year]).forEach(prod => {
            if (sheetData[year][prod] && sheetData[year][prod].length > 0) {
              merged[year][prod] = sheetData[year][prod];
            }
          });
        }
      });

      setData(merged);
      setSyncStatus('success');
      localStorage.setItem('unicesumar_calendar_data', JSON.stringify(merged));
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
      setSyncError(err.message || 'Erro ao sincronizar com Google Sheets.');
    }
  };

  // 2. Carrega dados salvos locais no mount e inicia sincronização
  useEffect(() => {
    const saved = localStorage.getItem('unicesumar_calendar_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const migrated = {
            "2025": { ...initialData["2025"], graduacao: parsed }
          };
          setData(migrated);
          localStorage.setItem('unicesumar_calendar_data', JSON.stringify(migrated));
        } else {
          setData({
            ...initialData,
            ...parsed
          });
        }
      } catch (e) {
        setData(initialData);
      }
    }
    loadSheetData(HARDCODED_SHEET_URL);
  }, []);

  // Calcula dinamicamente quais anos existem na base de dados carregada
  const availableYears = useMemo(() => {
    const years = Object.keys(data).sort();
    if (years.length === 0) return ['2026'];
    return years;
  }, [data]);

  // Auto-ajusta o ano ativo se o ano selecionado sumir da base de dados
  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0] || '2026');
    }
  }, [availableYears, selectedYear]);

  // referenceDate é fixado sempre no dia de hoje
  const referenceDate = useMemo(() => new Date(), []);

  // Categoria e eventos correspondentes ao par (Ano, Produto) selecionado
  const activeProductData = useMemo(() => {
    return data[selectedYear]?.[selectedProduct] || [];
  }, [data, selectedYear, selectedProduct]);

  const categoriesList = useMemo(() => {
    const list = new Set();
    activeProductData.forEach(cat => list.add(cat.categoria));
    return ['all', ...sortCategoryNames(Array.from(list))];
  }, [activeProductData]);

  const getProductIcon = (productId) => {
    switch (productId) {
      case 'graduacao': return <GraduationCap size={20} />;
      case 'profissionalizante': return <Briefcase size={20} />;
      case 'tecnicos': return <Layers size={20} />;
      case 'pos_hibrida': return <BookOpen size={20} />;
      case 'presencial': return <Calendar size={20} />;
      default: return <Sparkles size={20} />;
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1400px' }}>
      <header className="animate-fade-in">
        <div>
          <div className="logo-section">
            <img src="./logo_blue.png" alt="Unicesumar" className="logo-img logo-light-only" />
            <img src="./logo_white.png" alt="Unicesumar" className="logo-img logo-dark-only" />
            {/* BADGE DE CONEXÃO DO GOOGLE SHEETS */}
            <div className={`sheets-sync-badge ${syncStatus}`}>
              {syncStatus === 'loading' && (
                <>
                  <span className="spinner-mini" />
                  <span>Sincronizando...</span>
                </>
              )}
              {syncStatus === 'success' && (
                <>
                  <Globe size={13} className="glowing-icon-green" />
                  <span>Sincronizado</span>
                </>
              )}
              {syncStatus === 'error' && (
                <>
                  <AlertTriangle size={13} className="glowing-icon-red" />
                  <span title={syncError}>Offline / Cache</span>
                </>
              )}
            </div>
          </div>
          <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>Calendário Administrativo</h1>
          <p className="text-muted">EAD, Semipresencial e Presencial</p>
        </div>
        
        <div className="header-action-buttons">
          {/* SELETOR DE ANO MULTI-YEAR ESTILO PILLS NO CABEÇALHO */}
          <div className="year-selector-tabs">
            {availableYears.map(yr => (
              <button
                key={yr}
                className={`year-tab-btn ${selectedYear === yr ? 'active' : ''}`}
                onClick={() => setSelectedYear(yr)}
              >
                {yr}
              </button>
            ))}
          </div>

          <button className="btn btn-outline" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Alternar Tema">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn btn-outline" onClick={() => window.print()} title="Imprimir Calendário">
            <Printer size={18} /> Imprimir
          </button>
        </div>
      </header>

      <main>
        {/* ========================================================
            BARRA SELETORA DE PRODUTO ACADÊMICO
           ======================================================== */}
        <div className="glass product-selector-panel animate-fade-in">
          <span className="product-selector-label">Modalidades:</span>
          <div className="product-selector-grid">
            {Object.values(PRODUCTS).map(prod => {
              const isActive = selectedProduct === prod.id;
              return (
                <button
                  key={prod.id}
                  className={`product-selector-card ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedProduct(prod.id);
                    setSelectedCategory('all');
                  }}
                  style={{ '--product-accent': prod.color }}
                >
                  <div className="prod-card-icon-wrapper">
                    {getProductIcon(prod.id)}
                  </div>
                  <div className="prod-card-meta">
                    <strong>{prod.name}</strong>
                    <span className="prod-card-subtitle">
                      {prod.type === 'semestral' ? 'Semestral' : `${prod.modules.length} Módulos`}
                    </span>
                  </div>
                  {isActive && <div className="prod-active-indicator" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            DASHBOARD "HOJE NO CALENDÁRIO"
           ======================================================== */}
        <Dashboard 
          data={activeProductData} 
          referenceDate={referenceDate} 
          productId={selectedProduct} 
        />

        {/* ========================================================
            BARRA DE BUSCA, FILTROS E ABAS DE VISUALIZAÇÃO
           ======================================================== */}
        <div className="glass filters-and-tabs-bar animate-fade-in">
          <div className="filters-left">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder={`Pesquisar em ${PRODUCTS[selectedProduct].name} (${selectedYear})...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-field"
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery('')}>&times;</button>
              )}
            </div>

            <div className="category-pills">
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? 'Ver Todas' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="view-mode-tabs">
            <button 
              className={`tab-btn ${viewMode === 'matrix' ? 'active' : ''}`}
              onClick={() => setViewMode('matrix')}
            >
              <LayoutGrid size={16} />
              <span>Matriz Geral</span>
            </button>
            <button 
              className={`tab-btn ${viewMode === 'gantt' ? 'active' : ''}`}
              onClick={() => setViewMode('gantt')}
            >
              <Clock size={16} />
              <span>Gantt Chart</span>
            </button>
            <button 
              className={`tab-btn ${viewMode === 'monthly' ? 'active' : ''}`}
              onClick={() => setViewMode('monthly')}
            >
              <CalendarRange size={16} />
              <span>Grade Mensal</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            CONTEÚDO DINÂMICO CONFORME A ABA ATIVA
           ======================================================== */}
        <div className="view-content-wrapper">
          {viewMode === 'matrix' && (
            <div className="matrix-table-container">
              <MatrixCalendar 
                data={activeProductData} 
                referenceDate={referenceDate} 
                productId={selectedProduct}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
              />
            </div>
          )}

          {viewMode === 'gantt' && (
            <div className="timeline-container">
              <YearlyTimeline 
                data={activeProductData} 
                referenceDate={referenceDate} 
                productId={selectedProduct} 
                selectedYear={selectedYear}
              />
            </div>
          )}

          {viewMode === 'monthly' && (
            <div className="monthly-calendar-container">
              <MonthlyView 
                data={activeProductData} 
                referenceDate={referenceDate} 
                productId={selectedProduct} 
              />
            </div>
          )}
        </div>
      </main>

      <footer style={{ marginTop: '4rem', textAlign: 'center', paddingBottom: '2rem' }}>
        <p className="text-muted" style={{ fontSize: '0.8rem' }}>
          &copy; 2026 Vitru - CSC Secretaria Acadêmica Unicesumar | Desenvolvido por Guilherme Caniato - guilherme.caniato@vitru.com.br
        </p>
      </footer>
    </div>
  );
}

export default App;
