import React, { useEffect, useRef, useState } from 'react';

const eventQueries = [
  { label: 'Summarize event types', sql: `SELECT event_type, COUNT(*) AS event_count
FROM web_events
GROUP BY event_type
ORDER BY event_count DESC;` },
  { label: 'Revenue by region', sql: `SELECT region,
       COUNT(CASE WHEN event_type = 'purchase' THEN 1 END) AS purchases,
       ROUND(SUM(CASE WHEN event_type = 'purchase' THEN amount ELSE 0 END), 2) AS revenue
FROM web_events
GROUP BY region
ORDER BY revenue DESC;` },
  { label: 'Rank top spending users', sql: `WITH user_spend AS (
  SELECT user_id, SUM(amount) AS total_spend
  FROM web_events
  WHERE event_type = 'purchase'
  GROUP BY user_id
)
SELECT user_id, total_spend,
       RANK() OVER (ORDER BY total_spend DESC) AS spend_rank
FROM user_spend
ORDER BY spend_rank
LIMIT 10;` },
];

export default function SchemaPanel({ tables, onLoad }) {
  const [activeTable, setActiveTable] = useState(null);
  const panelRef = useRef(null);
  const rows = Object.values(tables).reduce((total, table) => total + table.rows, 0);
  const selected = activeTable ? tables[activeTable] : null;
  useEffect(() => {
    if (!activeTable) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!panelRef.current?.contains(event.target)) setActiveTable(null);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setActiveTable(null);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [activeTable]);
  function loadQuery(sql) {
    setActiveTable(null);
    onLoad(sql);
  }
  return <section ref={panelRef} className="schema-panel schema-chip-panel" aria-label="Sample database tables">
    <div className="schema-chip-heading">
      <div><span className="eyebrow">SAMPLE DATABASE</span><h2>Tables <span className="table-count">{Object.keys(tables).length}</span></h2></div>
      <span className="schema-total">{rows.toLocaleString()} rows</span>
    </div>
    <p className="schema-helper">Choose a table to explore its columns.</p>
    <div className="schema-chips" aria-label="Tables">
      {Object.entries(tables).map(([name, info]) => <button
        className={'schema-chip' + (activeTable === name ? ' active' : '')}
        key={name}
        onClick={() => setActiveTable((current) => current === name ? null : name)}
        aria-expanded={activeTable === name}
        aria-controls="selected-table-details"
      >
        <span className="table-glyph" aria-hidden="true">▦</span><span>{name}</span><span className="chip-row-count">{info.rows.toLocaleString()}</span>
      </button>)}
    </div>
    {selected && <div className="schema-detail" id="selected-table-details">
      <div className="schema-detail-heading"><strong>{activeTable}</strong><span>{selected.rows.toLocaleString()} rows · {selected.cols.length} columns</span></div>
      <div className="columns-list">{selected.cols.map(([column, type, pk]) => <div className="column-item" key={column}><span>{pk ? <span className="pk">PK</span> : '·'}</span><span>{column}</span><span className="column-type">{type}</span></div>)}</div>
      <button className="preview-table" onClick={() => loadQuery(`SELECT *\nFROM ${activeTable}\nLIMIT 10;`)}>Preview this table ↓</button>
      {activeTable === 'web_events' && <div className="schema-examples"><span className="eyebrow">TRY THE 1,000-ROW DATASET</span>
        {eventQueries.map((example) => <button className="preview-table" key={example.label} onClick={() => loadQuery(example.sql)}>{example.label} ↓</button>)}
      </div>}
    </div>}
    <div className="schema-foot"><span>SQLite runs in this browser</span><span>{Object.keys(tables).length} tables · {rows.toLocaleString()} rows</span></div>
  </section>;
}
