import React from 'react';

export default function ResultsPanel({ result, title, count }) {
  return <section className="results-panel overflow-hidden rounded-2xl border border-white/10 bg-[#111a15]">
    <div className="results-heading flex items-center justify-between gap-3 p-5"><div><span className="eyebrow">OUTPUT</span><h2>{title}</h2></div>{count && <span className="result-count">{count}</span>}</div>
    <div className="results-content">
      {result.kind === 'empty' && <div className="empty-results"><span className="empty-glyph">⌁</span><p>Run a query to see results.</p><span>Tip: press Ctrl + Enter</span></div>}
      {result.kind === 'error' && <div className="error-box">{result.message}</div>}
      {result.kind === 'success' && <div className="success-note">{result.message}</div>}
      {result.kind === 'tables' && result.tables.map((table, index) => <div className="result-table-scroll" key={index}><table className="result-table">
        <thead><tr>{table.columns.map((column, i) => <th key={`${column}-${i}`}>{column}</th>)}</tr></thead>
        <tbody>{table.values.map((row, rowIndex) => <tr key={rowIndex}>{row.map((value, columnIndex) => <td className={value === null ? 'null-cell' : ''} key={columnIndex}>{value === null ? 'NULL' : String(value)}</td>)}</tr>)}</tbody>
      </table></div>)}
    </div>
  </section>;
}
