export const advancedLessons = [
  {
    group: "ADVANCED PRACTICE",
    title: "Set operations & multiset behavior",
    time: "15 MIN",
    level: "ADVANCING",
    intro: "Combine compatible result sets and reason about duplicate rows. Compare UNION ALL, UNION, INTERSECT, and EXCEPT, including Databricks ALL variants that preserve multiset counts.",
    task: "Count each city’s occurrences across two overlapping customer groups combined with UNION ALL.",
    hint: "Use two SELECT statements with the same number of columns. UNION ALL preserves repeats; UNION removes duplicate result rows.",
    query: `WITH early_customers AS (
  SELECT city FROM customers WHERE id <= 3
),
later_customers AS (
  SELECT city FROM customers WHERE id >= 3
)
SELECT city, COUNT(*) AS occurrences
FROM (
  SELECT city FROM early_customers
  UNION ALL
  SELECT city FROM later_customers
) AS combined
GROUP BY city
ORDER BY city;`,
    heading: "Combine rows without losing track of duplicates",
    copy: "A set operator stacks or compares complete query results. Each SELECT must return the same number of columns in the same order, with compatible types. UNION ALL keeps repeated rows; the default UNION, INTERSECT, and EXCEPT forms remove duplicate result rows. INTERSECT ALL keeps each row as many times as it occurs on both sides (the smaller count), while EXCEPT ALL subtracts the right-side count from the left-side count, never going below zero.",
    example: `SELECT city FROM customers WHERE id <= 3
UNION ALL
SELECT city FROM customers WHERE id >= 3;`,
    caption: "UNION ALL · KEEP EVERY OCCURRENCE",
    after: "Set operators compare whole rows, so a duplicate means every selected column matches. SQLite supports UNION ALL but not INTERSECT ALL or EXCEPT ALL; the local examples emulate those multiset rules by numbering duplicate occurrences. Databricks supports the ALL variants directly. Put ORDER BY and LIMIT after the final SELECT to sort or cap the combined result.",
    tip: "Start with UNION ALL when preserving source counts matters. Use INTERSECT ALL to keep the overlapping count and EXCEPT ALL to subtract counts; choose the default DISTINCT behavior only when deduplication is intended.",
    guideTitle: "SET OPERATORS AT A GLANCE",
    guideNote: "RUNNABLE EXAMPLES",
    functionGroups: [
      {
        name: "Combine and compare result sets",
        items: [
          ["UNION ALL", "Append both inputs and keep the Portland row twice.", `WITH a(city) AS (VALUES ('Portland'),('Austin')), b(city) AS (VALUES ('Portland'),('Chicago'))
SELECT city FROM a UNION ALL SELECT city FROM b ORDER BY city;`, `WITH a(city) AS (VALUES ('Portland'),('Austin')), b(city) AS (VALUES ('Portland'),('Chicago'))
SELECT city FROM a UNION ALL SELECT city FROM b ORDER BY city;`],
          ["UNION", "Append inputs, then remove duplicate complete rows.", `WITH a(city) AS (VALUES ('Portland'),('Austin')), b(city) AS (VALUES ('Portland'),('Chicago'))
SELECT city FROM a UNION SELECT city FROM b ORDER BY city;`, `WITH a(city) AS (VALUES ('Portland'),('Austin')), b(city) AS (VALUES ('Portland'),('Chicago'))
SELECT city FROM a UNION SELECT city FROM b ORDER BY city;`],
          ["INTERSECT", "Return only values present in both inputs.", `WITH a(city) AS (VALUES ('Portland'),('Austin')), b(city) AS (VALUES ('Portland'),('Chicago'))
SELECT city FROM a INTERSECT SELECT city FROM b;`, `WITH a(city) AS (VALUES ('Portland'),('Austin')), b(city) AS (VALUES ('Portland'),('Chicago'))
SELECT city FROM a INTERSECT SELECT city FROM b;`],
          ["EXCEPT", "Return values in the first input that are absent from the second.", `WITH a(city) AS (VALUES ('Portland'),('Austin')), b(city) AS (VALUES ('Portland'),('Chicago'))
SELECT city FROM a EXCEPT SELECT city FROM b;`, `WITH a(city) AS (VALUES ('Portland'),('Austin')), b(city) AS (VALUES ('Portland'),('Chicago'))
SELECT city FROM a EXCEPT SELECT city FROM b;`]
        ]
      },
      {
        name: "Keep or subtract duplicate counts",
        items: [
          ["INTERSECT ALL", "Keep matching values with the smaller of their two occurrence counts: North once and East twice. Databricks supports this directly.", `WITH a(city) AS (VALUES ('North'),('North'),('North'),('East'),('East')),
b(city) AS (VALUES ('North'),('East'),('East'),('East'))
SELECT city FROM a INTERSECT ALL SELECT city FROM b ORDER BY city;`, `WITH a(city) AS (VALUES ('North'),('North'),('North'),('East'),('East')),
b(city) AS (VALUES ('North'),('East'),('East'),('East')),
a_ranked AS (
  SELECT city, ROW_NUMBER() OVER (PARTITION BY city ORDER BY city) AS occurrence FROM a
),
b_ranked AS (
  SELECT city, ROW_NUMBER() OVER (PARTITION BY city ORDER BY city) AS occurrence FROM b
)
SELECT a.city
FROM a_ranked AS a
JOIN b_ranked AS b ON b.city = a.city AND b.occurrence = a.occurrence
ORDER BY a.city;`],
          ["EXCEPT ALL", "Subtract each right-side occurrence from the left-side count: North remains twice and East is removed entirely.", `WITH a(city) AS (VALUES ('North'),('North'),('North'),('East'),('East')),
b(city) AS (VALUES ('North'),('East'),('East'),('East'))
SELECT city FROM a EXCEPT ALL SELECT city FROM b ORDER BY city;`, `WITH a(city) AS (VALUES ('North'),('North'),('North'),('East'),('East')),
b(city) AS (VALUES ('North'),('East'),('East'),('East')),
a_ranked AS (
  SELECT city, ROW_NUMBER() OVER (PARTITION BY city ORDER BY city) AS occurrence FROM a
),
b_ranked AS (
  SELECT city, ROW_NUMBER() OVER (PARTITION BY city ORDER BY city) AS occurrence FROM b
)
SELECT a.city
FROM a_ranked AS a
LEFT JOIN b_ranked AS b ON b.city = a.city AND b.occurrence = a.occurrence
WHERE b.occurrence IS NULL
ORDER BY a.city;`]
        ]
      },
      {
        name: "Shape and order the final result",
        items: [
          ["Match columns by position", "Names do not align the columns; position and compatible types do.", `SELECT id AS record_id, name AS label FROM customers WHERE id <= 2
UNION ALL
SELECT id, name FROM products WHERE id <= 2;`, `SELECT id AS record_id, name AS label FROM customers WHERE id <= 2
UNION ALL
SELECT id, name FROM products WHERE id <= 2;`],
          ["Sort after combining", "Apply one final order to the combined rows.", `SELECT city FROM customers WHERE id <= 3
UNION
SELECT city FROM customers WHERE id >= 3
ORDER BY city DESC LIMIT 3;`, `SELECT city FROM customers WHERE id <= 3
UNION
SELECT city FROM customers WHERE id >= 3
ORDER BY city DESC LIMIT 3;`]
        ]
      }
    ]
  },
  {
    group: "ADVANCED PRACTICE",
    title: "LATERAL joins & table-valued functions",
    time: "17 MIN",
    level: "ADVANCING",
    intro: "A lateral source can use values from a row that came before it. This powers row expansion, correlated subqueries, and functions such as Databricks EXPLODE; the lesson also shows portable equivalents for the local SQLite runner.",
    task: "Expand each selected product into two labels: its category and its product name. Return one output row per label.",
    hint: "The portable version stacks two SELECTs with UNION ALL. In Databricks SQL, LATERAL VIEW EXPLODE can expand an array for each product row.",
    query: `SELECT name AS product, category AS label, 0 AS position
FROM products WHERE id <= 3
UNION ALL
SELECT name AS product, name AS label, 1 AS position
FROM products WHERE id <= 3
ORDER BY product, position;`,
    heading: "Let each input row produce related rows",
    copy: "A lateral subquery or table-valued function can refer to columns from the row on its left. For each product, EXPLODE can turn an array into multiple rows. SQLite’s local runner does not support Databricks LATERAL VIEW syntax, so the main exercise uses UNION ALL to produce the same row expansion.",
    example: `SELECT name AS product, category AS label, 0 AS position
FROM products WHERE id <= 3
UNION ALL
SELECT name AS product, name AS label, 1 AS position
FROM products WHERE id <= 3;`,
    caption: "ONE INPUT ROW → MULTIPLE OUTPUT ROWS",
    after: "Use LATERAL when a derived table needs the current row. Use a table-valued function when one value, such as an array or JSON document, should become rows. Databricks commonly pairs LATERAL VIEW with EXPLODE or POSEXPLODE.",
    tip: "Watch the output grain: expanding an array changes one product row into one row per element. Aggregate only after deciding whether that expansion is intended.",
    guideTitle: "LATERAL & ROW EXPANSION AT A GLANCE",
    guideNote: "DATABRICKS + SQLITE",
    functionGroups: [
      {
        name: "Expand arrays into rows",
        items: [
          ["LATERAL VIEW EXPLODE", "Create one output row per tag for each product.", `WITH selected_products AS (SELECT * FROM products WHERE id <= 3)
SELECT p.name, tag
FROM selected_products AS p
LATERAL VIEW EXPLODE(ARRAY(p.category, p.name)) expanded AS tag;`, `SELECT name, category AS tag FROM products WHERE id <= 3
UNION ALL
SELECT name, name AS tag FROM products WHERE id <= 3
ORDER BY name, tag;`],
          ["POSEXPLODE", "Keep each array item’s zero-based position.", `WITH input AS (SELECT ARRAY('sql','spark') AS skills)
SELECT pos, skill FROM input
LATERAL VIEW POSEXPLODE(skills) expanded AS pos, skill;`, `WITH skills(pos, skill) AS (VALUES (0,'sql'),(1,'spark'))
SELECT pos, skill FROM skills ORDER BY pos;`],
          ["JSON table-valued function", "SQLite json_each turns JSON array elements into rows.", `SELECT CAST(key AS INTEGER) AS position, value AS item
FROM json_each('["sql","spark"]') ORDER BY position;`, `SELECT CAST(key AS INTEGER) AS position, value AS item
FROM json_each('["sql","spark"]') ORDER BY position;`]
        ]
      },
      {
        name: "Correlated sources",
        items: [
          ["LATERAL subquery", "Find the latest order for each customer using a row-aware subquery.", `SELECT c.name, latest.id AS order_id, latest.order_date
FROM customers AS c,
LATERAL (SELECT o.id, o.order_date FROM orders AS o
         WHERE o.customer_id = c.id
         ORDER BY o.order_date DESC LIMIT 1) AS latest;`, `WITH ranked_orders AS (SELECT o.*, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, id DESC) AS rn FROM orders AS o)
SELECT c.name, o.id AS order_id, o.order_date
FROM customers AS c LEFT JOIN ranked_orders AS o ON o.customer_id = c.id AND o.rn = 1
ORDER BY c.id;`],
          ["CROSS lateral expansion", "An inner lateral expansion removes parents with no produced rows.", `SELECT p.name, labels.tag
FROM products AS p,
LATERAL (SELECT p.category AS tag UNION ALL SELECT p.name) AS labels
WHERE p.id <= 3;`, `SELECT name, category AS tag FROM products WHERE id <= 3
UNION ALL
SELECT name, name AS tag FROM products WHERE id <= 3
ORDER BY name, tag;`],
          ["LEFT LATERAL pattern", "Preserve a parent even when the correlated source has no match.", `SELECT c.name, latest.id AS order_id
FROM customers AS c
LEFT JOIN LATERAL (SELECT o.id FROM orders AS o
                   WHERE o.customer_id = c.id
                   ORDER BY o.order_date DESC LIMIT 1) AS latest ON TRUE;`, `WITH ranked_orders AS (SELECT o.*, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, id DESC) AS rn FROM orders AS o)
SELECT c.name, o.id AS order_id
FROM customers AS c LEFT JOIN ranked_orders AS o ON o.customer_id = c.id AND o.rn = 1
ORDER BY c.id;`]
        ]
      }
    ]
  },
  {
    group: "ADVANCED PRACTICE",
    title: "PIVOT, UNPIVOT & conditional aggregation",
    time: "16 MIN",
    level: "ADVANCING",
    intro: "Turn category values into columns or reshape those columns back into rows. Learn Databricks PIVOT and UNPIVOT syntax, plus conditional aggregation that runs in the local SQLite editor.",
    task: "Show one row per customer with separate totals for shipped, delivered, and processing orders.",
    hint: "Use SUM(CASE WHEN status = ... THEN total ELSE 0 END) for each output column, then group by customer.",
    query: `SELECT c.name AS customer,
       SUM(CASE WHEN o.status = 'shipped' THEN o.total ELSE 0 END) AS shipped_total,
       SUM(CASE WHEN o.status = 'delivered' THEN o.total ELSE 0 END) AS delivered_total,
       SUM(CASE WHEN o.status = 'processing' THEN o.total ELSE 0 END) AS processing_total
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
GROUP BY c.id, c.name
ORDER BY c.id;`,
    heading: "Reshape categories into useful columns",
    copy: "PIVOT groups rows by an identifier and turns selected category values into columns. UNPIVOT reverses that shape into name/value rows. Conditional aggregation is the portable pattern: SUM(CASE WHEN ... THEN value ELSE 0 END). It gives explicit control over categories and works in SQLite and Databricks SQL.",
    example: `SELECT c.name AS customer,
       SUM(CASE WHEN o.status = 'shipped' THEN o.total ELSE 0 END) AS shipped_total,
       SUM(CASE WHEN o.status = 'delivered' THEN o.total ELSE 0 END) AS delivered_total
FROM customers AS c LEFT JOIN orders AS o ON o.customer_id = c.id
GROUP BY c.id, c.name;`,
    caption: "CONDITIONAL AGGREGATION · PORTABLE SQL",
    after: "PIVOT and UNPIVOT syntax varies between engines. Decide how to represent missing categories: NULL means no contributing rows, while COALESCE can display zero. Keep a stable grouping key so different entities do not collapse into one row.",
    tip: "For a small, known set of categories, conditional aggregation is clear and portable. Use PIVOT when its syntax makes a wide report easier to maintain; use UNPIVOT before generic downstream processing.",
    guideTitle: "PIVOT & UNPIVOT AT A GLANCE",
    guideNote: "DATABRICKS + SQLITE",
    functionGroups: [
      {
        name: "Rows to columns",
        items: [
          ["Conditional aggregation", "Portable pivot: calculate one measure per chosen status.", `SELECT customer_id,
       SUM(CASE WHEN status='shipped' THEN total ELSE 0 END) AS shipped,
       SUM(CASE WHEN status='delivered' THEN total ELSE 0 END) AS delivered
FROM orders GROUP BY customer_id ORDER BY customer_id;`, `SELECT customer_id,
       SUM(CASE WHEN status='shipped' THEN total ELSE 0 END) AS shipped,
       SUM(CASE WHEN status='delivered' THEN total ELSE 0 END) AS delivered
FROM orders GROUP BY customer_id ORDER BY customer_id;`],
          ["Databricks PIVOT", "Pivot the three known order statuses into measure columns.", `SELECT customer_id, shipped, delivered, processing
FROM orders
PIVOT (SUM(total) FOR status IN ('shipped','delivered','processing'))
ORDER BY customer_id;`, `SELECT customer_id,
 SUM(CASE WHEN status='shipped' THEN total END) AS shipped,
 SUM(CASE WHEN status='delivered' THEN total END) AS delivered,
 SUM(CASE WHEN status='processing' THEN total END) AS processing
FROM orders GROUP BY customer_id ORDER BY customer_id;`]
        ]
      },
      {
        name: "Columns back to rows",
        items: [
          ["Databricks UNPIVOT", "Turn status total columns back into (status, total) rows.", `WITH wide AS (
  SELECT customer_id, shipped, delivered, processing FROM orders
  PIVOT (SUM(total) FOR status IN ('shipped','delivered','processing'))
)
SELECT customer_id, status, total FROM wide
UNPIVOT (total FOR status IN (shipped, delivered, processing))
ORDER BY customer_id, status;`, `SELECT customer_id, 'shipped' AS status, SUM(total) AS total FROM orders WHERE status='shipped' GROUP BY customer_id
UNION ALL SELECT customer_id, 'delivered', SUM(total) FROM orders WHERE status='delivered' GROUP BY customer_id
UNION ALL SELECT customer_id, 'processing', SUM(total) FROM orders WHERE status='processing' GROUP BY customer_id
ORDER BY customer_id, status;`],
          ["NULL or zero", "COALESCE changes a missing pivot value to a displayed zero.", `SELECT customer_id,
       COALESCE(SUM(CASE WHEN status='processing' THEN total END),0) AS processing_total
FROM orders GROUP BY customer_id ORDER BY customer_id;`, `SELECT customer_id,
       COALESCE(SUM(CASE WHEN status='processing' THEN total END),0) AS processing_total
FROM orders GROUP BY customer_id ORDER BY customer_id;`],
          ["Count by category", "Conditional COUNT measures how many rows each category contributes.", `SELECT customer_id,
       SUM(CASE WHEN status='shipped' THEN 1 ELSE 0 END) AS shipped_orders,
       SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) AS delivered_orders
FROM orders GROUP BY customer_id ORDER BY customer_id;`, `SELECT customer_id,
       SUM(CASE WHEN status='shipped' THEN 1 ELSE 0 END) AS shipped_orders,
       SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) AS delivered_orders
FROM orders GROUP BY customer_id ORDER BY customer_id;`]
        ]
      }
    ]
  }
];
