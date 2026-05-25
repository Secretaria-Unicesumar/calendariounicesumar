export const PRODUCTS = {
  graduacao: {
    id: 'graduacao',
    name: 'Graduação EAD',
    modules: ['51', '52', '53', '54'],
    type: 'modular',
    color: 'var(--accent-blue)',
    moduleLabels: {
      '51': 'Módulo 51',
      '52': 'Módulo 52',
      '53': 'Módulo 53',
      '54': 'Módulo 54'
    }
  },
  profissionalizante: {
    id: 'profissionalizante',
    name: 'Profissionalizante',
    modules: ['71', '72', '73', '74'],
    type: 'modular',
    color: 'var(--accent-orange)',
    moduleLabels: {
      '71': 'Módulo 71',
      '72': 'Módulo 72',
      '73': 'Módulo 73',
      '74': 'Módulo 74'
    }
  },
  tecnicos: {
    id: 'tecnicos',
    name: 'Técnicos',
    modules: ['91', '92', '93', '94'],
    type: 'modular',
    color: 'var(--accent-purple)',
    moduleLabels: {
      '91': 'Módulo 91',
      '92': 'Módulo 92',
      '93': 'Módulo 93',
      '94': 'Módulo 94'
    }
  },
  pos_hibrida: {
    id: 'pos_hibrida',
    name: 'Pós-graduação Híbrida',
    modules: ['81', '82', '83', '84'],
    type: 'modular',
    color: '#ec4899', // Rosa
    moduleLabels: {
      '81': 'Módulo 81',
      '82': 'Módulo 82',
      '83': 'Módulo 83',
      '84': 'Módulo 84'
    }
  },
  presencial: {
    id: 'presencial',
    name: 'Presencial',
    modules: ['1S', '2S'],
    type: 'semestral',
    color: 'var(--accent-green)',
    moduleLabels: {
      '1S': '1º Semestre',
      '2S': '2º Semestre'
    }
  }
};

export const getProductModuleLabel = (productId, moduleKey) => {
  const prod = PRODUCTS[productId];
  if (!prod) return moduleKey;
  return prod.moduleLabels?.[moduleKey] || `${prod.type === 'semestral' ? '' : 'Módulo '}${moduleKey}`;
};

// Ordem customizada prioritária para exibição das categorias
export const CATEGORY_ORDER = [
  "Período letivo",
  "Período de Captação",
  "Rematrícula automátical",
  "Rematrícula automática",
  "Aproveitamento de Estudos",
  "Divisão de turmas",
  "Lançamento de notas",
  "Fechamento de Período e Rematrícula",
  "Serviços atendidos pelo CSC - Secretaria e Financeiro",
  "Outros serviços atendidos pela Secretaria",
  "Outras rotinas"
];

// Ordena objetos de categoria (ex: [{categoria: '...'}, {categoria: '...'}])
export const sortCategories = (categoriesArray) => {
  if (!categoriesArray || !Array.isArray(categoriesArray)) return [];
  
  return [...categoriesArray].sort((a, b) => {
    const nameA = a.categoria || '';
    const nameB = b.categoria || '';
    
    const indexA = CATEGORY_ORDER.findIndex(cat => cat.toLowerCase() === nameA.toLowerCase());
    const indexB = CATEGORY_ORDER.findIndex(cat => cat.toLowerCase() === nameB.toLowerCase());
    
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    return nameA.localeCompare(nameB, 'pt-BR');
  });
};

// Ordena lista de strings contendo os nomes das categorias
export const sortCategoryNames = (namesArray) => {
  if (!namesArray || !Array.isArray(namesArray)) return [];
  
  return [...namesArray].sort((nameA, nameB) => {
    const indexA = CATEGORY_ORDER.findIndex(cat => cat.toLowerCase() === nameA.toLowerCase());
    const indexB = CATEGORY_ORDER.findIndex(cat => cat.toLowerCase() === nameB.toLowerCase());
    
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    return nameA.localeCompare(nameB, 'pt-BR');
  });
};
