const group = 'DATABRICKS OPERATIONS';

export const operationsLessons = [
  {
    group, title: 'Delta table maintenance & clustering', time: '18 MIN', level: 'ADVANCED',
    intro: 'Keep Delta tables efficient by matching maintenance work to file counts, query filters, and retention needs—not by scheduling commands blindly.',
    task: 'Summarize sample event volume by region and event type before considering a clustering strategy.',
    hint: 'Write a new query grouped by date and filtered to two regions. Explain how those predicates would guide clustering.',
    query: `SELECT region, event_type, COUNT(*) AS events
FROM web_events
GROUP BY region, event_type
ORDER BY events DESC;`,
    heading: 'Compact, cluster, and clean up for different reasons',
    copy: 'OPTIMIZE rewrites files to improve layout and compact small files. Liquid clustering groups data around query keys and can evolve as workloads change. VACUUM removes old unreferenced files after the retention period; it affects time travel and recovery, so keep a deliberate retention window.',
    example: `SELECT event_date, COUNT(*) AS events
FROM web_events
GROUP BY event_date
ORDER BY events DESC
LIMIT 10;`,
    caption: 'RUNNABLE SQLITE VERSION · ACCESS PATTERN PREVIEW',
    after: 'The local SQL runner can summarize the sample workload, but it cannot compact files or change Delta layout. The Databricks examples below are maintenance commands; validate the workload and retention policy before running them on production tables.',
    tip: 'Databricks recommends liquid clustering for many new Delta table layouts. Predictive optimization can run OPTIMIZE automatically for Unity Catalog managed tables, so avoid duplicate scheduled maintenance without checking first.',
    glanceLabel: 'Inspect common event slices',
    glanceExplanation: 'Use the columns analysts filter most often as candidates for clustering, then confirm the choice with query history and file-pruning metrics.',
    functionGroups: [{ name: 'Delta layout and retention commands', items: [
      ['OPTIMIZE · compact files', 'Rewrite small files into a healthier layout; do this when file statistics or workload metrics show a need.', `OPTIMIZE main.analytics.web_events;`, `SELECT event_date, COUNT(*) AS events FROM web_events GROUP BY event_date ORDER BY events DESC LIMIT 10;`],
      ['CLUSTER BY · liquid clustering', 'Choose frequently filtered columns. Clustering is incremental and does not require a static partition directory layout.', `ALTER TABLE main.analytics.web_events
CLUSTER BY (event_date, region);

OPTIMIZE main.analytics.web_events;`, `SELECT event_date, region, COUNT(*) AS events FROM web_events GROUP BY event_date, region ORDER BY events DESC LIMIT 10;`],
      ['VACUUM · remove obsolete files', 'Remove files no longer referenced by the Delta log after the configured retention period.', `VACUUM main.analytics.web_events;`, `SELECT 'VACUUM removes obsolete files after retention; SQLite has no Delta transaction log.' AS maintenance_note;`],
      ['Partitioning and ZORDER', 'Prefer liquid clustering for new layouts in most cases. Use older partitioning or ZORDER designs only when they fit the table and workload.', `-- For a table not using liquid clustering:
OPTIMIZE main.analytics.legacy_events
ZORDER BY (event_date, region);`, `SELECT event_date, region, COUNT(*) AS events FROM web_events GROUP BY event_date, region;`],
    ] }],
  },
  {
    group, title: 'Materialized views & refresh strategy', time: '17 MIN', level: 'ADVANCED',
    intro: 'Precompute useful summaries without treating every materialized view as a guaranteed incremental job. Choose a refresh policy based on correctness and cost.',
    task: 'Summarize monthly purchase revenue by event type.',
    hint: 'Use a different grouping from the daily regional example: derive month from event_date and group by event_type.',
    query: `SELECT strftime('%Y-%m', event_date) AS event_month, event_type,
       ROUND(SUM(CASE WHEN event_type = 'purchase' THEN amount ELSE 0 END), 2) AS revenue
FROM web_events
GROUP BY event_month, event_type
ORDER BY event_month, event_type;`,
    heading: 'Materialize a stable result; verify how it refreshes',
    copy: 'A materialized view stores the result of a query and refreshes it to reflect its sources. Databricks can incrementally refresh supported query patterns, but the AUTO policy may choose a full recompute when that is cheaper. Incremental refresh requires serverless pipeline compute; source data must also support a safe full refresh.',
    example: `SELECT region,
       COUNT(*) AS event_count,
       SUM(amount) AS gross_amount
FROM web_events
GROUP BY region
ORDER BY event_count DESC;`,
    caption: 'RUNNABLE SQLITE VERSION · AGGREGATE QUERY',
    after: 'The local SQLite runner calculates the result on demand and cannot create a Databricks materialized view. Use the Databricks DDL examples in a SQL warehouse or Lakeflow environment.',
    tip: 'Run EXPLAIN CREATE MATERIALIZED VIEW to inspect structural incrementalization eligibility. It is not a promise that the runtime will choose an incremental refresh under AUTO.',
    glanceLabel: 'Model a reusable daily aggregate',
    glanceExplanation: 'This aggregation is the result definition. Databricks stores and refreshes it as a materialized view; SQLite recomputes it each time you run the SELECT.',
    functionGroups: [{ name: 'Define and operate a materialized view', items: [
      ['CREATE MATERIALIZED VIEW', 'Store a reusable aggregate. AUTO is the default refresh policy and lets the cost model choose incremental or full refresh.', `CREATE OR REPLACE MATERIALIZED VIEW main.analytics.daily_region_events
REFRESH POLICY AUTO
AS
SELECT event_date, region, COUNT(*) AS event_count
FROM main.analytics.web_events
GROUP BY event_date, region;`, `SELECT event_date, region, COUNT(*) AS event_count FROM web_events GROUP BY event_date, region;`],
      ['REFRESH MATERIALIZED VIEW', 'Request a refresh after source data changes; the configured policy controls the refresh approach.', `REFRESH MATERIALIZED VIEW main.analytics.daily_region_events;`, `SELECT event_date, region, COUNT(*) AS event_count FROM web_events GROUP BY event_date, region;`],
      ['REFRESH POLICY INCREMENTAL', 'Require incremental refresh when possible; creation or refresh fails if the query cannot be incrementalized.', `CREATE OR REPLACE MATERIALIZED VIEW main.analytics.daily_region_events
REFRESH POLICY INCREMENTAL
AS SELECT event_date, region, COUNT(*) AS event_count
FROM main.analytics.web_events
GROUP BY event_date, region;`, `SELECT 'Use SQLite to validate the aggregate result; refresh policies run in Databricks.' AS note;`],
      ['EXPLAIN CREATE MATERIALIZED VIEW', 'Check whether the query shape is structurally eligible before creating or refreshing the view.', `EXPLAIN CREATE MATERIALIZED VIEW main.analytics.daily_region_events
AS SELECT event_date, region, COUNT(*) AS event_count
FROM main.analytics.web_events
GROUP BY event_date, region;`, `SELECT region, COUNT(*) AS event_count FROM web_events GROUP BY region;`],
    ] }],
  },
  {
    group, title: 'Stream-stream joins & state management', time: '20 MIN', level: 'ADVANCED',
    intro: 'Join two live event streams while bounding how long unmatched rows stay in state. Watermarks and a time-range condition make state cleanup possible.',
    task: 'Match each impression with a click from the same user that arrives within ten minutes.',
    hint: 'Add an event-time watermark to both streams and include a bounded time condition in the join, in addition to the user key.',
    query: `WITH impressions(user_id, impression_time) AS (
  VALUES (7, '2025-03-01 10:00:00'), (8, '2025-03-01 10:02:00')
), clicks(user_id, click_time) AS (
  VALUES (7, '2025-03-01 10:06:00'), (8, '2025-03-01 10:25:00')
)
SELECT i.user_id, i.impression_time, c.click_time
FROM impressions AS i
JOIN clicks AS c
  ON c.user_id = i.user_id
 AND datetime(c.click_time) >= datetime(i.impression_time)
 AND datetime(c.click_time) <= datetime(i.impression_time, '+10 minutes')
ORDER BY i.user_id;`,
    heading: 'The key finds candidates; event time bounds state',
    copy: 'A stream-stream join must retain rows that might still find a match. Watermark each input and state a bounded event-time relationship, such as a click occurring from an impression through ten minutes later. A watermark that is too short can discard valid late matches; a longer watermark uses more state and may delay final output.',
    example: `WITH impressions(user_id, impression_time) AS (
  VALUES (7, '2025-03-01 10:00:00'), (8, '2025-03-01 10:02:00')
), clicks(user_id, click_time) AS (
  VALUES (7, '2025-03-01 10:06:00'), (8, '2025-03-01 10:25:00')
)
SELECT i.user_id, i.impression_time, c.click_time,
       CASE WHEN c.click_time IS NULL THEN 'no timely click' ELSE 'matched' END AS outcome
FROM impressions AS i
LEFT JOIN clicks AS c ON c.user_id = i.user_id
 AND datetime(c.click_time) BETWEEN datetime(i.impression_time)
 AND datetime(i.impression_time, '+10 minutes')
ORDER BY i.user_id;`,
    caption: 'RUNNABLE SQLITE VERSION · BOUNDED EVENT MATCH',
    after: 'The local query matches a finite pair of sample relations. It does not maintain streaming state or discard late events. In Databricks SQL, create a Lakeflow streaming table and watermark both stream inputs.',
    tip: 'For stream-stream joins, use a time-range condition that reflects the business definition. The global watermark advances from both inputs, so the slower stream can hold back state cleanup.',
    glanceLabel: 'Keep only timely click matches',
    glanceExplanation: 'The local join uses the same user key and a ten-minute interval. The Databricks version adds streaming sources and watermarks so Spark can evict old join state.',
    functionGroups: [{ name: 'Bounded stream-stream joins', items: [
      ['WATERMARK on each input', 'Each stream needs an event-time watermark; name the relation after the watermark clause.', `FROM STREAM(main.bronze.impressions)
WATERMARK impression_time DELAY OF INTERVAL 10 MINUTES AS i
INNER JOIN STREAM(main.bronze.clicks)
WATERMARK click_time DELAY OF INTERVAL 10 MINUTES AS c`, `SELECT 'For a finite local example, use the bounded join query above.' AS note;`],
      ['Join key + time range', 'Bound matches using both a business key and an event-time interval.', `ON i.user_id = c.user_id
AND c.click_time >= i.impression_time
AND c.click_time <= i.impression_time + INTERVAL 10 MINUTES`, `WITH impressions(user_id, t) AS (VALUES (7,'2025-03-01 10:00:00')),
clicks(user_id, t) AS (VALUES (7,'2025-03-01 10:06:00'))
SELECT i.user_id FROM impressions i JOIN clicks c
ON c.user_id=i.user_id AND datetime(c.t) BETWEEN datetime(i.t) AND datetime(i.t,'+10 minutes');`],
      ['CREATE STREAMING TABLE', 'Write the joined stream result to a pipeline-managed target with a bounded state definition.', `CREATE OR REFRESH STREAMING TABLE main.analytics.impression_clicks AS
SELECT i.user_id, i.impression_time, c.click_time
FROM STREAM(main.bronze.impressions)
WATERMARK impression_time DELAY OF INTERVAL 10 MINUTES AS i
INNER JOIN STREAM(main.bronze.clicks)
WATERMARK click_time DELAY OF INTERVAL 10 MINUTES AS c
ON i.user_id = c.user_id
AND c.click_time BETWEEN i.impression_time AND i.impression_time + INTERVAL 10 MINUTES;`, `SELECT user_id, impression_time, click_time FROM (SELECT 7 AS user_id, '10:00' AS impression_time, '10:06' AS click_time);`],
      ['Late data vs retained state', 'Events within the threshold are processed; records later than the watermark are not guaranteed to match.', `-- Choose the delay from observed source lateness and the business tolerance.
WATERMARK event_time DELAY OF INTERVAL 10 MINUTES`, `SELECT 'A local batch query has no watermark or streaming state.' AS note;`],
    ] }],
  },
  {
    group, title: 'SQL warehouse sizing & cost controls', time: '19 MIN', level: 'ADVANCED',
    intro: 'Choose warehouse capacity from query concurrency, queue time, spill, and usage data. Separate SQL tuning from compute sizing before increasing capacity.',
    task: 'Calculate daily active users from the sample event table.',
    hint: 'Count distinct user_id by event_date in a new query. For sizing, compare queue time, concurrency, spill, and execution time.',
    query: `SELECT event_date AS event_day,
       COUNT(DISTINCT user_id) AS active_users
FROM web_events
GROUP BY event_date
ORDER BY event_day
LIMIT 20;`,
    heading: 'Size for the workload you measure',
    copy: 'Use query history to separate queue time from execution time. Repeated capacity waits suggest more concurrent capacity; high spill can mean the warehouse is too small or the query needs optimization. Use billing usage and tags to attribute spend, and set auto-stop for idle warehouses.',
    example: `SELECT region, COUNT(*) AS events
FROM web_events
GROUP BY region
ORDER BY events DESC;`,
    caption: 'RUNNABLE SQLITE VERSION · WORKLOAD SHAPE',
    after: 'This local SQLite query has no cloud warehouse, queues, compute size, or billable usage. Databricks examples below use system tables that require the corresponding permissions and Unity Catalog system-table access.',
    tip: 'Start from Query Profile and warehouse monitoring. Scale up for sustained spill or execution pressure; scale out for concurrency waits. Compare the impact and cost after each change.',
    glanceLabel: 'Estimate the shape of a workload',
    glanceExplanation: 'Summarize the sample to see workload distribution. In Databricks, use system.query.history and warehouse monitoring to distinguish heavy queries from capacity pressure.',
    functionGroups: [{ name: 'Measure queries, queues, and spend', items: [
      ['system.query.history · capacity waits', 'Find statements spending time in the queue instead of executing.', `SELECT statement_id, total_duration_ms,
       waiting_at_capacity_duration_ms, execution_duration_ms,
       start_time, statement_text
FROM system.query.history
WHERE compute.warehouse_id = '<warehouse-id>'
  AND start_time >= NOW() - INTERVAL 7 DAY
  AND waiting_at_capacity_duration_ms > 0
ORDER BY waiting_at_capacity_duration_ms DESC
LIMIT 50;`, `SELECT event_type, COUNT(*) AS event_count FROM web_events GROUP BY event_type ORDER BY event_count DESC;`],
      ['system.query.history · disk spill', 'Check spill and scan bytes before deciding whether to tune SQL or add warehouse resources.', `SELECT statement_id,
       spilled_local_bytes / (1024 * 1024) AS spilled_mb,
       read_bytes / (1024 * 1024) AS read_mb,
       total_duration_ms, start_time
FROM system.query.history
WHERE compute.warehouse_id = '<warehouse-id>'
  AND start_time >= NOW() - INTERVAL 7 DAY
  AND spilled_local_bytes > 0
ORDER BY spilled_local_bytes DESC
LIMIT 50;`, `SELECT region, COUNT(*) AS events, SUM(amount) AS amount FROM web_events GROUP BY region ORDER BY events DESC;`],
      ['system.billing.usage · usage trend', 'Aggregate usage by date and product; join list prices for an estimate, then compare with billing.', `SELECT usage_date, sku_name,
       SUM(usage_quantity) AS usage_quantity
FROM system.billing.usage
WHERE usage_date >= DATE_SUB(CURRENT_DATE(), 30)
  AND usage_unit = 'DBU'
GROUP BY usage_date, sku_name
ORDER BY usage_date, sku_name;`, `SELECT event_date, COUNT(*) AS event_count FROM web_events GROUP BY event_date ORDER BY event_date;`],
      ['Warehouse scaling and auto-stop', 'Use queue metrics to tune concurrency capacity and an auto-stop interval to avoid paying for idle time.', `-- Review warehouse settings and monitoring before changing size,
-- maximum clusters, or auto-stop minutes.`, `SELECT event_type, COUNT(*) AS events FROM web_events GROUP BY event_type;`],
    ] }],
  },
];
