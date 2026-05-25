export const parseDateString = (dateStr) => {
  if (!dateStr || dateStr === '-') return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  let year = parseInt(parts[2], 10);
  
  // Trata ano com dois dígitos
  if (year < 100) {
    year += 2000;
  }
  
  return new Date(year, month, day);
};

export const formatDateString = (date) => {
  if (!date) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
};

export const getDaysDiff = (date1, date2) => {
  if (!date1 || !date2) return 0;
  // Reseta horas para comparação exata de dias
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diffTime = d2 - d1;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getEventStatus = (startStr, endStr, referenceDate) => {
  const start = parseDateString(startStr);
  const end = parseDateString(endStr);
  
  if (!start || !end) return 'unknown';
  
  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  
  if (ref < s) {
    return 'upcoming';
  } else if (ref > e) {
    return 'past';
  } else {
    return 'active';
  }
};
