export const splitCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
};

export const parseCSV = (text) => {
  if (!text) return [];
  
  const lines = text.replace(/\r/g, '').split('\n').filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cells = splitCSVLine(line);
    if (cells.length < headers.length) continue;

    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cells[idx];
    });
    rows.push(rowObj);
  }
  
  return rows;
};

// Transforma a lista plana do CSV no formato de múltiplos anos e múltiplos produtos
export const transformCSVToProducts = (rows) => {
  const result = {};

  rows.forEach(row => {
    // 1. Determina o ano (Lê da coluna 'Ano' ou auto-classifica a partir da data de início)
    let ano = (row['Ano'] || row['ano'] || '').trim();
    
    const productRaw = (row['Produto'] || row['produto'] || '').trim().toLowerCase();
    
    // Normaliza o nome do produto para corresponder às chaves do PRODUCTS (remover acentos e mapear IDs)
    let product = productRaw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (product.includes('pos')) {
      product = 'pos_hibrida';
    } else if (product.includes('graduacao')) {
      product = 'graduacao';
    } else if (product.includes('profissionalizante')) {
      product = 'profissionalizante';
    } else if (product.includes('tecnico')) {
      product = 'tecnicos';
    } else if (product.includes('presencial')) {
      product = 'presencial';
    }

    const category = (row['Categoria'] || row['categoria'] || '').trim();
    const event = (row['Evento'] || row['evento'] || '').trim();
    const column = (row['Coluna'] || row['coluna'] || '').trim();
    const inicio = (row['Inicio'] || row['inicio'] || row['Início'] || row['início'] || '-').trim();
    const fim = (row['Fim'] || row['fim'] || row['Término'] || row['término'] || '-').trim();

    if (!product || !category || !event || !column) return;

    // Se o ano não foi especificado, tenta ler do ano da data de início (Ex: "24/02/25" -> 2025)
    if (!ano && inicio && inicio !== '-') {
      const parts = inicio.split('/');
      if (parts.length === 3) {
        let parsedYear = parseInt(parts[2], 10);
        if (parsedYear < 100) parsedYear += 2000;
        ano = String(parsedYear);
      }
    }

    // Fallback se não conseguir determinar o ano
    if (!ano) {
      ano = '2026';
    }

    // Inicializa a árvore para este ano se não existir
    if (!result[ano]) {
      result[ano] = {
        graduacao: [],
        profissionalizante: [],
        tecnicos: [],
        pos_hibrida: [],
        presencial: []
      };
    }

    const yearData = result[ano];

    if (yearData[product] !== undefined) {
      let catObj = yearData[product].find(c => c.categoria === category);
      if (!catObj) {
        catObj = { categoria: category, eventos: [] };
        yearData[product].push(catObj);
      }

      let evObj = catObj.eventos.find(e => e.nome === event);
      if (!evObj) {
        evObj = { nome: event, datas: {} };
        catObj.eventos.push(evObj);
      }

      evObj.datas[column] = { inicio, fim };
    }
  });

  return result;
};

export const fetchGoogleSheetData = async (input) => {
  if (!input) throw new Error('O ID ou Link da planilha está em branco.');
  
  let url = '';
  const trimmed = input.trim();
  
  // 1. Se for uma URL completa
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    url = trimmed;
    // Se o usuário colou a URL normal de edição, converte para pub?output=csv
    if (url.includes('/edit')) {
      url = url.split('/edit')[0] + '/pub?output=csv';
    }
  } 
  // 2. Se for um ID de publicação pública (começa com 2PACX)
  else if (trimmed.startsWith('2PACX')) {
    url = `https://docs.google.com/spreadsheets/d/e/${trimmed}/pub?output=csv`;
  } 
  // 3. Se for um ID padrão de planilha do Google
  else {
    url = `https://docs.google.com/spreadsheets/d/${trimmed}/pub?output=csv`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Falha ao obter os dados. Certifique-se de que o Link colado está correto e que a planilha foi devidamente publicada na web como CSV.');
  }

  const text = await response.text();
  const rows = parseCSV(text);
  
  if (rows.length === 0) {
    throw new Error('A planilha obtida está vazia ou não contém dados válidos.');
  }

  return transformCSVToProducts(rows);
};
