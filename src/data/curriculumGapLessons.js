export const curriculumGapLessons = [
  {
    group: 'FOUNDATIONS', title: 'Data types, CAST & safe conversion', time: '12 MIN', level: 'BUILDING',
    intro: 'Understand what values represent, convert them deliberately, and spot the difference between a failed conversion and a missing value.',
    task: 'Show each product price with its SQLite storage class and a two-decimal display value.',
    hint: 'Use typeof(price) to inspect SQLite storage and ROUND(price, 2) to display the value.',
    query: `SELECT name, price, typeof(price) AS storage_class,
       ROUND(price, 2) AS display_price
FROM products;`,
    heading: 'Choose a type that matches the value',
    copy: 'A data type describes the values a column can hold and how SQL interprets them. Databricks has types such as BIGINT, DECIMAL, STRING, DATE, TIMESTAMP, ARRAY, MAP, and STRUCT. CAST requests an explicit conversion; TRY_CAST returns NULL for invalid input or overflow. SQLite is more permissive and associates types with values, so typeof() reports storage class rather than a strict column type.',
    example: `SELECT CAST('42.75' AS REAL) AS converted_number,
       date('2025-03-08') AS parsed_date,
       datetime('2025-03-08 14:25:00') AS parsed_timestamp;`,
    caption: 'RUNNABLE SQLITE VERSION · CONVERT VALUE SHAPES',
    after: 'Use DECIMAL(p,s) for exact decimal quantities such as money in Databricks. Floating point types approximate some decimal fractions. Avoid relying on implicit conversions: they can vary by type and ANSI settings, and malformed input can stop a query.',
    tip: 'TRY_CAST is useful for exploring dirty data, but count and inspect the NULL results so invalid values do not disappear silently.',
    guideTitle: 'TYPES AND CONVERSION PRACTICE', guideNote: 'INSPECT · CAST · VALIDATE',
    functionGroups: [{ name: 'Convert deliberately', items: [
      ['CAST', 'Convert a known compatible value to a requested type. Databricks CAST raises an error for invalid input.', `SELECT CAST('42.75' AS DECIMAL(8,2)) AS amount;`, `SELECT CAST('42.75' AS REAL) AS amount;`],
      ['TRY_CAST', 'Try a conversion without stopping the query when one row is malformed; invalid values become NULL.', `WITH raw_values AS (SELECT * FROM VALUES ('42'), ('oops') AS v(raw_value))
SELECT raw_value, TRY_CAST(raw_value AS INT) AS parsed_value
FROM raw_values;`, `WITH raw_values(raw_value) AS (VALUES ('42'), ('oops'))
SELECT raw_value,
       CASE WHEN raw_value <> '' AND raw_value NOT GLOB '*[^0-9]*'
            THEN CAST(raw_value AS INTEGER) END AS parsed_value
FROM raw_values;`],
      ['DECIMAL precision and scale', 'DECIMAL(8,2) allows up to eight total digits, two after the decimal point. SQLite has no fixed-precision decimal storage class.', `SELECT CAST(1234.5 AS DECIMAL(8,2)) AS exact_amount;`, `SELECT ROUND(CAST('1234.5' AS REAL), 2) AS display_amount;`],
      ['DATE and TIMESTAMP', 'Parse date/time values before comparing or grouping them; be explicit about time zones when timestamps represent instants.', `SELECT TO_DATE('2025-03-08') AS event_date,
       TO_TIMESTAMP('2025-03-08 14:25:00') AS event_time;`, `SELECT date('2025-03-08') AS event_date,
       datetime('2025-03-08 14:25:00') AS event_time;`],
    ]}],
  },
  {
    group: 'ADVANCED PRACTICE', title: 'ROLLUP, CUBE & GROUPING SETS', time: '16 MIN', level: 'ADVANCING',
    intro: 'Produce detail rows, subtotals, and grand totals in one report, and distinguish a subtotal NULL from a real missing value.',
    task: 'Count web events by region and event type, with each region subtotal and one grand total.',
    hint: 'The local version combines three grouped queries with UNION ALL: detail, region subtotal, and grand total.',
    query: `SELECT region, event_type, COUNT(*) AS event_count, 'DETAIL' AS grouping_level
FROM web_events
GROUP BY region, event_type
UNION ALL
SELECT region, NULL, COUNT(*), 'REGION TOTAL'
FROM web_events
GROUP BY region
UNION ALL
SELECT NULL, NULL, COUNT(*), 'GRAND TOTAL'
FROM web_events
ORDER BY grouping_level, region, event_type;`,
    heading: 'Ask for multiple grouping levels at once',
    copy: 'GROUPING SETS specifies exactly which combinations to aggregate. ROLLUP produces a hierarchy of subtotals plus a grand total. CUBE produces every combination of the listed dimensions. GROUPING and GROUPING_ID identify subtotal rows where a dimension is omitted; that matters when the source data itself contains NULL.',
    example: `SELECT region, event_type,
       GROUPING_ID(region, event_type) AS grouping_id,
       COUNT(*) AS event_count
FROM main.analytics.web_events
GROUP BY GROUPING SETS ((region, event_type), (region), ())
ORDER BY grouping_id, region, event_type;`,
    caption: 'DATABRICKS SQL · DETAIL, SUBTOTAL, GRAND TOTAL',
    after: 'SQLite has no GROUPING SETS, ROLLUP, CUBE, GROUPING, or GROUPING_ID syntax. The task query shows the equivalent UNION ALL pattern. Each leg must return the same columns and types; label the level so NULL subtotal placeholders are clear.',
    tip: 'A CUBE over n dimensions creates 2ⁿ grouping combinations. Start with a small number of dimensions to avoid a very wide report.',
    guideTitle: 'MULTI-LEVEL AGGREGATION PRACTICE', guideNote: 'DATABRICKS + SQLITE',
    functionGroups: [{ name: 'Choose the subtotal shape', items: [
      ['GROUPING SETS', 'Choose the detail and subtotal combinations explicitly; an empty set () creates a grand total.', `SELECT region, event_type, COUNT(*) AS event_count,
       GROUPING_ID(region, event_type) AS grouping_id
FROM main.analytics.web_events
GROUP BY GROUPING SETS ((region, event_type), (region), ())
ORDER BY grouping_id, region, event_type;`, `SELECT region, event_type, COUNT(*) AS event_count, 'DETAIL' AS grouping_level
FROM web_events GROUP BY region, event_type
UNION ALL
SELECT region, NULL, COUNT(*), 'REGION TOTAL' FROM web_events GROUP BY region
UNION ALL
SELECT NULL, NULL, COUNT(*), 'GRAND TOTAL' FROM web_events;`],
      ['ROLLUP', 'Build hierarchical subtotals in the order you list dimensions, followed by a grand total.', `SELECT region, event_type, COUNT(*) AS event_count,
       GROUPING(region) AS region_is_subtotal,
       GROUPING(event_type) AS event_type_is_subtotal
FROM main.analytics.web_events
GROUP BY ROLLUP(region, event_type);`, `SELECT region, event_type, COUNT(*) AS event_count, 'DETAIL' AS grouping_level
FROM web_events GROUP BY region, event_type
UNION ALL SELECT region, NULL, COUNT(*), 'REGION TOTAL' FROM web_events GROUP BY region
UNION ALL SELECT NULL, NULL, COUNT(*), 'GRAND TOTAL' FROM web_events;`],
      ['CUBE', 'Calculate every combination of the listed dimensions, including each dimension’s subtotal and the grand total.', `SELECT region, event_type, COUNT(*) AS event_count,
       GROUPING_ID(region, event_type) AS grouping_id
FROM main.analytics.web_events
GROUP BY CUBE(region, event_type);`, `SELECT region, event_type, COUNT(*) AS event_count, 'DETAIL' AS grouping_level
FROM web_events GROUP BY region, event_type
UNION ALL SELECT region, NULL, COUNT(*), 'REGION TOTAL' FROM web_events GROUP BY region
UNION ALL SELECT NULL, event_type, COUNT(*), 'EVENT TYPE TOTAL' FROM web_events GROUP BY event_type
UNION ALL SELECT NULL, NULL, COUNT(*), 'GRAND TOTAL' FROM web_events;`],
    ]}],
  },
  {
    group: 'DATABRICKS SQL', title: 'QUALIFY window results', time: '10 MIN', level: 'ADVANCING',
    intro: 'Filter ranked or otherwise windowed rows after calculating the window value, without wrapping the query in another CTE.',
    task: 'Return each customer’s two most recent orders, with a rank within that customer.',
    hint: 'Use ROW_NUMBER partitioned by customer and ordered by date and id descending. Keep ranks 1 and 2.',
    query: `WITH ranked_orders AS (
  SELECT customer_id, id AS order_id, order_date, total,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, id DESC) AS order_rank
  FROM orders
)
SELECT customer_id, order_id, order_date, total, order_rank
FROM ranked_orders
WHERE order_rank <= 2
ORDER BY customer_id, order_rank;`,
    heading: 'Filter after the window calculation',
    copy: 'WHERE filters input rows before window functions are calculated, so it cannot filter on a window alias. QUALIFY filters after window functions and can keep the query in one SELECT. It is supported by Databricks SQL and Databricks Runtime 10.4 LTS and above; a CTE or subquery is the portable alternative.',
    example: `SELECT customer_id, id AS order_id, order_date, total,
       ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, id DESC) AS order_rank
FROM main.analytics.orders
QUALIFY order_rank <= 2
ORDER BY customer_id, order_rank;`,
    caption: 'DATABRICKS SQL · FILTER THE WINDOW OUTPUT',
    after: 'Use QUALIFY only when a window result is the filter. Keep ordinary row filters in WHERE so they reduce the input before window calculations. SQLite examples use a CTE because SQLite does not support QUALIFY.',
    tip: 'Add a stable tie-breaker such as id to the window ORDER BY when exactly one ordering is needed for tied dates.',
    guideTitle: 'WINDOW FILTER PRACTICE', guideNote: 'QUALIFY VS CTE',
    functionGroups: [{ name: 'Keep the window logic readable', items: [
      ['QUALIFY with ROW_NUMBER', 'Keep only the most recent order per customer. The window alias can be referenced in QUALIFY.', `SELECT customer_id, id AS order_id, order_date,
       ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, id DESC) AS rn
FROM main.analytics.orders
QUALIFY rn = 1
ORDER BY customer_id;`, `WITH ranked AS (
  SELECT customer_id, id AS order_id, order_date,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, id DESC) AS rn
  FROM orders
)
SELECT customer_id, order_id, order_date, rn
FROM ranked WHERE rn = 1 ORDER BY customer_id;`],
      ['QUALIFY with a rank range', 'Return the top two rows in each customer partition. Ties are resolved by the order id.', `SELECT customer_id, id AS order_id, total,
       ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id DESC) AS rn
FROM main.analytics.orders
QUALIFY rn <= 2;`, `WITH ranked AS (
  SELECT customer_id, id AS order_id, total,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id DESC) AS rn
  FROM orders
)
SELECT customer_id, order_id, total, rn FROM ranked WHERE rn <= 2;`],
    ]}],
  },
  {
    group: 'DATABRICKS SQL', title: 'Create and manage schemas', time: '12 MIN', level: 'ADVANCED',
    intro: 'Create a safe workspace for related tables and views, set the current catalog and schema, and understand what a namespace change affects.',
    task: 'List the database names visible to the local SQLite runner.',
    hint: 'Use SQLite’s database_list pragma; Databricks uses catalogs and schemas instead.',
    query: `PRAGMA database_list;`,
    heading: 'Organize tables inside a namespace',
    copy: 'In Unity Catalog, the object path is catalog.schema.table. CREATE SCHEMA creates a namespace inside a catalog; USE CATALOG and USE SCHEMA set the current context for unqualified names. A schema groups tables, views, functions, and other objects. SQLite has attached databases called main and temp, not the same three-level catalog structure.',
    example: `SELECT name AS database_name
FROM pragma_database_list
ORDER BY name;`,
    caption: 'RUNNABLE SQLITE VERSION · LIST ATTACHED DATABASES',
    after: 'Creating or dropping a Databricks schema changes workspace metadata and needs catalog privileges. The local lesson only queries SQLite metadata; it cannot create a Unity Catalog catalog or schema.',
    tip: 'Qualify important production objects with catalog.schema.table so a session’s current schema cannot silently change which object a query uses.',
    guideTitle: 'NAMESPACE PRACTICE', guideNote: 'CREATE · USE · INSPECT',
    functionGroups: [{ name: 'Databricks schema commands', items: [
      ['CREATE SCHEMA', 'Create a clearly named namespace in a catalog. Use IF NOT EXISTS for repeatable setup scripts.', `CREATE SCHEMA IF NOT EXISTS main.learning_sandbox
COMMENT 'Temporary schema for SQL practice';`, `SELECT 'SQLite has no CREATE SCHEMA equivalent; attached databases are listed with PRAGMA database_list.' AS note;`],
      ['USE CATALOG and USE SCHEMA', 'Set the context used to resolve unqualified names. Changing catalog resets the current schema to default.', `USE CATALOG main;
USE SCHEMA learning_sandbox;`, `SELECT name AS attached_database FROM pragma_database_list ORDER BY name;`],
      ['CREATE TABLE in a schema', 'Create a table using a fully qualified name so its destination is explicit.', `CREATE TABLE IF NOT EXISTS main.learning_sandbox.practice_events (
  event_id BIGINT,
  event_date DATE,
  amount DECIMAL(12,2)
);`, `SELECT name AS table_name FROM sqlite_master WHERE type = 'table' ORDER BY name;`],
    ]}],
  },
  {
    group: 'DATABRICKS DEEP DIVES', title: 'Databricks SQL scripting & procedures', time: '17 MIN', level: 'ADVANCED',
    intro: 'Package several SQL statements into a controlled script with variables and branches, then learn when a reusable stored procedure is appropriate.',
    task: 'Use a local SQL expression to classify each product as low-stock or available.',
    hint: 'Use CASE against stock; SQL scripting adds variables and control flow around statements in Databricks.',
    query: `SELECT name, stock,
       CASE WHEN stock < 5 THEN 'LOW STOCK' ELSE 'AVAILABLE' END AS inventory_state
FROM products
ORDER BY id;`,
    heading: 'Use procedural SQL only when a query is not enough',
    copy: 'Databricks SQL scripting uses BEGIN ... END blocks with local variables, assignments, IF/ELSE branches, loops, and SQL statements. SQL scripts are supported in Databricks SQL and Databricks Runtime 16.3 and above. Stored procedures persist scripts in Unity Catalog and are supported in version 17.0 and above. Use ordinary set-based queries for transformations; use a procedure when a caller needs a reusable multi-step action.',
    example: `BEGIN
  DECLARE min_stock INT DEFAULT 5;
  IF min_stock > 0 THEN
    SELECT name, stock FROM main.sales.products WHERE stock < min_stock;
  ELSE
    SELECT 'No threshold configured' AS message;
  END IF;
END;`,
    caption: 'DATABRICKS SQL SCRIPT · VARIABLE + BRANCH',
    after: 'The local editor runs SQLite statements, not Databricks SQL scripts or stored procedures. Use the runnable CASE query to practice the business rule; the Databricks snippets show orchestration syntax to run in a supported workspace.',
    tip: 'A non-atomic BEGIN ... END script does not automatically roll back earlier successful statements if a later one fails. Choose transaction or ATOMIC behavior deliberately.',
    guideTitle: 'SCRIPTING PRACTICE', guideNote: 'VARIABLES · BRANCHES · PROCEDURES',
    functionGroups: [{ name: 'Build reusable multi-step logic', items: [
      ['BEGIN ... END and DECLARE', 'Declare local variables before the script body, then use the value in one or more SQL statements.', `BEGIN
  DECLARE min_stock INT DEFAULT 5;
  SELECT name, stock FROM main.sales.products WHERE stock < min_stock;
END;`, `SELECT name, stock FROM products WHERE stock < 5 ORDER BY id;`],
      ['IF / ELSE', 'Branch on a scalar condition and return a query result for the chosen path.', `BEGIN
  DECLARE region_filter STRING DEFAULT 'west';
  IF region_filter = 'west' THEN
    SELECT event_id, region FROM main.analytics.web_events WHERE region = 'west' LIMIT 10;
  ELSE
    SELECT event_id, region FROM main.analytics.web_events LIMIT 10;
  END IF;
END;`, `SELECT event_id, region FROM web_events WHERE region = 'west' ORDER BY event_id LIMIT 10;`],
      ['CREATE PROCEDURE and CALL', 'Persist the SQL script in Unity Catalog for reuse. Procedure creation requires appropriate namespace privileges.', `CREATE OR REPLACE PROCEDURE main.analytics.low_stock_items(IN stock_limit INT)
LANGUAGE SQL
SQL SECURITY INVOKER
AS BEGIN
  SELECT id, name, stock FROM main.sales.products WHERE stock < stock_limit;
END;

CALL main.analytics.low_stock_items(5);`, `SELECT id, name, stock FROM products WHERE stock < 5 ORDER BY id;`],
    ]}],
  },
];
