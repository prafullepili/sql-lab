import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TopBar from './components/TopBar.jsx';
import LessonContent from './components/LessonContent.jsx';
import SchemaPanel from './components/SchemaPanel.jsx';
import QueryEditor from './features/query/QueryEditor.jsx';
import ResultsPanel from './features/query/ResultsPanel.jsx';
import { lessons, tables as starterTables } from './data/index.js';
import { useSqlDatabase } from './db/useSqlDatabase.js';
import { resetQuery, saveQuery } from './features/query/querySlice.js';
import { markTaskComplete, resetProgress, setCurrentLesson, toggleComplete } from './features/progress/progressSlice.js';

function hasTopLevelOrderBy(sql = '') {
  let depth = 0;
  let quote = '';
  let lineComment = false;
  let blockComment = false;
  let visibleSql = '';

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];

    if (lineComment) {
      if (char === '\n') lineComment = false;
      visibleSql += ' ';
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') { blockComment = false; index += 1; }
      visibleSql += ' ';
      continue;
    }
    if (quote) {
      if (char === quote && next === quote) { index += 1; }
      else if (char === quote) quote = '';
      visibleSql += ' ';
      continue;
    }
    if (char === '-' && next === '-') { lineComment = true; index += 1; visibleSql += '  '; continue; }
    if (char === '/' && next === '*') { blockComment = true; index += 1; visibleSql += '  '; continue; }
    if (char === "'" || char === '"' || char === '`') { quote = char; visibleSql += ' '; continue; }
    if (char === '(') { depth += 1; visibleSql += ' '; continue; }
    if (char === ')') { depth = Math.max(0, depth - 1); visibleSql += ' '; continue; }
    visibleSql += depth === 0 ? char : ' ';
  }

  return /\bORDER\s+BY\b/i.test(visibleSql);
}

function resultSignature(tablesOut, preserveOrder = false) {
  const table = [...tablesOut].reverse().find((item) => Array.isArray(item.columns) && Array.isArray(item.values));
  if (!table) return null;
  const normalize = (value) => typeof value === 'number' ? Math.round(value * 1e9) / 1e9 : value;
  const rows = table.values.map((row) => JSON.stringify(row.map(normalize)));
  if (!preserveOrder) rows.sort();
  return {
    columns: table.columns.map((column) => String(column).trim().toLowerCase()),
    rows,
  };
}

function resultsMatch(actual, expected, preserveOrder) {
  const actualResult = resultSignature(actual, preserveOrder);
  const expectedResult = resultSignature(expected, preserveOrder);
  return Boolean(actualResult && expectedResult
    && JSON.stringify(actualResult.columns) === JSON.stringify(expectedResult.columns)
    && JSON.stringify(actualResult.rows) === JSON.stringify(expectedResult.rows));
}

