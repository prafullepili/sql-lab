import React from 'react';

function JoinBasicsMap() {
  return <section className="join-basics" aria-label="How customers and orders connect">
    <div className="join-basics-heading">
      <span className="eyebrow">THE RELATIONSHIP</span>
      <h3>One customer can have many orders</h3>
      <p>Customer details and order details stay in separate tables. The customer key connects them when you query.</p>
    </div>
    <div className="join-map">
      <div className="join-table-card">
        <strong>customers</strong>
        <span><b>id</b><small>PRIMARY KEY</small></span>
        <span>name</span>
      </div>
      <div className="join-link">
        <span className="join-cardinality">1 → MANY</span>
        <div className="join-link-line" />
        <code>customers.id = orders.customer_id</code>
      </div>
      <div className="join-table-card">
        <strong>orders</strong>
        <span><b>id</b><small>PRIMARY KEY</small></span>
        <span><b>customer_id</b><small>FOREIGN KEY</small></span>
        <span>total</span>
      </div>
    </div>
    <div className="join-query-anatomy">
      <span><b>1</b><code>FROM orders AS o</code><small>Start with the rows you want</small></span>
      <span><b>2</b><code>JOIN customers AS c</code><small>Add the related table</small></span>
      <span><b>3</b><code>ON o.customer_id = c.id</code><small>Match the foreign key to its primary key</small></span>
    </div>
  </section>;
}

function ExampleGroup({ group, onLoad }) {
  return <div className="function-group">
    <h3>{group.name}</h3>
    <div className="function-items-grid">
      {group.items.map((item) => <article className="function-item" key={item[0]}>
        <code>{item[0]}</code><p>{item[1]}</p><pre>{item[2]}</pre>
        <button className="example-load" onClick={() => onLoad(item[3] || item[2])}>{item[3] && item[3] !== item[2] ? 'Try SQLite version ↓' : 'Try this query ↓'}</button>
      </article>)}
    </div>
  </div>;
}

function makePoints(text = '') {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/u)
    .flatMap((sentence) => sentence.length > 190
      ? sentence.split(/;\s+(?=[A-Z])/u)
      : [sentence])
    .map((point) => point.trim())
    .filter(Boolean);
}

export default function LessonContent({ lesson, onLoad, taskPassed = false }) {
  const taskParts = lesson.task.split('. ');
  const taskTitle = taskParts.length > 1 ? taskParts[0] : 'Challenge';
  const taskCopy = taskParts.length > 1 ? taskParts.slice(1).join('. ') : lesson.task;

  return <>
    <section className="lesson-heading rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
      <div className="lesson-kicker"><span className="lesson-index">LESSON</span><span className="kicker-line" />{lesson.time}<span className="lesson-level">{lesson.level}</span></div>
      <h1>{lesson.title}</h1><p className="lesson-intro">{lesson.intro}</p>
    </section>
    <article className={'lesson-body' + (lesson.title === 'SQL UDFs & reusable logic' ? ' lesson-udfs' : '')}>
      <span className="lesson-step-label">01 · CORE IDEA</span>
      <h2>{lesson.heading}</h2>
      <ol className="lesson-points" aria-label="Lesson explanation">
        {makePoints(lesson.copy).map((point, index) => <li key={`concept-${index}`}>{point}</li>)}
      </ol>
      {lesson.title === 'Join tables' && <JoinBasicsMap />}
      <span className="lesson-step-label">02 · WORKED EXAMPLE</span>
      <div className="code-example">
        <div className="code-caption"><span>{lesson.caption}</span><span>SQL</span></div>
        <pre>{lesson.example}</pre>
        <button className="example-load" onClick={() => onLoad(lesson.example)}>Try this query ↓</button>
      </div>
      <section className="practice-points" aria-label="In practice">
        <h3>03 · In practice</h3>
        <ul className="lesson-points practice-point-list">
          {makePoints(lesson.after).map((point, index) => <li key={`practice-${index}`}>{point}</li>)}
        </ul>
      </section>
      <div className="callout"><span className="callout-mark">✳</span><p>{lesson.tip}</p></div>
      {lesson.functionGroups?.length > 0 && <section className="function-guide">
        <div className="function-guide-head"><span className="eyebrow">04 · {lesson.guideTitle || 'GUIDED PRACTICE'}</span><span className="function-note">{lesson.guideNote || 'REFERENCE'}</span></div>
        {lesson.functionGroups.map((group) => <ExampleGroup key={group.name} group={group} onLoad={onLoad} />)}
      </section>}
      <span className="lesson-step-label">{lesson.functionGroups?.length ? '05 · INDEPENDENT PRACTICE' : '04 · INDEPENDENT PRACTICE'}</span>
      <section className="challenge-card">
        <div className="challenge-top"><span className="challenge-icon">✳</span><span className="eyebrow">YOUR TURN</span><span className={'task-status' + (taskPassed ? ' passed' : '')} aria-live="polite">{taskPassed ? '✓ TASK COMPLETE' : 'RUN QUERY TO CHECK'}</span><span className="challenge-level">{lesson.level}</span></div>
        <h2>{taskTitle}</h2><p>{taskCopy}</p><details><summary>Need a hint?</summary><p className="hint-text">{lesson.hint}</p></details>
        <p className="task-check-note">Run a query in the workspace. When its results answer this task, it will be marked complete automatically.</p>
      </section>
      <details className="solution-reveal">
        <summary>Show a sample solution</summary>
        <section className="function-guide glance-guide">
          <div className="function-guide-head"><span className="eyebrow">SAMPLE SOLUTION · {lesson.title.toUpperCase()}</span><span className="function-note">COMPARE AFTER TRYING</span></div>
          <article className="function-item">
            <code>{lesson.glanceLabel || lesson.title}</code><p>{lesson.glanceExplanation || lesson.intro}</p>
            <pre>{lesson.query}</pre><button className="example-load" onClick={() => onLoad(lesson.query)}>Run sample solution ↓</button>
          </article>
        </section>
      </details>
    </article>
  </>;
}
