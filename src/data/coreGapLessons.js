export const coreGapLessons = [
  {
    group: 'FOUNDATIONS', title: 'LIKE, lists, ranges & NULLs', time: '12 MIN', level: 'STARTER',
    intro: 'Move beyond exact matches. Search text patterns, test lists and ranges, and handle missing values without accidentally losing rows.',
    task: 'Find products whose name contains “a” and whose price is between 15 and 50, inclusive. Show the name, category, and price.',
    hint: "Use LIKE '%a%' for the text pattern and BETWEEN 15 AND 50 for the inclusive range.",
    query: `SELECT name, category, price
FROM products
WHERE name LIKE '%a%'
  AND price BETWEEN 15 AND 50;`,
    heading: 'Choose a condition that matches the question',
    copy: 'LIKE searches text with patterns: % means any sequence, including no characters, and _ means exactly one character. IN checks a set of exact values; BETWEEN checks an inclusive range. NULL means a value is unknown or missing, so ordinary comparisons with NULL do not return TRUE or FALSE.',
    example: `SELECT name, price
FROM products
WHERE name NOT LIKE 'S%'
  AND price NOT BETWEEN 20 AND 40;`,
    caption: 'EXCLUDE A PREFIX AND A PRICE RANGE',
    after: 'Use IS NULL or IS NOT NULL to test missing values. Avoid NOT IN when its list can contain NULL: the unknown comparison can filter out every candidate row. Prefer NOT EXISTS for nullable subquery results.',
    tip: 'Text matching can be case-sensitive or case-insensitive depending on the engine and collation. This local SQLite example uses its default LIKE behavior.',
    guideTitle: 'FILTER PRACTICE', guideNote: 'PATTERNS · SETS · NULLS',
    functionGroups: [
      { name: 'Text patterns', items: [
        ['Contains text · %', 'The percent wildcard matches any number of characters before or after the text.', `SELECT name FROM products WHERE name LIKE '%SQL%';`, `SELECT name FROM products WHERE name LIKE '%SQL%';`],
        ['One character · _', 'The underscore wildcard matches exactly one character at that position.', `SELECT name FROM products WHERE name LIKE 'C_nvas%';`, `SELECT name FROM products WHERE name LIKE 'C_nvas%';`],
        ['Exclude a pattern · NOT LIKE', 'NOT LIKE removes values matching the pattern. Rows with NULL names still evaluate as unknown and are filtered out.', `SELECT name FROM products WHERE name NOT LIKE 'S%';`, `SELECT name FROM products WHERE name NOT LIKE 'S%';`],
      ]},
      { name: 'Lists and inclusive ranges', items: [
        ['IN / NOT IN', 'IN matches any listed value. NOT IN excludes listed values; do not put NULL in the list unless you intend SQL’s unknown behavior.', `SELECT name, category FROM products WHERE category IN ('Home', 'Books');`, `SELECT name, category FROM products WHERE category IN ('Home', 'Books');`],
        ['BETWEEN / NOT BETWEEN', 'BETWEEN includes both endpoints. NOT BETWEEN means below the lower endpoint or above the upper endpoint.', `SELECT name, price FROM products WHERE price BETWEEN 20 AND 40;`, `SELECT name, price FROM products WHERE price BETWEEN 20 AND 40;`],
      ]},
      { name: 'NULL is unknown', items: [
        ['IS NULL', 'Use IS NULL to find missing values. `value = NULL` does not work because the comparison result is unknown.', `WITH sample(value) AS (VALUES (1), (NULL), (3))
SELECT value, value = 1 AS equals_one, value <> 1 AS not_one, value IS NULL AS is_missing
FROM sample;`, `WITH sample(value) AS (VALUES (1), (NULL), (3))
SELECT value, value = 1 AS equals_one, value <> 1 AS not_one, value IS NULL AS is_missing
FROM sample;`],
        ['NOT IN and NULL', 'If a NOT IN list contains NULL, a non-matching value can still produce unknown. Use NOT EXISTS for a safer anti-match.', `WITH values_to_check(value) AS (VALUES (1), (2), (3)), blocked(value) AS (VALUES (2), (NULL))
SELECT value FROM values_to_check AS v
WHERE NOT EXISTS (SELECT 1 FROM blocked AS b WHERE b.value = v.value);`, `WITH values_to_check(value) AS (VALUES (1), (2), (3)), blocked(value) AS (VALUES (2), (NULL))
SELECT value FROM values_to_check AS v
WHERE NOT EXISTS (SELECT 1 FROM blocked AS b WHERE b.value = v.value);`],
      ]},
    ],
  },
  {
    group: 'WORK WITH DATA', title: 'SELECT DISTINCT & duplicate rows', time: '8 MIN', level: 'BUILDING',
    intro: 'Use DISTINCT when you need unique result rows, and learn why duplicate-looking rows can still represent different records.',
    task: 'List each product category once, in alphabetical order.',
    hint: 'Place DISTINCT immediately after SELECT, then order by the category.',
    query: `SELECT DISTINCT category
FROM products
ORDER BY category;`,
    heading: 'Ask for unique values when that is the goal',
    copy: 'SELECT normally returns one output row for every matching input row. DISTINCT removes duplicate output rows after the selected expressions are evaluated. It applies to the whole selected row, not just one field hidden inside the list.',
    example: `SELECT DISTINCT city
FROM customers
ORDER BY city;`,
    caption: 'UNIQUE CUSTOMER CITIES',
    after: 'DISTINCT can hide data-quality problems if you use it to patch a join that multiplied rows. First check the join keys and row grain; remove duplicates only when the question asks for unique results.',
    tip: 'SELECT DISTINCT category, price returns unique category-and-price pairs, not one row per category.',
    functionGroups: [{ name: 'See what DISTINCT changes', items: [
      ['Unique categories', 'Without DISTINCT, a category repeats once for each product in that category.', `SELECT category FROM products ORDER BY category, name;`, `SELECT category FROM products ORDER BY category, name;`],
      ['Unique category values', 'DISTINCT collapses identical selected values into one result row.', `SELECT DISTINCT category FROM products ORDER BY category;`, `SELECT DISTINCT category FROM products ORDER BY category;`],
      ['Unique pairs', 'Adding a second selected column changes the unit of uniqueness to the pair.', `SELECT DISTINCT category, price FROM products ORDER BY category, price;`, `SELECT DISTINCT category, price FROM products ORDER BY category, price;`],
    ]}],
  },
  {
    group: 'WORK WITH DATA', title: 'HAVING & group filters', time: '10 MIN', level: 'BUILDING',
    intro: 'Use WHERE to filter source rows before grouping, and HAVING to filter the groups after aggregate values are calculated.',
    task: 'Show cities with at least two customers and return each city’s customer count.',
    hint: 'Group by city, count rows, then filter groups with HAVING COUNT(*) >= 2.',
    query: `SELECT city, COUNT(*) AS customer_count
FROM customers
GROUP BY city
HAVING COUNT(*) >= 2
ORDER BY customer_count DESC, city;`,
    heading: 'Filter rows before grouping and groups after',
    copy: 'WHERE is evaluated on individual input rows, so it cannot filter on an aggregate such as COUNT(*). HAVING is evaluated after GROUP BY and can keep or remove whole groups using aggregate results.',
    example: `SELECT status, COUNT(*) AS order_count, SUM(total) AS revenue
FROM orders
WHERE order_date >= '2024-02-01'
GROUP BY status
HAVING SUM(total) > 50
ORDER BY revenue DESC;`,
    caption: 'WHERE FIRST, HAVING AFTER GROUP BY',
    after: 'A useful mental order is FROM and WHERE, then GROUP BY and aggregates, then HAVING, then ORDER BY. Put row-level conditions in WHERE when possible so fewer rows need aggregation.',
    tip: 'The aggregate expression in HAVING can be repeated directly; many engines also let you order by its SELECT alias.',
    functionGroups: [{ name: 'Compare the two filters', items: [
      ['WHERE filters rows', 'Only orders from February onward enter the groups.', `SELECT status, COUNT(*) AS order_count FROM orders WHERE order_date >= '2024-02-01' GROUP BY status ORDER BY status;`, `SELECT status, COUNT(*) AS order_count FROM orders WHERE order_date >= '2024-02-01' GROUP BY status ORDER BY status;`],
      ['HAVING filters groups', 'Only statuses whose group total passes the aggregate condition remain.', `SELECT status, SUM(total) AS revenue FROM orders GROUP BY status HAVING SUM(total) >= 80 ORDER BY revenue DESC;`, `SELECT status, SUM(total) AS revenue FROM orders GROUP BY status HAVING SUM(total) >= 80 ORDER BY revenue DESC;`],
      ['Use both', 'Reduce source rows with WHERE, then keep qualifying groups with HAVING.', `SELECT customer_id, COUNT(*) AS orders, SUM(total) AS spend
FROM orders
WHERE order_date >= '2024-02-01'
GROUP BY customer_id
HAVING COUNT(*) >= 1
ORDER BY spend DESC;`, `SELECT customer_id, COUNT(*) AS orders, SUM(total) AS spend
FROM orders
WHERE order_date >= '2024-02-01'
GROUP BY customer_id
HAVING COUNT(*) >= 1
ORDER BY spend DESC;`],
    ]}],
  },
  {
    group: 'WORK WITH DATA', title: 'INSERT, UPDATE & DELETE safely', time: '15 MIN', level: 'BUILDING',
    intro: 'Learn the three everyday row changes. Practice each inside a transaction and roll it back so the shared sample database stays unchanged.',
    task: 'Raise product 1’s price by 5%, inspect the changed row, then roll the change back.',
    hint: 'BEGIN a transaction, UPDATE only id = 1, SELECT that row to verify it, then ROLLBACK.',
    query: `BEGIN;
UPDATE products SET price = ROUND(price * 1.05, 2) WHERE id = 1;
SELECT id, name, price FROM products WHERE id = 1;
ROLLBACK;`,
    heading: 'Change only the rows you mean to change',
    copy: 'INSERT adds rows, UPDATE changes rows that match its WHERE clause, and DELETE removes rows that match its WHERE clause. A missing or overly broad WHERE condition can affect more rows than intended. A transaction lets you inspect a change and undo it before committing.',
    example: `BEGIN;
INSERT INTO products (id, name, category, price, stock)
VALUES (99, 'Practice item', 'Practice', 12.50, 4);
SELECT id, name, price FROM products WHERE id = 99;
ROLLBACK;`,
    caption: 'INSERT, INSPECT, ROLLBACK',
    after: 'These examples use SQLite transactions and roll back. Databricks Delta supports INSERT, UPDATE, and DELETE on supported tables, but its transaction model and table capabilities differ from SQLite.',
    tip: 'Before UPDATE or DELETE, run the same WHERE condition as a SELECT and inspect the rows it matches.',
    functionGroups: [{ name: 'A safe row-change workflow', items: [
      ['INSERT INTO', 'Name the target columns and provide one value for each. The transaction is rolled back after inspection.', `BEGIN;
INSERT INTO products (id, name, category, price, stock) VALUES (99, 'Practice item', 'Practice', 12.50, 4);
SELECT * FROM products WHERE id = 99;
ROLLBACK;`, `BEGIN;
INSERT INTO products (id, name, category, price, stock) VALUES (99, 'Practice item', 'Practice', 12.50, 4);
SELECT * FROM products WHERE id = 99;
ROLLBACK;`],
      ['UPDATE ... WHERE', 'Change only the rows selected by the predicate. Inspect the result before rolling back.', `BEGIN;
UPDATE products SET stock = stock + 1 WHERE id = 2;
SELECT id, name, stock FROM products WHERE id = 2;
ROLLBACK;`, `BEGIN;
UPDATE products SET stock = stock + 1 WHERE id = 2;
SELECT id, name, stock FROM products WHERE id = 2;
ROLLBACK;`],
      ['DELETE ... WHERE', 'Remove matching rows. Start with SELECT using the same predicate, then roll back the practice deletion.', `BEGIN;
DELETE FROM products WHERE id = 6;
SELECT id, name FROM products WHERE id = 6;
ROLLBACK;`, `BEGIN;
DELETE FROM products WHERE id = 6;
SELECT id, name FROM products WHERE id = 6;
ROLLBACK;`],
    ]}],
  },
  {
    group: 'WORK WITH DATA', title: 'CREATE, ALTER, DROP & views', time: '16 MIN', level: 'BUILDING',
    intro: 'Create tables from a schema or query, make controlled schema changes, and distinguish a view from a stored table.',
    task: 'Create a temporary view of in-stock products, query its rows, and remove the view afterward.',
    hint: 'Use CREATE TEMP VIEW with a SELECT, query the view, then DROP VIEW when finished.',
    query: `DROP VIEW IF EXISTS practice_in_stock;
CREATE TEMP VIEW practice_in_stock AS
SELECT id, name, stock FROM products WHERE stock > 0;
SELECT id, name, stock FROM practice_in_stock ORDER BY id;
DROP VIEW practice_in_stock;`,
    heading: 'Separate a table’s structure from the rows it stores',
    copy: 'CREATE TABLE defines a stored table. CTAS creates a table from a query result. ALTER TABLE changes a schema or table properties. DROP removes an object. A view stores a query definition and returns rows from its underlying tables when queried.',
    example: `DROP TABLE IF EXISTS practice_products;
CREATE TEMP TABLE practice_products AS
SELECT id, name, price FROM products WHERE stock > 0;
SELECT * FROM practice_products ORDER BY id;
DROP TABLE practice_products;`,
    caption: 'CTAS · CREATE TABLE AS SELECT',
    after: 'The local examples use temporary objects and remove them. Databricks supports managed and external tables, Delta table properties, and Unity Catalog namespaces; choose the correct catalog and schema before creating persistent objects.',
    tip: 'Prefer CREATE OR REPLACE or an explicit migration plan when changing a production object. Check dependencies before DROP.',
    functionGroups: [{ name: 'Table and view operations', items: [
      ['CREATE TABLE', 'Define columns and types before inserting rows. A temporary table is scoped to the current connection.', `BEGIN;
CREATE TEMP TABLE practice_table (id INTEGER, label TEXT);
INSERT INTO practice_table VALUES (1, 'one');
SELECT * FROM practice_table;
ROLLBACK;`, `BEGIN;
CREATE TEMP TABLE practice_table (id INTEGER, label TEXT);
INSERT INTO practice_table VALUES (1, 'one');
SELECT * FROM practice_table;
ROLLBACK;`],
      ['ALTER TABLE', 'Use ALTER TABLE for a deliberate schema change. This local example adds a column to a temporary table and rolls back.', `BEGIN;
CREATE TEMP TABLE practice_table (id INTEGER);
ALTER TABLE practice_table ADD COLUMN note TEXT;
SELECT name, type FROM pragma_table_info('practice_table');
ROLLBACK;`, `BEGIN;
CREATE TEMP TABLE practice_table (id INTEGER);
ALTER TABLE practice_table ADD COLUMN note TEXT;
SELECT name, type FROM pragma_table_info('practice_table');
ROLLBACK;`],
      ['CREATE VIEW', 'A view stores a SELECT definition, not a separate copy of its result rows.', `DROP VIEW IF EXISTS practice_view;
CREATE TEMP VIEW practice_view AS SELECT id, name FROM products WHERE stock > 0;
SELECT * FROM practice_view ORDER BY id;
DROP VIEW practice_view;`, `DROP VIEW IF EXISTS practice_view;
CREATE TEMP VIEW practice_view AS SELECT id, name FROM products WHERE stock > 0;
SELECT * FROM practice_view ORDER BY id;
DROP VIEW practice_view;`],
      ['CTAS and DROP', 'CTAS stores the result rows in a new table. DROP removes the temporary table after the example reads it.', `DROP TABLE IF EXISTS practice_copy;
CREATE TEMP TABLE practice_copy AS SELECT id, name FROM products WHERE stock > 0;
SELECT COUNT(*) AS copied_products FROM practice_copy;
DROP TABLE practice_copy;`, `DROP TABLE IF EXISTS practice_copy;
CREATE TEMP TABLE practice_copy AS SELECT id, name FROM products WHERE stock > 0;
SELECT COUNT(*) AS copied_products FROM practice_copy;
DROP TABLE practice_copy;`],
    ]}],
  },
];
