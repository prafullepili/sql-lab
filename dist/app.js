const h = React.createElement;
const {useEffect, useRef, useState} = React;

function FunctionGuide({groups}) {
  return h('section',{className:'function-guide'},
    h('div',{className:'function-guide-head'},h('span',{className:'eyebrow'},'DATABRICKS SQL REFERENCE'),h('span',{className:'function-note'},'REFERENCE SYNTAX')),
    groups.map(group=>h('div',{className:'function-group',key:group.name},
      h('h3',null,group.name),
      group.items.map(item=>h('article',{className:'function-item',key:item[0]},h('code',null,item[0]),h('p',null,item[1]),h('pre',null,item[2])))))
  );
}

function LessonText({lesson}) {
  return h('div',{className:'lesson-body'},
    h('h2',null,lesson.heading),h('p',null,lesson.copy),
    h('div',{className:'code-example'},h('div',{className:'code-caption'},h('span',null,lesson.caption),h('span',null,'SQL')),h('pre',null,lesson.example)),
    h('p',null,lesson.after),
    h('div',{className:'callout'},h('span',{className:'callout-mark'},'✳'),h('p',null,lesson.tip)),
    lesson.functionGroups?h(FunctionGuide,{groups:lesson.functionGroups}):null
  );
}

function ResultView({result}) {
  if(!result || result.kind==='empty') return h('div',{className:'empty-results'},h('span',{className:'empty-glyph'},'⌁'),h('p',null,'Run a query to see your results here.'),h('span',null,'Tip: press Ctrl + Enter'));
  if(result.kind==='error') return h('div',{className:'error-box'},result.message);
  if(result.kind==='success') return h('div',{className:'success-note'},result.message);
  return h(React.Fragment,null,result.tables.map((table,index)=>h('table',{className:'result-table',key:index},
    h('thead',null,h('tr',null,table.columns.map((column,i)=>h('th',{key:i},column)))),
    h('tbody',null,table.values.map((row,rowIndex)=>h('tr',{key:rowIndex},row.map((value,columnIndex)=>h('td',{key:columnIndex,className:value===null?'null-cell':''},value===null?'NULL':String(value))))))
  )));
}

