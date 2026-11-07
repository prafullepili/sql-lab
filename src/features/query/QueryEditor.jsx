import React, { useRef, useState } from 'react';

export default function QueryEditor({ lesson, query, ready, onChange, onRun, onReset }) {
  const lines = Math.max(1, query.split('\n').length);
  const lineNumbers = useRef(null);
  const queryInput = useRef(null);
  const [hasSelection, setHasSelection] = useState(false);
  function syncSelection(textarea) {
    setHasSelection(textarea.selectionStart !== textarea.selectionEnd);
  }
  function runEditorQuery() {
    const textarea = queryInput.current;
    if (!textarea) return onRun(query);
    const { selectionStart, selectionEnd } = textarea;
    const selectedSql = query.slice(selectionStart, selectionEnd);
    onRun(selectionStart !== selectionEnd ? selectedSql : query);
  }
  return <section id="query-workspace" className="editor-panel overflow-hidden rounded-2xl border border-white/10 bg-[#111a15] shadow-2xl shadow-black/20">
    <div className="panel-heading flex items-center justify-between gap-3 p-5">
      <div><span className="eyebrow">QUERY WORKSPACE</span><h2>Try it yourself</h2></div>
      <span className="connection"><span className={'live-dot' + (ready ? '' : ' starting')} />{ready ? 'Local SQLite' : 'Starting engine'}</span>
    </div>
    <div className="editor-toolbar"><span className="file-dot" /><span>query.sql</span><span className="toolbar-spacer" /><span className="shortcut">CTRL</span><span className="shortcut">↵</span>
      <button className="reset-query" onClick={() => onReset(lesson.starterQuery ?? lesson.example)}>Reset</button>
    </div>
    <div className="editor-wrap">
      <div className="line-numbers" ref={lineNumbers} aria-hidden="true">{Array.from({ length: lines }, (_, index) => index + 1).join('\n')}</div>
      <textarea id="sql-query-input" ref={queryInput} value={query} onChange={(event) => { onChange(event.target.value); syncSelection(event.target); }} onSelect={(event) => syncSelection(event.target)} onKeyUp={(event) => syncSelection(event.currentTarget)} onMouseUp={(event) => syncSelection(event.currentTarget)} onKeyDown={(event) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); runEditorQuery(); }
        if (event.key === 'Tab') { event.preventDefault(); const textarea = event.currentTarget; const start = textarea.selectionStart; const end = textarea.selectionEnd; onChange(`${query.slice(0, start)}  ${query.slice(end)}`); requestAnimationFrame(() => { textarea.selectionStart = textarea.selectionEnd = start + 2; }); }
      }} onScroll={(event) => { if (lineNumbers.current) lineNumbers.current.scrollTop = event.currentTarget.scrollTop; }} spellCheck="false" aria-label="SQL query editor" autoCapitalize="off" autoComplete="off" />
    </div>
    <div className="editor-bottom flex items-center justify-between gap-3 px-5 py-4">
      <span className="editor-note">{hasSelection ? 'Running selected SQL' : 'Saved in this browser'}</span><button className="run-button" disabled={!ready} onClick={runEditorQuery}>{hasSelection ? 'Run selection' : 'Run query'} <span className="run-icon">▶</span></button>
    </div>
  </section>;
}
