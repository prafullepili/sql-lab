const group = 'DATABRICKS DEEP DIVES';

export const databricksLessons = [
  {
    group, title: 'Arrays, maps & structs in Databricks SQL', time: '18 MIN', level: 'ADVANCED',
    intro: 'Work with nested values without losing the relationship between a parent row and its children. Explore array indexing, map lookup, explode, and struct reconstruction.',
    task: 'Flatten product tags. Return one row per tag with the original product id and name.',
    hint: 'In this local exercise, json_each plays the role of explode. Its key is the array position and its value is the element.',
    query: `WITH products(product_id, name, tags) AS (
  VALUES
    (1, 'SQL notebook', '["analytics","sql"]'),
    (2, 'Lakehouse guide', '["spark","delta","sql"]'),
    (3, 'Data journal', '["analytics"]')
)
SELECT p.product_id, p.name, CAST(tag.key AS INTEGER) + 1 AS tag_position, tag.value AS tag
FROM products AS p, json_each(p.tags) AS tag
ORDER BY p.product_id, tag_position;`,
    heading: 'A nested column is still part of its parent row',
    copy: 'An ARRAY is an ordered collection, a MAP stores key/value pairs, and a STRUCT groups named fields. Use element_at or bracket access to retrieve a value, then use explode as a table-valued function when each nested item needs its own row. Keep the parent key in the SELECT list so the flattened rows can be related back to their source.',
    example: `WITH products(product_id, name, tags) AS (
  VALUES (1, 'SQL notebook', '["analytics","sql"]'),
         (2, 'Lakehouse guide', '["spark","delta","sql"]')
)
SELECT p.product_id, p.name, tag.value AS tag
FROM products AS p, json_each(p.tags) AS tag
ORDER BY p.product_id, tag.key;`,
    caption: 'RUNNABLE SQLITE VERSION · JSON1',
    after: 'The local SQLite runner uses JSON text and json_each to demonstrate the same row-shaping idea. Databricks has native ARRAY, MAP, and STRUCT types, so its values do not need to be serialized as JSON first.',
    tip: 'Exploding an array multiplies rows. Count parent keys before and after flattening, and avoid exploding multiple arrays together unless you intend to create combinations.',
    glanceLabel: 'Flatten and rebuild',
    glanceExplanation: 'The Databricks pattern explodes child structs, transforms them, then collects structs back into an array. The local query groups relational child rows into JSON for a runnable analogue.',
    functionGroups: [{ name: 'Databricks nested-data functions', items: [
      ['element_at(map, key)', 'Read one map value by key; use bracket access for concise lookup.', `SELECT attributes['channel'] AS channel FROM orders;`, `SELECT 'web' AS channel;`],
      ['LATERAL explode(array)', 'Return one row for each array element while retaining its parent id.', `SELECT o.order_id, item.sku, item.qty
FROM orders AS o,
LATERAL explode(o.items) AS child(item);`, `SELECT order_id, product_id AS sku, quantity AS qty FROM order_items ORDER BY order_id;`],
      ['LATERAL explode(map)', 'Turn each map entry into a key and a value column.', `SELECT o.order_id, entry.key, entry.value
FROM orders AS o,
LATERAL explode(o.attributes) AS entry;`, `SELECT order_id, status AS key, total AS value FROM orders ORDER BY order_id;`],
      ['named_struct + collect_list', 'Build a typed struct and collect child structs into an array per parent.', `SELECT order_id,
       collect_list(named_struct('sku', product_id, 'qty', quantity)) AS items
FROM order_items
GROUP BY order_id;`, `SELECT order_id,
       json_group_array(json_object('sku', product_id, 'qty', quantity)) AS items
FROM order_items
GROUP BY order_id;`],
      ['flatten(array<array<T>>)', 'Remove one level of nesting from an array of arrays.', `SELECT flatten(array(array('sql', 'spark'), array('delta')));`, `SELECT 'sql' AS tag UNION ALL SELECT 'spark' UNION ALL SELECT 'delta';`],
    ] }],
  },
  {
    group, title: 'JSON parsing & schema evolution', time: '17 MIN', level: 'ADVANCED',
    intro: 'Turn semi-structured JSON into queryable fields, handle optional keys safely, and choose when to lock a schema or let a pipeline evolve it.',
    task: 'Parse two event payload versions and return a consistent campaign and device column.',
    hint: 'One payload has no campaign key. Use COALESCE so a new optional key does not make older rows disappear.',
    query: `WITH raw_events(event_id, payload) AS (
  VALUES
    (1, '{"user_id": 41, "campaign": "spring", "device": "mobile"}'),
    (2, '{"user_id": 42, "device": "desktop"}'),
    (3, '{"user_id": 43, "campaign": "summer", "device": "tablet"}')
)
SELECT event_id,
       json_extract(payload, '$.user_id') AS user_id,
       COALESCE(json_extract(payload, '$.campaign'), 'unattributed') AS campaign,
       json_extract(payload, '$.device') AS device
FROM raw_events
ORDER BY event_id;`,
    heading: 'Parse deliberately, then evolve deliberately',
    copy: 'For a stable contract, use from_json with an explicit schema and select only the fields the downstream model needs. Missing keys become NULL, so COALESCE can provide a safe default. In Lakeflow pipelines, supported from_json schema inference can track additions; that pipeline-specific preview is different from ordinary ad hoc SQL parsing.',
    example: `WITH raw_events(event_id, payload) AS (
  VALUES (1, '{"user_id":41,"campaign":"spring"}'),
         (2, '{"user_id":42}')
)
SELECT event_id,
       json_extract(payload, '$.user_id') AS user_id,
       COALESCE(json_extract(payload, '$.campaign'), 'unattributed') AS campaign
FROM raw_events;`,
    caption: 'RUNNABLE SQLITE VERSION · JSON1',
    after: 'Databricks from_json returns a typed STRUCT or ARRAY. Adding a new source field should be an explicit data-contract decision: capture it, rescue it for investigation, or reject it rather than silently changing downstream meaning.',
    tip: 'Track malformed payloads separately from valid rows. A NULL parsed object can mean invalid JSON, while a NULL field can simply mean that an older schema never sent that key.',
    glanceLabel: 'Parse two payload versions',
    glanceExplanation: 'The local exercise uses json_extract. In Databricks, use from_json to parse once into a typed value and dot notation to select its struct fields.',
    functionGroups: [{ name: 'Databricks JSON and schema tools', items: [
      ['from_json(payload, schema)', 'Parse JSON into a typed struct using an explicit schema.', `SELECT from_json(payload, 'user_id BIGINT, campaign STRING, device STRING') AS event
FROM raw_events;`, `WITH raw_events(payload) AS (VALUES ('{"user_id":41,"campaign":"spring","device":"mobile"}'))
SELECT json_extract(payload, '$.user_id') AS user_id,
       json_extract(payload, '$.campaign') AS campaign,
       json_extract(payload, '$.device') AS device
FROM raw_events;`],
      ['schema_of_json(json)', 'Inspect a JSON sample and return a schema string to review.', `SELECT schema_of_json('{"user_id":41,"campaign":"spring"}');`, `SELECT 'user_id INTEGER, campaign TEXT' AS inferred_schema;`],
      ['get_json_object(payload, path)', 'Extract one value by JSONPath when a full typed struct is unnecessary.', `SELECT get_json_object(payload, '$.campaign') AS campaign
FROM raw_events;`, `WITH raw_events(payload) AS (VALUES ('{"campaign":"spring"}'))
SELECT json_extract(payload, '$.campaign') AS campaign FROM raw_events;`],
      ['Pipeline schema evolution', 'In supported Lakeflow pipelines, from_json can infer and add fields using a managed schema location.', `SELECT from_json(payload, NULL,
       map('schemaLocationKey', 'web_events', 'schemaEvolutionMode', 'addNewColumns')) AS event
FROM STREAM(raw_events);`, `SELECT 'Pipeline-only feature: use an explicit schema in this local SQLite lesson.' AS note;`],
    ] }],
  },
  {
    group, title: 'Delta MERGE & slowly changing dimensions', time: '22 MIN', level: 'ADVANCED',
    intro: 'Use Delta MERGE for idempotent upserts, then choose between SCD Type 1 current-state records and SCD Type 2 history.',
    task: 'Classify incoming customer changes as inserts, unchanged rows, or new history versions.',
    hint: 'Match on the business key. For Type 2, a changed current row is closed and a new version is inserted with a new effective time.',
    query: `WITH incoming(customer_id, name, change_time) AS (
  VALUES (1, 'Ava Chen', '2025-01-01'),
         (2, 'Noah P.', '2025-01-02'),
         (7, 'Ivy Shah', '2025-01-03')
)
SELECT s.customer_id, s.name,
       CASE
         WHEN t.id IS NULL THEN 'INSERT'
         WHEN t.name <> s.name THEN 'NEW TYPE 2 VERSION'
         ELSE 'UNCHANGED'
       END AS action
FROM incoming AS s
LEFT JOIN customers AS t ON t.id = s.customer_id
ORDER BY s.customer_id;`,
    heading: 'Upserts and history answer different questions',
    copy: 'MERGE combines matched and unmatched source rows atomically against a Delta target. Type 1 overwrites the current value. Type 2 preserves prior values by closing the active version and inserting another row with valid-from and valid-to dates. Deduplicate the source to one deterministic change per key and sequence before merging.',
    example: `WITH incoming(customer_id, name) AS (
  VALUES (1, 'Ava Chen'), (2, 'Noah P.'), (7, 'Ivy Shah')
)
SELECT s.customer_id, s.name,
       CASE WHEN t.id IS NULL THEN 'INSERT'
            WHEN t.name <> s.name THEN 'NEW TYPE 2 VERSION'
            ELSE 'UNCHANGED' END AS action
FROM incoming AS s
LEFT JOIN customers AS t ON t.id = s.customer_id
ORDER BY s.customer_id;`,
    caption: 'RUNNABLE SQLITE VERSION · CHANGE CLASSIFICATION',
    after: 'The local database is SQLite, so it can run the change-classification query but not Delta MERGE. The Databricks snippets below show the native Delta and Lakeflow approaches; run them in a Databricks SQL or Lakeflow pipeline environment.',
    tip: 'A Type 2 merge needs both a close-old-version action and a new-version insert. A staged source can provide two source rows for a changed key; AUTO CDC is usually simpler for sequenced change feeds.',
    glanceLabel: 'Detect current-state changes',
    glanceExplanation: 'Compare each incoming business key and value with the current customer row before choosing an idempotent update or history-preserving action.',
    functionGroups: [{ name: 'Delta upserts and SCD patterns', items: [
      ['MERGE · SCD Type 1', 'Update a matched key and insert a new key. Re-running the same source is safe when source keys are unique.', `MERGE INTO main.crm.customer_current AS t
USING incoming_customers AS s
ON t.customer_id = s.customer_id
WHEN MATCHED THEN UPDATE SET t.name = s.name, t.city = s.city
WHEN NOT MATCHED THEN INSERT (customer_id, name, city)
VALUES (s.customer_id, s.name, s.city);`, `WITH incoming(customer_id, name) AS (VALUES (1, 'Ava Chen'), (7, 'Ivy Shah'))
SELECT s.customer_id, s.name,
       CASE WHEN t.id IS NULL THEN 'INSERT' ELSE 'UPDATE IN PLACE' END AS type_1_action
FROM incoming AS s LEFT JOIN customers AS t ON t.id = s.customer_id;`],
      ['MERGE · staged SCD Type 2', 'For changed keys, stage a matching row to expire the active version plus a NULL merge key row that inserts the new version.', `MERGE INTO main.crm.customer_history AS t
USING staged_customer_changes AS s
ON t.customer_id = s.merge_key AND t.is_current = true
WHEN MATCHED THEN UPDATE SET t.is_current = false, t.valid_to = s.changed_at
WHEN NOT MATCHED THEN INSERT (customer_id, name, valid_from, is_current)
VALUES (s.customer_id, s.name, s.changed_at, true);`, `WITH incoming(customer_id, name) AS (VALUES (1, 'Ava Chen'), (2, 'Noah P.'), (7, 'Ivy Shah'))
SELECT s.customer_id, s.name,
       CASE WHEN t.id IS NULL THEN 'INSERT VERSION'
            WHEN t.name <> s.name THEN 'EXPIRE OLD + INSERT VERSION'
            ELSE 'KEEP CURRENT VERSION' END AS type_2_action
FROM incoming AS s LEFT JOIN customers AS t ON t.id = s.customer_id;`],
      ['WHEN MATCHED / NOT MATCHED', 'Matched clauses update or delete; not-matched clauses add source records with no target match.', `MERGE INTO target AS t USING source AS s ON t.id = s.id
WHEN MATCHED AND s.is_deleted THEN DELETE
WHEN MATCHED THEN UPDATE SET t.value = s.value
WHEN NOT MATCHED THEN INSERT (id, value) VALUES (s.id, s.value);`, `SELECT 'Use the action preview above; SQLite does not implement Delta MERGE.' AS note;`],
    ] }],
  },
  {
    group, title: 'Change data capture & incremental pipelines', time: '19 MIN', level: 'ADVANCED',
    intro: 'Process inserts, updates, deletes, and out-of-order changes by tracking a key and a reliable sequence, instead of rebuilding a whole target on each run.',
    task: 'For each customer key, keep the latest change by sequence, even when the input rows arrive out of order.',
    hint: 'Use ROW_NUMBER partitioned by the business key and ordered by the source sequence descending.',
    query: `WITH changes(change_id, customer_id, operation, sequence_num) AS (
  VALUES (1, 101, 'INSERT', 10),
         (2, 101, 'UPDATE', 12),
         (3, 102, 'INSERT', 11),
         (4, 101, 'UPDATE', 9),
         (5, 102, 'DELETE', 14)
), ranked AS (
  SELECT *, ROW_NUMBER() OVER (
    PARTITION BY customer_id ORDER BY sequence_num DESC, change_id DESC
  ) AS position
  FROM changes
)
SELECT customer_id, operation AS latest_operation, sequence_num
FROM ranked
WHERE position = 1
ORDER BY customer_id;`,
    heading: 'A change feed is ordered data, not just more rows',
    copy: 'CDC records describe what changed and when the source says it changed. Use a stable key and a monotonically ordered sequence so late arrivals do not overwrite newer state. Treat deletes explicitly, and make retries idempotent by checkpointing or using a pipeline-managed checkpoint.',
    example: `WITH changes(customer_id, operation, sequence_num) AS (
  VALUES (101, 'INSERT', 10), (101, 'UPDATE', 12),
         (101, 'UPDATE', 9), (102, 'DELETE', 14)
), ranked AS (
  SELECT *, ROW_NUMBER() OVER (
    PARTITION BY customer_id ORDER BY sequence_num DESC
  ) AS position
  FROM changes
)
SELECT customer_id, operation, sequence_num
FROM ranked WHERE position = 1;`,
    caption: 'RUNNABLE SQLITE VERSION · LATEST CHANGE PER KEY',
    after: 'Delta Change Data Feed can expose row changes and commit metadata through table_changes. Lakeflow AUTO CDC applies sequenced changes to a streaming target and can maintain Type 1 or Type 2 history. Change feeds follow table retention and are not a permanent audit archive.',
    tip: 'A late event is not necessarily the newest event. Order by the source sequence, not arrival time; add a deterministic tie-breaker if sequence values can repeat.',
    glanceLabel: 'Resolve out-of-order changes',
    glanceExplanation: 'The local example ranks change rows by sequence. In production, persist pipeline checkpoints and use Delta change metadata or a source-provided sequence.',
    functionGroups: [{ name: 'Databricks CDC tools', items: [
      ['table_changes(table, start_version)', 'Read Delta row changes from a version range when Change Data Feed is available.', `SELECT customer_id, operation, _change_type, _commit_version
FROM table_changes('main.crm.customer_source', 12)
ORDER BY _commit_version;`, `WITH changes(customer_id, operation, sequence_num) AS (VALUES (101,'UPDATE',12),(102,'DELETE',14))
SELECT customer_id, operation, sequence_num FROM changes ORDER BY sequence_num;`],
      ['AUTO CDC · SCD Type 1', 'Apply source changes into a streaming target, sequencing and recognizing deletes.', `CREATE OR REFRESH STREAMING TABLE main.crm.customer_current;
CREATE FLOW apply_customer_cdc AS AUTO CDC INTO main.crm.customer_current
FROM stream(main.bronze.customer_changes)
KEYS (customer_id)
APPLY AS DELETE WHEN operation = 'DELETE'
SEQUENCE BY source_sequence
COLUMNS * EXCEPT (operation, source_sequence)
STORED AS SCD TYPE 1;`, `WITH changes(customer_id, operation, sequence_num) AS (VALUES (101,'UPDATE',12),(102,'DELETE',14))
SELECT customer_id, operation, sequence_num FROM changes ORDER BY sequence_num;`],
      ['AUTO CDC · SCD Type 2', 'Keep historical versions by changing the target behavior to SCD Type 2.', `CREATE OR REFRESH STREAMING TABLE main.crm.customer_history;
CREATE FLOW customer_history_cdc AS AUTO CDC INTO main.crm.customer_history
FROM stream(main.bronze.customer_changes)
KEYS (customer_id)
SEQUENCE BY source_sequence
STORED AS SCD TYPE 2;`, `SELECT customer_id, operation, sequence_num,
       CASE WHEN operation = 'DELETE' THEN 'close or remove current state' ELSE 'apply latest version' END AS action
FROM (SELECT 101 AS customer_id, 'UPDATE' AS operation, 12 AS sequence_num);`],
    ] }],
  },
  {
    group, title: 'Streaming SQL & event-time windows', time: '18 MIN', level: 'ADVANCED',
    intro: 'Aggregate event streams by the time an event happened, not the time it reached the system. Use windows and watermarks to balance completeness with bounded state.',
    task: 'Summarize events by calendar day and region using the sample event table.',
    hint: 'The sample data stores dates as ISO text. SQLite strftime can group it; Databricks streaming SQL uses window(event_time, interval).',
    query: `SELECT strftime('%Y-%m-%d', event_date) AS event_day,
       region,
       COUNT(*) AS event_count,
       SUM(CASE WHEN event_type = 'purchase' THEN amount ELSE 0 END) AS revenue
FROM web_events
GROUP BY event_day, region
ORDER BY event_day, region
LIMIT 20;`,
    heading: 'Windows bound the group; watermarks bound its state',
    copy: 'Event time belongs to the record; processing time belongs to the system. A time window groups events into intervals. A watermark says how long the stateful query should wait for out-of-order events before finalizing old windows and discarding their state.',
    example: `SELECT event_date AS event_day, region,
       COUNT(*) AS events,
       SUM(CASE WHEN event_type = 'purchase' THEN amount ELSE 0 END) AS revenue
FROM web_events
GROUP BY event_day, region
ORDER BY event_day, region
LIMIT 20;`,
    caption: 'RUNNABLE SQLITE VERSION · BATCH WINDOW ANALOGUE',
    after: 'The local runner reads a finite SQLite table, so it demonstrates the grouping but cannot keep a live stream, checkpoint state, or drop late events. The Databricks SQL example creates a Lakeflow streaming table from a stream source.',
    tip: 'Choose a watermark from measured lateness and correctness needs. A longer delay can accept more late data but retains more aggregation state and delays final output.',
    glanceLabel: 'Daily volume and sales',
    glanceExplanation: 'Compare this batch grouping with a streaming time window. The SQL form shares the same grouping logic, while the stream adds event-time semantics and a watermark.',
    functionGroups: [{ name: 'Streaming SQL concepts', items: [
      ['window(timestamp, duration)', 'Assign events to a fixed time interval, such as a five-minute tumbling window.', `CREATE OR REFRESH STREAMING TABLE main.analytics.event_counts AS
SELECT window(event_time, '5 minutes') AS event_window,
       region, COUNT(*) AS event_count
FROM STREAM(main.bronze.web_events)
WATERMARK event_time DELAY OF INTERVAL 10 MINUTES AS events
GROUP BY window(event_time, '5 minutes'), region;`, `SELECT event_date AS event_window, region, COUNT(*) AS event_count
FROM web_events GROUP BY event_date, region ORDER BY event_date, region LIMIT 10;`],
      ['WATERMARK ... DELAY OF INTERVAL', 'Bound how long state is retained while still allowing a measured amount of lateness.', `FROM STREAM(main.bronze.web_events)
WATERMARK event_time DELAY OF INTERVAL 10 MINUTES AS events`, `SELECT 'A watermark requires a streaming engine; use event_date for this local batch example.' AS note;`],
      ['Event time vs processing time', 'Use the timestamp describing when the business event occurred for event-time windows.', `SELECT window(event_time, '1 hour') AS event_window,
       COUNT(*) AS events
FROM STREAM(main.bronze.web_events)
WATERMARK event_time DELAY OF INTERVAL 30 MINUTES AS events
GROUP BY window(event_time, '1 hour');`, `SELECT event_date AS event_day, COUNT(*) AS events
FROM web_events GROUP BY event_date ORDER BY event_date LIMIT 10;`],
    ] }],
  },
  {
    group, title: 'Spark execution tuning deep dive', time: '21 MIN', level: 'ADVANCED',
    intro: 'Read a query plan, find expensive shuffles and skew, and use adaptive query execution and file layout deliberately instead of guessing at cluster settings.',
    task: 'Summarize event counts and revenue by region and event type for dates after June 1, 2025.',
    hint: 'GROUP BY and joins can trigger shuffles. First inspect the physical plan and compare row counts or task durations before changing partition settings.',
    query: `SELECT region,
       event_type,
       COUNT(*) AS events,
       SUM(amount) AS revenue
FROM web_events
WHERE event_date >= '2025-06-01'
GROUP BY region, event_type
ORDER BY events DESC;`,
    heading: 'Measure the expensive stage before you tune it',
    copy: 'A shuffle redistributes records between Spark executors for joins, aggregations, and sorts. Skew means a small number of keys or partitions hold much more work than the rest. Adaptive Query Execution can coalesce small shuffle partitions, change some join strategies, and split skewed shuffle tasks using runtime statistics.',
    example: `EXPLAIN QUERY PLAN
SELECT region, event_type, COUNT(*) AS events
FROM web_events
WHERE event_date >= '2025-06-01'
GROUP BY region, event_type
ORDER BY events DESC;`,
    caption: 'RUNNABLE SQLITE VERSION · PLAN INSPECTION',
    after: 'SQLite shows a local query plan, not a Spark physical plan. In Databricks use EXPLAIN FORMATTED and the query profile. AQE is enabled by default in Databricks; tune shuffle or file settings only when the profile shows a concrete bottleneck.',
    tip: 'A high max-task duration compared with the 75th percentile can signal skew. Check the key distribution first; pre-aggregate or salt a hot key only when evidence supports it.',
    glanceLabel: 'Reduce rows before grouping',
    glanceExplanation: 'Filter early and project only needed columns to reduce bytes sent into later stages. Then inspect the Databricks plan and profile for actual shuffle, skew, and file scan costs.',
    functionGroups: [{ name: 'Read plans and understand Spark work', items: [
      ['EXPLAIN FORMATTED', 'Inspect logical and physical plans, including scans, exchanges, joins, and aggregates.', `EXPLAIN FORMATTED
SELECT region, COUNT(*) AS events
FROM main.analytics.web_events
WHERE event_date >= DATE '2025-06-01'
GROUP BY region;`, `EXPLAIN QUERY PLAN SELECT region, COUNT(*) AS events
FROM web_events WHERE event_date >= '2025-06-01' GROUP BY region;`],
      ['Adaptive Query Execution', 'AQE can adjust supported join strategies, coalesce partitions, and split skewed shuffle tasks at runtime.', `SELECT region, event_type, COUNT(*) AS events
FROM main.analytics.web_events
GROUP BY region, event_type;`, `SELECT region, event_type, COUNT(*) AS events
FROM web_events GROUP BY region, event_type;`],
      ['Shuffle partition sizing', 'Start with automatic shuffle sizing where supported; avoid setting a large fixed partition count by habit.', `SET spark.sql.shuffle.partitions = auto;`, `SELECT 'Inspect the plan and data size before changing shuffle partitions.' AS tuning_note;`],
      ['File sizing and layout', 'Use table maintenance and clustering based on query predicates and measured small-file or scan problems.', `OPTIMIZE main.analytics.web_events
ZORDER BY (event_date, region);`, `SELECT event_date, region, COUNT(*) AS events
FROM web_events GROUP BY event_date, region;`],
    ] }],
  },
  {
    group, title: 'Data quality rules & anomaly checks', time: '17 MIN', level: 'ADVANCED',
    intro: 'Turn quality expectations into observable rules. Separate validation, quarantine, deduplication, and enforced table constraints so bad data is handled intentionally.',
    task: 'Measure missing regions, invalid amounts, and repeated event identifiers before loading a clean table.',
    hint: 'Conditional aggregates count failures without hiding the source rows. Add a WHERE predicate to inspect the actual records that fail.',
    query: `SELECT COUNT(*) AS total_rows,
       SUM(CASE WHEN region IS NULL OR trim(region) = '' THEN 1 ELSE 0 END) AS missing_region,
       SUM(CASE WHEN amount < 0 THEN 1 ELSE 0 END) AS negative_amount,
       COUNT(*) - COUNT(DISTINCT event_id) AS repeated_event_rows
FROM web_events;`,
    heading: 'A quality rule needs an action and a metric',
    copy: 'Start with a SQL predicate that can be evaluated for each row. Decide whether violations should be measured and retained, quarantined, dropped, or cause the pipeline update to fail. Use deduplication rules that state which record wins, such as the latest source sequence for each event key.',
    example: `SELECT event_id, user_id, amount,
       CASE
         WHEN region IS NULL OR trim(region) = '' THEN 'missing region'
         WHEN amount < 0 THEN 'negative amount'
         ELSE 'valid'
       END AS quality_status
FROM web_events
WHERE region IS NULL OR trim(region) = '' OR amount < 0
LIMIT 20;`,
    caption: 'RUNNABLE SQLITE VERSION · FIND INVALID ROWS',
    after: 'Databricks Delta CHECK and NOT NULL constraints reject violating writes. Lakeflow pipeline expectations attach a named SQL condition and an action such as keep-and-measure, drop, or fail. Expectations are pipeline features, not ordinary SELECT clauses.',
    tip: 'Avoid silently filtering bad records. Keep a reason code and enough source context to repair, replay, or explain the rejected data.',
    glanceLabel: 'Profile the sample data',
    glanceExplanation: 'The local table is intentionally clean, so the checks return zero for these rules. Try changing the predicates or staging rows to see how failure counts reveal data issues.',
    functionGroups: [{ name: 'Quality rules in SQL and Lakeflow', items: [
      ['NOT NULL / CHECK', 'Delta table constraints enforce required fields and row-level Boolean conditions at write time.', `CREATE TABLE main.analytics.valid_orders (
  order_id BIGINT NOT NULL,
  amount DECIMAL(12,2),
  CONSTRAINT amount_nonnegative CHECK (amount >= 0)
);`, `SELECT COUNT(*) AS invalid_amounts
FROM orders WHERE total < 0 OR total IS NULL;`],
      ['EXPECT · keep and measure', 'A pipeline expectation records quality metrics and keeps rows that fail the condition.', `CONSTRAINT valid_amount EXPECT (amount >= 0)`, `SELECT SUM(CASE WHEN amount < 0 THEN 1 ELSE 0 END) AS invalid_rows FROM web_events;`],
      ['EXPECT ... DROP ROW', 'Drop failing rows from a pipeline output while recording expectation metrics.', `CREATE OR REFRESH STREAMING TABLE main.analytics.clean_events (
  CONSTRAINT has_event_id EXPECT (event_id IS NOT NULL) ON VIOLATION DROP ROW
) AS SELECT * FROM STREAM(main.bronze.web_events);`, `SELECT event_id, amount FROM web_events WHERE event_id IS NULL;`],
      ['ROW_NUMBER deduplication', 'Keep one row per key using an explicit source ordering and tie-breaker.', `SELECT * EXCEPT (row_num)
FROM (
  SELECT *, ROW_NUMBER() OVER (
    PARTITION BY event_id ORDER BY event_time DESC, source_sequence DESC
  ) AS row_num
  FROM main.bronze.raw_events
)
WHERE row_num = 1;`, `WITH ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY event_date DESC) AS row_num
  FROM web_events
)
SELECT event_id, user_id, event_date FROM ranked WHERE row_num = 1;`],
    ] }],
  },
  {
    group, title: 'Unity Catalog security & governance', time: '18 MIN', level: 'ADVANCED',
    intro: 'Navigate the catalog, schema, and table hierarchy. Grant only the privileges a group needs, then use row filters, masks, or centralized policies for sensitive data.',
    task: 'Summarize purchase counts and total purchase amount by region.',
    hint: 'Object access requires the parent usage privileges as well as SELECT on the table. A row filter or mask restricts visible values; it does not grant base access.',
    query: `SELECT region,
       COUNT(*) AS events,
       ROUND(SUM(amount), 2) AS purchase_amount
FROM web_events
WHERE event_type = 'purchase'
GROUP BY region
ORDER BY purchase_amount DESC;`,
    heading: 'Govern access at the right level',
    copy: 'Unity Catalog organizes securables as catalog → schema → table or function. GRANT and REVOKE define baseline privileges. Row filters restrict which records a reader sees; column masks transform protected values. For consistent tag-driven controls across many objects, compare table-level filters with ABAC policies.',
    example: `SELECT region, COUNT(*) AS purchase_events
FROM web_events
WHERE event_type = 'purchase'
GROUP BY region
ORDER BY purchase_events DESC;`,
    caption: 'RUNNABLE SQLITE VERSION · GOVERNED DATA PREVIEW',
    after: 'The local SQLite runner has no identities, catalogs, grants, or row-level security. The snippets below are Databricks administration examples and must be run by an authorized Unity Catalog owner or administrator.',
    tip: 'Grant USE CATALOG and USE SCHEMA along with the object privilege. Filters and masks add restrictions; they do not replace the grant needed to access an object.',
    glanceLabel: 'Explore a governed-data slice',
    glanceExplanation: 'This query is runnable locally to practice the report shape. In a Unity Catalog workspace, privileges and policies determine which rows and column values each user receives.',
    functionGroups: [{ name: 'Unity Catalog controls', items: [
      ['GRANT · object privileges', 'Allow a group to resolve a catalog and schema and read a specific table.', `GRANT USE CATALOG ON CATALOG main TO analysts;
GRANT USE SCHEMA ON SCHEMA main.sales TO analysts;
GRANT SELECT ON TABLE main.sales.orders TO analysts;`, `SELECT 'Grant examples are administrative statements; use the local report query above to practice SELECT.' AS note;`],
      ['SET ROW FILTER', 'Attach a registered SQL function that returns whether each row is visible to the querying user.', `ALTER TABLE main.sales.orders
SET ROW FILTER main.security.region_filter ON (region);`, `SELECT id AS customer_id, city AS region FROM customers WHERE city = 'Austin';`],
      ['SET MASK', 'Attach a registered SQL function that returns a protected or original column value.', `ALTER TABLE main.crm.customers
ALTER COLUMN email SET MASK main.security.mask_email;`, `SELECT name, substr(email, 1, 2) || '***' AS masked_email FROM customers;`],
      ['ABAC policy', 'Use governed tags and centralized policies when consistent rules must cover many catalog objects.', `-- Review governed tags and policy conditions before applying an ABAC policy.
-- ABAC policies are managed Unity Catalog securables, not SELECT hints.`, `SELECT 'Local SQLite cannot enforce catalog identity or row/column policies.' AS note;`],
    ] }],
  },
  {
    group, title: 'SQL UDFs & reusable logic', time: '16 MIN', level: 'ADVANCED',
    intro: 'Package stable business logic as a SQL function, and choose a Python UDF only when its flexibility justifies the extra runtime and maintenance costs.',
    task: 'Calculate each product’s net price after a 10% discount using an inline SQL expression.',
    hint: 'A SQL UDF is usually easiest for deterministic expressions that can be expressed with built-in SQL functions.',
    query: `SELECT id AS product_id, name AS product_name, price,
       ROUND(price * (1 - 0.10), 2) AS net_price
FROM products
ORDER BY id;`,
    heading: 'Reuse a rule without hiding how it works',
    copy: 'A SQL UDF gives a named interface to reusable relational logic. Unity Catalog functions can be shared within a governed catalog and schema subject to EXECUTE and usage privileges. Python UDFs support code that SQL cannot express, but can add serialization, runtime, and dependency costs; keep the function deterministic and small where possible.',
    example: `SELECT id AS product_id, name AS product_name, price,
       ROUND(price * (1 - 0.05), 2) AS net_price_after_5pct
FROM products
ORDER BY id;`,
    caption: 'RUNNABLE SQLITE VERSION · INLINE EXPRESSION',
    after: 'The local SQLite engine cannot create Unity Catalog SQL or Python functions. Use the inline expression here to verify the calculation; register the function in Databricks before calling its catalog-qualified name.',
    tip: 'Prefer a SQL UDF for SQL-friendly transformations. Use Python only when needed, and review permissions, determinism, dependencies, and execution behavior before publishing it.',
    glanceLabel: 'Calculate reusable net price',
    glanceExplanation: 'The local query shows the function body inline. The Databricks snippets define reusable catalog functions for the same calculation.',
    functionGroups: [{ name: 'Databricks SQL and Python UDFs', items: [
      ['LANGUAGE SQL', 'Define a portable scalar calculation with a clear input and return type.', `CREATE OR REPLACE FUNCTION main.analytics.net_price(price DOUBLE, discount_rate DOUBLE)
RETURNS DOUBLE
LANGUAGE SQL
RETURN price * (1 - discount_rate);`, `SELECT id AS product_id, price * (1 - 0.10) AS net_price FROM products ORDER BY id;`],
      ['LANGUAGE PYTHON', 'Use a Python body for logic that is impractical in SQL, and declare its return type.', `CREATE OR REPLACE FUNCTION main.analytics.normalize_code(code STRING)
RETURNS STRING
LANGUAGE PYTHON
AS $$
return code.strip().upper() if code is not None else None
$$;`, `SELECT UPPER(TRIM(category)) AS normalized_category FROM products;`],
      ['Call a catalog function', 'Qualify the function name when the current catalog or schema is not already selected.', `SELECT product_id,
       main.analytics.net_price(price, 0.10) AS net_price
FROM main.sales.products;`, `SELECT id AS product_id, ROUND(price * (1 - 0.10), 2) AS net_price FROM products;`],
      ['EXECUTE and USAGE', 'Callers need EXECUTE on the function and USAGE on its parent schema and catalog.', `GRANT EXECUTE ON FUNCTION main.analytics.net_price TO analysts;`, `SELECT 'Function permissions are managed in Unity Catalog; the arithmetic query above runs locally.' AS note;`],
    ] }],
  },
];
