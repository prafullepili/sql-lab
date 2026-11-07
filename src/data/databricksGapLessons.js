export const databricksGapLessons = [
  {
    group: 'DATABRICKS OPERATIONS', title: 'Delta history, time travel & recovery', time: '18 MIN', level: 'ADVANCED',
    intro: 'Inspect a Delta table’s transaction history, query an earlier version, restore a prior state, and choose between deep and shallow clones.',
    task: 'Summarize orders by status and explain which historical version you would inspect before restoring a mistaken change.',
    hint: 'Use GROUP BY for the runnable local query. In Databricks, use DESCRIBE HISTORY first, then VERSION AS OF to inspect a version.',
    query: `SELECT status, COUNT(*) AS order_count, ROUND(SUM(total), 2) AS revenue
FROM orders
GROUP BY status
ORDER BY status;`,
    heading: 'Read the log before changing the table',
    copy: 'Delta Lake records each committed table version in its transaction log. DESCRIBE HISTORY shows operations and versions. A time-travel query reads a prior version; RESTORE creates a new commit that makes the table match a prior state. Restore does not erase the intervening history.',
    example: `SELECT order_date, status, total
FROM orders
WHERE order_date >= '2024-02-01'
ORDER BY order_date, id;`,
    caption: 'RUNNABLE SQLITE VERSION · INSPECT THE CURRENT DATA',
    after: 'A clone creates a separate table from a source snapshot. A deep clone copies data files; a shallow clone references the source files and depends on their continued availability. Retention and VACUUM can affect how far back time travel remains possible.',
    tip: 'Treat RESTORE as a new table change: review history, identify the correct version, and check downstream consumers before running it.',
    guideTitle: 'DELTA HISTORY PRACTICE', guideNote: 'HISTORY · RECOVERY · CLONING',
    functionGroups: [{ name: 'Databricks commands and local equivalents', items: [
      ['Inspect commit history', 'Review versions, timestamps, operations, and operation parameters before recovery.', `DESCRIBE HISTORY main.analytics.orders;`, `SELECT 'SQLite has no Delta transaction history; inspect the current table rows instead.' AS note;`],
      ['Read an earlier version', 'VERSION AS OF reads a snapshot without changing the current table.', `SELECT *
FROM main.analytics.orders VERSION AS OF 12;`, `SELECT id, customer_id, order_date, status, total
FROM orders
ORDER BY id
LIMIT 10;`],
      ['Restore a prior state', 'RESTORE writes a new commit that returns the table contents to a prior version or timestamp.', `RESTORE TABLE main.analytics.orders
TO VERSION AS OF 12;`, `SELECT 'In Databricks, inspect DESCRIBE HISTORY before RESTORE; local SQLite has no Delta restore.' AS recovery_note;`],
      ['Clone a table', 'DEEP CLONE copies files; SHALLOW CLONE references existing source files. Select based on isolation and storage needs.', `CREATE TABLE main.sandbox.orders_snapshot
DEEP CLONE main.analytics.orders VERSION AS OF 12;`, `CREATE TEMP TABLE orders_snapshot AS
SELECT * FROM orders;

SELECT COUNT(*) AS copied_rows FROM orders_snapshot;

DROP TABLE orders_snapshot;`],
    ]}],
  },
  {
    group: 'DATABRICKS OPERATIONS', title: 'SQL dashboards, alerts & schedules', time: '16 MIN', level: 'ADVANCED',
    intro: 'Turn a reliable query into a dashboard, monitor a meaningful metric with an alert, and schedule refreshes for the people who need them.',
    task: 'Create a daily event summary with event count and amount, sorted from newest date to oldest.',
    hint: 'Group web_events by event_date and calculate COUNT(*) and SUM(amount).',
    query: `SELECT event_date, COUNT(*) AS event_count, ROUND(SUM(amount), 2) AS total_amount
FROM web_events
GROUP BY event_date
ORDER BY event_date DESC
LIMIT 14;`,
    heading: 'Build a useful data product from a query',
    copy: 'A dashboard presents saved query results as visualizations with filters and context. An alert evaluates a query condition and notifies its audience when the condition is met. A schedule refreshes a dashboard and can deliver snapshots to subscribers. These are workspace objects configured in Databricks SQL.',
    example: `SELECT region, COUNT(*) AS events, ROUND(AVG(amount), 2) AS average_amount
FROM web_events
GROUP BY region
ORDER BY events DESC;`,
    caption: 'RUNNABLE SQLITE VERSION · DASHBOARD DATASET',
    after: 'Keep the dataset query at the right grain, give metrics clear names, and test alert conditions against normal and unusual periods. Choose a SQL warehouse and refresh cadence that fit the audience and the data’s update frequency.',
    tip: 'Dashboard schedules and alert notifications are configured in the Databricks workspace; the local runner can practice the SQL dataset but cannot create or schedule workspace objects.',
    guideTitle: 'DASHBOARD AND ALERT PRACTICE', guideNote: 'QUERY · VISUAL · NOTIFY',
    functionGroups: [{ name: 'Shape queries for operational reporting', items: [
      ['Dashboard dataset · daily trend', 'Return one row per date so a line chart can use event_date as its axis and event_count as its value.', `SELECT DATE(event_timestamp) AS event_day,
       COUNT(*) AS event_count
FROM main.analytics.web_events
GROUP BY DATE(event_timestamp)
ORDER BY event_day;`, `SELECT event_date AS event_day, COUNT(*) AS event_count
FROM web_events
GROUP BY event_date
ORDER BY event_day;`],
      ['Alert dataset · threshold check', 'Return a compact metric that can be compared with a threshold and inspected when an alert fires.', `SELECT COUNT(*) AS failed_orders
FROM main.analytics.orders
WHERE status = 'failed'
  AND order_date >= current_date() - INTERVAL 1 DAY;`, `SELECT COUNT(*) AS failed_orders
FROM orders
WHERE status = 'cancelled'
  AND order_date >= date('now', '-1 day');`],
      ['Scheduled delivery', 'Save the dashboard, choose a refresh schedule, and select subscribers or delivery destinations in the workspace.', `-- Configure the dashboard schedule in the Databricks SQL workspace.
-- Keep the dashboard query focused on the audience's decision.`, `SELECT 'A schedule is a workspace setting; this local query runs on demand.' AS note;`],
    ]}],
  },
  {
    group: 'DATABRICKS OPERATIONS', title: 'Lakeflow Jobs & SQL orchestration', time: '18 MIN', level: 'ADVANCED',
    intro: 'Break a data workflow into tasks, define dependencies, and make scheduled runs observable and recoverable.',
    task: 'List a sensible three-step analytics workflow and its dependency order.',
    hint: 'Use a CTE with task names and predecessor names, then sort the steps in execution order.',
    query: `WITH workflow(step_order, task_name, depends_on) AS (
  VALUES
    (1, 'refresh_source', NULL),
    (2, 'build_daily_summary', 'refresh_source'),
    (3, 'check_data_quality', 'build_daily_summary')
)
SELECT step_order, task_name, depends_on
FROM workflow
ORDER BY step_order;`,
    heading: 'Orchestrate work as a dependency graph',
    copy: 'A Lakeflow Job coordinates tasks that can run SQL, notebooks, pipelines, and other supported work. Dependencies define which tasks wait for others; independent tasks can run in parallel. Schedules or triggers start runs, while retries, notifications, and run history help operators handle failures.',
    example: `SELECT event_type, COUNT(*) AS events
FROM web_events
GROUP BY event_type
ORDER BY events DESC;`,
    caption: 'RUNNABLE SQLITE VERSION · A TASK’S SQL WORK',
    after: 'Design each task with a clear input, output, and retry behavior. Make writes idempotent where possible, add data quality checks before publishing results, and use run history to investigate failed tasks. Databricks SQL tasks are configured in the workspace job editor.',
    tip: 'The local course can run a task’s SQL and model a dependency list, but it does not create or schedule Lakeflow Jobs.',
    guideTitle: 'WORKFLOW PRACTICE', guideNote: 'DEPENDENCIES · SCHEDULE · RECOVERY',
    functionGroups: [{ name: 'Model a reliable sequence', items: [
      ['Dependencies', 'The build waits for source refresh; the quality check waits for the build.', `-- Create these as tasks in a Lakeflow Job.
-- refresh_source -> build_daily_summary -> check_data_quality`, `WITH workflow(step_order, task_name, depends_on) AS (
  VALUES (1, 'refresh_source', NULL),
         (2, 'build_daily_summary', 'refresh_source'),
         (3, 'check_data_quality', 'build_daily_summary')
)
SELECT * FROM workflow ORDER BY step_order;`],
      ['SQL task body', 'Keep each SQL task focused on one result, such as an aggregate table or a validation query.', `SELECT event_date, COUNT(*) AS event_count
FROM main.analytics.web_events
GROUP BY event_date;`, `SELECT event_date, COUNT(*) AS event_count
FROM web_events
GROUP BY event_date;`],
      ['Operational settings', 'Set a schedule or trigger, retries, timeout, and notifications according to the task’s recovery needs.', `-- Set schedule, retry, timeout, and notification options
-- in the Lakeflow Jobs workspace configuration.`, `SELECT 'Local SQL runs on demand; schedules and retries belong to the job orchestrator.' AS note;`],
    ]}],
  },
];
