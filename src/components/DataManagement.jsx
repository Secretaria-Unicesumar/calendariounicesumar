import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, Check, FileSpreadsheet } from 'lucide-react';
import { PRODUCTS, sortCategories } from '../utils/productConfig';

const DataManagement = ({ data, productId, selectedYear, onUpdateData }) => {
  const [success, setSuccess] = useState(false);
  const activeProduct = PRODUCTS[productId] || PRODUCTS.graduacao;

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      
      const grouped = [];
      let currentCategory = null;

      json.forEach((row) => {
        // Valida se o registro pertence ao ano selecionado (se houver coluna Ano)
        const rowYear = (row['Ano'] || row['ano'] || '').toString().trim();
        if (rowYear && rowYear !== selectedYear.toString()) return;

        const catName = row['Categoria'] || row['categoria'];
        const eventName = row['Evento'] || row['evento'];

        if (catName && (!currentCategory || currentCategory.categoria !== catName)) {
          currentCategory = { categoria: catName, eventos: [] };
          grouped.push(currentCategory);
        }

        if (eventName && currentCategory) {
          const datas = {};
          
          activeProduct.modules.forEach(m => {
            const colInicio = row[`${m} Início`] || row[`${m} Inicio`] || '-';
            const colFim = row[`${m} Término`] || row[`${m} Termino`] || '-';
            datas[m] = {
              inicio: colInicio,
              fim: colFim
            };
          });

          currentCategory.eventos.push({
            nome: eventName,
            datas
          });
        }
      });

      onUpdateData(grouped);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const templateData = [];
    const sortedData = sortCategories(data);
    sortedData.forEach(cat => {
      cat.eventos.forEach(ev => {
        const rowObj = {
          'Ano': selectedYear,
          'Categoria': cat.categoria,
          'Evento': ev.nome
        };

        activeProduct.modules.forEach(m => {
          rowObj[`${m} Início`] = ev.datas[m]?.inicio || '-';
          rowObj[`${m} Término`] = ev.datas[m]?.fim || '-';
        });

        templateData.push(rowObj);
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Calendário");
    XLSX.writeFile(workbook, `modelo_calendario_${activeProduct.id}_${selectedYear}.xlsx`);
  };

  return (
    <div className="glass" style={{ padding: '2rem', marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileSpreadsheet size={20} /> Gerenciar Matriz Excel - {activeProduct.name} ({selectedYear})
      </h3>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary" onClick={downloadTemplate}>
          <Download size={18} /> Baixar Modelo ({selectedYear})
        </button>
      </div>

      <div 
        style={{
          border: '2px dashed var(--border)',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: 'rgba(255,255,255,0.02)'
        }}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={(e) => handleFile(e.target.files[0])} 
          style={{ display: 'none' }}
          id="file-upload"
        />
        {success ? (
          <div style={{ color: 'var(--accent-green)' }}>
            <Check size={32} style={{ margin: '0 auto 0.5rem' }} />
            <p>Planilha importada com sucesso para {activeProduct.name} em {selectedYear}!</p>
          </div>
        ) : (
          <div>
            <Upload size={32} className="text-muted" style={{ margin: '0 auto 0.5rem' }} />
            <p>Clique para subir a planilha Excel do produto {activeProduct.name} para o ano {selectedYear}</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              (O modelo filtrará e lerá apenas registros contendo a coluna Ano correspondente a {selectedYear} ou sem coluna Ano)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataManagement;