function App() {
  const [current,setCurrent]=useState(0);
  const [query,setQuery]=useState(lessons[0].query);
  const [completed,setCompleted]=useState(()=>new Set(JSON.parse(localStorage.getItem('sql-fieldnotes-progress')||'[]')));
  const [expanded,setExpanded]=useState({});
  const [schemaCollapsed,setSchemaCollapsed]=useState(false);
  const [ready,setReady]=useState(false);
  const [resultTitle,setResultTitle]=useState('Starting the SQL engine…');
  const [resultCount,setResultCount]=useState('');
  const [result,setResult]=useState({kind:'empty'});
  const [toast,setToast]=useState('');
  const dbRef=useRef(null),toastTimer=useRef(null),lineRef=useRef(null);
  const lesson=lessons[current];

  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      if(!window.initSqlJs)throw new Error('SQLite engine failed to load. Check your connection and refresh.');
      const SQL=await window.initSqlJs({locateFile:file=>'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/'+file});
      const db=new SQL.Database();
      db.run("CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, email TEXT, city TEXT, joined_on TEXT); CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL, stock INTEGER); CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT, total REAL, status TEXT); CREATE TABLE order_items (id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER, quantity INTEGER, unit_price REAL); INSERT INTO customers VALUES (1,'Ava Chen','ava@example.com','Portland','2023-02-12'),(2,'Noah Patel','noah@example.com','Austin','2023-04-08'),(3,'Mia Brooks','mia@example.com','Portland','2023-05-19'),(4,'Leo Kim','leo@example.com','Chicago','2023-08-03'),(5,'Zoe Rivera','zoe@example.com','Austin','2024-01-15'),(6,'Eli Morgan','eli@example.com','Denver','2024-03-22'); INSERT INTO products VALUES (1,'Everyday Tote','Accessories',28,42),(2,'Field Journal','Stationery',16.5,75),(3,'Ceramic Mug','Home',24,18),(4,'Desk Lamp','Home',68,9),(5,'Canvas Pouch','Accessories',19,0),(6,'SQL for Humans','Books',34,26); INSERT INTO orders VALUES (1,1,'2024-01-06',44.5,'shipped'),(2,2,'2024-01-14',68,'shipped'),(3,1,'2024-02-02',92,'delivered'),(4,3,'2024-02-19',34,'delivered'),(5,4,'2024-03-05',84,'processing'),(6,5,'2024-03-21',59,'shipped'); INSERT INTO order_items VALUES (1,1,1,1,28),(2,1,2,1,16.5),(3,2,4,1,68),(4,3,3,2,24),(5,3,2,2,16.5),(6,4,6,1,34),(7,5,4,1,68),(8,5,2,1,16),(9,6,1,1,28),(10,6,6,1,31);");
      if(cancelled){db.close();return;}
      dbRef.current=db;setReady(true);setResultTitle('Ready when you are');
    })().catch(error=>{if(!cancelled){setResultTitle('Could not start SQLite');setResult({kind:'error',message:error.message+' Refresh when you are back online.'});}});
    return()=>{cancelled=true;};
  },[]);

  useEffect(()=>{setQuery(lesson.query);setResult({kind:'empty'});setResultTitle('Ready when you are');setResultCount('');},[current]);
  useEffect(()=>()=>clearTimeout(toastTimer.current),[]);
  function notify(message){setToast(message);clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(''),1900);}
  function showLesson(index){setCurrent(Math.max(0,Math.min(lessons.length-1,index)));}
  function runQuery(){
    if(!dbRef.current){setResultTitle('Starting the SQL engine…');return;}
    if(!query.trim()){notify('Write a query first');return;}
    try{
      const tablesOut=dbRef.current.exec(query);
      if(!tablesOut.length){setResultTitle('Query complete');setResultCount('');setResult({kind:'success',message:'Statement ran successfully. No rows to display.'});return;}
      const count=tablesOut.reduce((sum,table)=>sum+table.values.length,0);
      setResultTitle('Query results');setResultCount(count+' '+(count===1?'row':'rows'));
      setResult(count?{kind:'tables',tables:tablesOut}:{kind:'success',message:'Query ran successfully. No matching rows.'});
    }catch(error){setResultTitle('Something to fix');setResultCount('SQL ERROR');setResult({kind:'error',message:error.message});}
  }
  function markComplete(){
    const next=new Set(completed);const wasDone=next.has(current);wasDone?next.delete(current):next.add(current);
    setCompleted(next);localStorage.setItem('sql-fieldnotes-progress',JSON.stringify([...next]));notify(wasDone?'Lesson marked incomplete':'Lesson complete — nice work');
  }
  function resetProgress(){
    if(!completed.size){notify('No progress to reset');return;}
    if(window.confirm('Reset all saved lesson progress?')){setCompleted(new Set());localStorage.removeItem('sql-fieldnotes-progress');notify('Progress reset');}
  }
  function onEditorKeyDown(event){
    if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();runQuery();}
    if(event.key==='Tab'){event.preventDefault();const el=event.currentTarget;const start=el.selectionStart,end=el.selectionEnd;const next=query.slice(0,start)+'  '+query.slice(end);setQuery(next);requestAnimationFrame(()=>{el.selectionStart=el.selectionEnd=start+2;});}
  }
  const groups=[];lessons.forEach((item,index)=>{let group=groups.find(g=>g.name===item.group);if(!group){group={name:item.group,items:[]};groups.push(group);}group.items.push({item,index});});
  const taskParts=lesson.task.split('. '),taskTitle=taskParts.length>1?taskParts[0]:'Challenge',taskCopy=taskParts.length>1?taskParts.slice(1).join('. '):lesson.task;
  const lines=Math.max(1,query.split('\n').length);

  return h('div',{className:'app-shell'},
    h('aside',{className:'rail','aria-label':'Course navigation'},
      h('a',{className:'brand',href:'#home','aria-label':'SQL Fieldnotes home'},h('span',{className:'brand-mark'},'S',h('span',null,'Q'),'L'),h('span',{className:'brand-copy'},'FIELD',h('br'),'NOTES')),
      h('div',{className:'course-label'},h('span',{className:'eyebrow'},'YOUR COURSE'),h('div',{className:'course-title'},'SQL, from zero',h('br'),'to fluent')),
      h('div',{className:'progress-block'},h('div',{className:'progress-meta'},h('span',null,'COURSE PROGRESS'),h('strong',null,Math.round(completed.size/lessons.length*100)+'%')),h('div',{className:'progress-track'},h('span',{style:{width:Math.round(completed.size/lessons.length*100)+'%'}}))),
      h('nav',{className:'lesson-nav','aria-label':'Lessons'},groups.map(group=>h(React.Fragment,{key:group.name},h('div',{className:'nav-group'},group.name),group.items.map(({item,index})=>h('button',{key:index,className:'lesson-link'+(index===current?' active':'')+(completed.has(index)?' done':''),'aria-current':index===current?'step':undefined,onClick:()=>showLesson(index)},h('span',{className:'lesson-num'},String(index+1).padStart(2,'0')),h('span',null,item.title),completed.has(index)?h('span',{className:'nav-check'},'✓'):null))))),
      h('div',{className:'rail-bottom'},h('span',{className:'live-dot'}),h('span',null,'Practice database ready'),h('span',{className:'db-type'},'SQLite'))
    ),
    h('main',{className:'main-area',id:'home'},
      h('header',{className:'topbar'},h('div',{className:'breadcrumb'},h('span',null,'LEARNING PATH'),h('span',{className:'crumb-slash'},'/'),h('span',null,String(current+1).padStart(2,'0')+' · '+lesson.title.toUpperCase())),h('div',{className:'top-actions'},h('button',{className:'icon-button',title:'Reset learning progress','aria-label':'Reset learning progress',onClick:resetProgress},'↺'),h('div',{className:'avatar','aria-label':'Learner'},'Y'))),
      h('div',{className:'workspace'},
        h('section',{className:'lesson-column','aria-live':'polite'},
          h('div',{className:'lesson-heading'},h('div',{className:'lesson-kicker'},h('span',{className:'lesson-index'},'LESSON '+String(current+1).padStart(2,'0')),h('span',{className:'kicker-line'}),h('span',null,lesson.time)),h('h1',null,lesson.title),h('p',{className:'lesson-intro'},lesson.intro)),
          h(LessonText,{lesson}),
          h(Challenge,{lesson,taskTitle,taskCopy}),
          h('div',{className:'lesson-footer'},h('button',{className:'prev-button',disabled:current===0,onClick:()=>showLesson(current-1)},'← ',h('span',null,'Previous')),h('button',{className:'complete-button'+(completed.has(current)?' completed':''),onClick:markComplete},h('span',null,completed.has(current)?'Lesson completed':'Mark lesson complete'),h('span',{className:'complete-check'},'✓')),h('button',{className:'next-button',disabled:current===lessons.length-1,onClick:()=>showLesson(current+1)},h('span',null,'Next lesson'),' →'))
        ),
        h('aside',{className:'practice-column','aria-label':'SQL practice workspace'},
          h('section',{className:'editor-panel'},h('div',{className:'panel-heading'},h('div',null,h('span',{className:'eyebrow'},'QUERY WORKSPACE'),h('h2',null,'Try it yourself')),h('span',{className:'connection'},h('span',{className:'live-dot'}),'SQLite runner')),h('div',{className:'editor-toolbar'},h('span',{className:'file-dot'}),h('span',null,'query.sql'),h('span',{className:'toolbar-spacer'}),h('span',{className:'shortcut'},'CTRL'),h('span',{className:'shortcut'},'↵'),h('button',{className:'reset-query',title:'Restore lesson query',onClick:()=>{setQuery(lesson.query);notify('Lesson query restored');}},'Reset')),h('div',{className:'editor-wrap'},h('div',{className:'line-numbers',ref:lineRef},Array.from({length:lines},(_,i)=>i+1).join('\n')),h('textarea',{value:query,onChange:event=>setQuery(event.target.value),onKeyDown:onEditorKeyDown,onScroll:event=>{if(lineRef.current)lineRef.current.scrollTop=event.currentTarget.scrollTop;},spellCheck:false,'aria-label':'SQL query editor',autoCapitalize:'off',autoComplete:'off'})),h('div',{className:'editor-bottom'},h('span',{className:'editor-note'},'Edits stay in this browser'),h('button',{className:'run-button',onClick:runQuery},h('span',null,'Run query'),h('span',{className:'run-icon'},'▶')))),
          h('section',{className:'results-panel','aria-live':'polite'},h('div',{className:'results-heading'},h('div',null,h('span',{className:'eyebrow'},'OUTPUT'),h('h2',null,resultTitle)),h('span',{className:'result-count'},resultCount)),h('div',{className:'results-content'},h(ResultView,{result}))),
          h('section',{className:'schema-panel'+(schemaCollapsed?' schema-collapsed':'')},h('div',{className:'schema-heading'},h('div',null,h('span',{className:'eyebrow'},'SAMPLE DATABASE'),h('h2',null,'Tables ',h('span',{className:'table-count'},'04'))),h('button',{className:'schema-toggle','aria-label':'Toggle database tables',onClick:()=>setSchemaCollapsed(!schemaCollapsed)},schemaCollapsed?'+':'−')),h('div',{className:'schema-list'},Object.entries(tables).map(([name,info])=>h(SchemaTable,{key:name,name,info,expanded:!!expanded[name],onToggle:()=>setExpanded({...expanded,[name]:!expanded[name]}),onPreview:()=>{setQuery('SELECT *\nFROM '+name+'\nLIMIT 5;');setTimeout(runQuery,0);}}))),h('div',{className:'schema-foot'},h('span',null,'In-browser SQLite · refresh to reset'),h('span',null,'↗ 28 rows')))
        )
      ),
      h('footer',{className:'page-footer'},h('span',null,'SQL FIELDNOTES ',h('span',{className:'footer-dot'},'·'),' A learn-by-doing course'),h('span',null,'Built for curious minds ',h('span',{className:'footer-spark'},'✳')))
    ),
    h('div',{className:'toast'+(toast?' show':''),'role':'status','aria-live':'polite'},toast)
  );
}

