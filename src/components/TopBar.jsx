import React from 'react';

export default function TopBar({ current, lesson, lessons, completed, onSelect, onReset }) {
  const groups = [];
  lessons.forEach((item, index) => {
    let group = groups.find((candidate) => candidate.name === item.group);
    if (!group) { group = { name: item.group, items: [] }; groups.push(group); }
    group.items.push({ item, index });
  });
  const percent = Math.round((completed.length / lessons.length) * 100);

  return (
    <header className="topbar flex flex-wrap items-center gap-4 px-5 py-3 lg:px-8">
      <a className="top-brand shrink-0" href="#home" aria-label="SQL Fieldnotes home">
        <span className="brand-mark">S<span>Q</span>L</span><span>FIELDNOTES</span>
      </a>
      <div className="breadcrumb hidden min-w-0 flex-1 md:flex" aria-live="polite">
        <span>LEARNING PATH</span><span className="crumb-slash">/</span>
        <span className="truncate">{String(current + 1).padStart(2, '0')} · {lesson.title.toUpperCase()}</span>
      </div>
      <label className="lesson-picker-wrap">
        <span className="sr-only">Change lesson</span>
        <select className="lesson-picker" value={current} onChange={(event) => onSelect(Number(event.target.value))}>
          {groups.map((group) => <optgroup key={group.name} label={group.name}>
            {group.items.map(({ item, index }) => <option key={index} value={index}>{String(index + 1).padStart(2, '0')} · {item.title}</option>)}
          </optgroup>)}
        </select>
      </label>
      <div className="top-progress" aria-label="Course progress">
        <div className="top-progress-label"><span>COURSE PROGRESS</span><strong>{percent}%</strong></div>
        <div className="top-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax={lessons.length} aria-valuenow={completed.length}>
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>
      <div className="top-actions">
        <button className="icon-button" title="Reset learning progress" aria-label="Reset learning progress" onClick={onReset}>↺</button>
      </div>
    </header>
  );
}