export default function App() {
  const dispatch = useDispatch();
  const progress = useSelector((state) => state.progress);
  const queryState = useSelector((state) => state.queries.byLesson);
  const { ready, error: databaseError, tables: liveTables, runSql } = useSqlDatabase();
  const current = Math.min(progress.currentLesson, lessons.length - 1);
  const lesson = lessons[current];
  const query = queryState[lesson.title] ?? lesson.starterQuery ?? lesson.example;
  const [toast, setToast] = useState('');
  const [result, setResult] = useState({ kind: 'empty' });
  const [resultTitle, setResultTitle] = useState('Starting the SQL engine…');
  const [resultCount, setResultCount] = useState('');
  const completed = progress.completed || [];
  const tasksCompleted = progress.tasksCompleted || [];

  useEffect(() => {
    if (ready) setResultTitle('Ready when you are');
    if (databaseError) {
      setResultTitle('Could not start SQLite');
      setResult({ kind: 'error', message: databaseError });
    }
  }, [ready, databaseError]);

  useEffect(() => {
    setResult({ kind: 'empty' });
    setResultTitle('Ready when you are');
    setResultCount('');
  }, [current]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 1900);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function showLesson(index) {
    dispatch(setCurrentLesson(Math.max(0, Math.min(lessons.length - 1, index))));
  }

  function loadExample(sql) {
    dispatch(saveQuery({ lesson: lesson.title, sql }));
    setResult({ kind: 'empty' });
    setResultTitle('Ready when you are');
    setResultCount('');
    setToast('Running selected query…');
    window.requestAnimationFrame(() => {
      const workspace = document.getElementById('query-workspace');
      workspace?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.getElementById('sql-query-input')?.focus({ preventScroll: true });
    });
    executeQuery(sql);
  }

  async function executeQuery(sqlToRun = query) {
    if (!sqlToRun.trim()) { setToast('Write a query first'); return; }
    try {
      const tablesOut = await runSql(sqlToRun);
      let taskPassed = false;
      if (tablesOut.length) {
        try {
          const expectedTables = await runSql(lesson.query);
          taskPassed = resultsMatch(tablesOut, expectedTables, hasTopLevelOrderBy(lesson.query));
        } catch {
          taskPassed = false;
        }
      }
      if (taskPassed) {
        const newlyPassed = !tasksCompleted.includes(current);
        const newlyCompleted = !completed.includes(current);
        if (newlyPassed) dispatch(markTaskComplete(current));
        if (newlyCompleted) dispatch(toggleComplete(current));
        if (newlyPassed || newlyCompleted) {
          setToast(newlyCompleted ? 'Correct! Task and lesson complete.' : 'Correct! Task complete.');
        } else setToast('Query ran successfully. Task already complete.');
      }
      if (!tablesOut.length) {
        setResultTitle('Query complete'); setResultCount('');
        setResult({ kind: 'success', message: 'Statement ran successfully. No rows to display.' });
        setToast('Query ran successfully.');
        return;
      }
      const count = tablesOut.reduce((total, table) => total + table.values.length, 0);
      setResultTitle('Query results'); setResultCount(`${count} ${count === 1 ? 'row' : 'rows'}`);
      setResult(count ? { kind: 'tables', tables: tablesOut } : { kind: 'success', message: 'Query ran successfully. No matching rows.' });
      if (!taskPassed) setToast('Query ran successfully.');
    } catch (error) {
      setResultTitle('Something to fix'); setResultCount('SQL ERROR');
      setResult({ kind: 'error', message: error.message });
      setToast('Query could not run. Check the SQL output.');
    }
  }

  function resetSavedProgress() {
    if (!completed.length) { setToast('No progress to reset'); return; }
    if (window.confirm('Reset all saved lesson progress?')) {
      dispatch(resetProgress());
      setToast('Progress reset');
    }
  }

  return <div className="app-shell tutorial-layout min-h-screen bg-[#101713] text-[#eef2e9]" id="home">
    <main className="main-area">
      <TopBar current={current} lesson={lesson} lessons={lessons} completed={completed}
        onSelect={showLesson} onReset={resetSavedProgress} />
      <div className="workspace grid">
        <section className="lesson-column min-w-0" aria-live="polite">
          <LessonContent lesson={lesson} onLoad={loadExample} taskPassed={tasksCompleted.includes(current)} />
          <div className="lesson-footer workspace-footer">
            <button className="prev-button" disabled={current === 0} onClick={() => showLesson(current - 1)}>← Previous</button>
            <button className={'complete-button' + (completed.includes(current) ? ' completed' : '')} onClick={() => dispatch(toggleComplete(current))}>
              <span className="complete-label-full">{completed.includes(current) ? 'Lesson completed' : 'Mark lesson complete'}</span>
              <span className="complete-label-compact">{completed.includes(current) ? 'Completed' : 'Complete lesson'}</span>
              <span className="complete-check">✓</span>
            </button>
            <button className="next-button" disabled={current === lessons.length - 1} onClick={() => showLesson(current + 1)}>Next lesson →</button>
          </div>
        </section>
        <section className="practice-column min-w-0" aria-label="SQL practice workspace">
          <div className="practice-section-heading">
            <span className="lesson-step-label">02 · PRACTICE</span>
            <h2>Try it yourself</h2>
          </div>
          <div className="database-column min-w-0" aria-label="Sample database tables">
            <SchemaPanel tables={Object.keys(liveTables).length ? liveTables : starterTables} onLoad={loadExample} />
          </div>
          <section className="editor-column min-w-0" aria-label="SQL query editor">
            <QueryEditor lesson={lesson} query={query} ready={ready}
              onChange={(sql) => dispatch(saveQuery({ lesson: lesson.title, sql }))}
              onRun={executeQuery}
              onReset={(sql) => { dispatch(resetQuery(lesson.title)); if (sql !== (lesson.starterQuery ?? lesson.example)) dispatch(saveQuery({ lesson: lesson.title, sql })); setToast('Worked example restored'); }} />
          </section>
          <aside className="results-column min-w-0" aria-label="Query output">
            <ResultsPanel result={result} title={resultTitle} count={resultCount} />
          </aside>
        </section>
      </div>
      <footer className="page-footer"><span>SQL FIELDNOTES · A learn-by-doing course</span><span>Local SQL practice · ✳</span></footer>
    </main>
    <div className={'toast' + (toast ? ' show' : '')} role="status" aria-live="polite">{toast}</div>
  </div>;
}