function Challenge({lesson,taskTitle,taskCopy}) {
  const [showHint,setShowHint]=useState(false);
  useEffect(()=>setShowHint(false),[lesson]);
  return h('div',{className:'challenge-card'},h('div',{className:'challenge-top'},h('span',{className:'challenge-icon'},'✳'),h('span',{className:'eyebrow'},'YOUR TURN'),h('span',{className:'challenge-level'},lesson.level)),h('h2',null,taskTitle),h('p',null,taskCopy),h('button',{className:'text-button',onClick:()=>setShowHint(!showHint)},showHint?'Hide hint ↗':'Need a hint? ↗'),showHint?h('p',{className:'hint-text'},lesson.hint):null);
}

function SchemaTable({name,info,expanded,onToggle,onPreview}) {
  return h('div',{className:'schema-table'},h('div',{className:'table-row',role:'button',tabIndex:0,onClick:onToggle,onDoubleClick:onPreview,onKeyDown:event=>{if(event.key==='Enter')onToggle();}},h('span',{className:'table-caret'},expanded?'⌄':'›'),h('span',{className:'table-glyph'},'▦'),h('span',{className:'table-name'},name),h('span',{className:'table-rows'},info.rows+' rows')),expanded?h('div',{className:'columns-list'},info.cols.map(([column,type,pk])=>h('div',{className:'column-item',key:column},h('span',null,pk?h('span',{className:'pk'},'PK'):'·'),h('span',null,column),h('span',{className:'column-type'},type)))):null);
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App));
