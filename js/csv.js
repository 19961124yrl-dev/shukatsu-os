export const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
export function stringifyCSV(rows) { return rows.map(row => row.map(csvCell).join(',')).join('\n'); }
export function parseCSV(text) {
  const rows = []; let row = []; let cell = ''; let quoted = false;
  for (let i = 0; i < text.length; i += 1) { const c = text[i]; const n = text[i + 1]; if (c === '"' && quoted && n === '"') { cell += '"'; i += 1; } else if (c === '"') quoted = !quoted; else if (c === ',' && !quoted) { row.push(cell); cell = ''; } else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && n === '\n') i += 1; row.push(cell); if (row.some(x => x !== '')) rows.push(row); row = []; cell = ''; } else cell += c; }
  row.push(cell); if (row.some(x => x !== '')) rows.push(row); return rows;
}
