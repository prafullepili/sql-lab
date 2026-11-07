export const functionGapLessons = [
  {
    group: 'DATABRICKS SQL', title: 'Higher-order arrays & time functions', time: '18 MIN', level: 'ADVANCED',
    intro: 'Apply small lambda expressions to every array element, filter arrays in place, find minimum-associated values, and shape timestamps for reporting.',
    task: 'Return each customer’s earliest order id and order date.',
    hint: 'Rank each customer’s orders by order_date and id, then keep row number 1. In Databricks, MIN_BY can return the order id associated with the earliest date.',
    query: `WITH ranked_orders AS (
  SELECT customer_id, id, order_date,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, id) AS row_num
  FROM orders
)
SELECT customer_id, id AS first_order_id, order_date AS first_order_date
FROM ranked_orders
WHERE row_num = 1
ORDER BY customer_id;`,
    heading: 'Transform each element, or reduce the whole array',
    copy: 'Higher-order functions take an array and a lambda that describes what to do with each element. TRANSFORM returns a new array with changed elements. FILTER keeps only elements whose predicate is true. AGGREGATE folds elements into one result. MIN_BY returns a value associated with the smallest ordering value; it is the counterpart to MAX_BY.',
    example: `SELECT strftime('%Y-%m-01', order_date) AS month_start,
       COUNT(*) AS order_count
FROM orders
GROUP BY month_start
ORDER BY month_start;`,
    caption: 'BUCKET DATES FOR A MONTHLY REPORT',
    after: 'Array functions require Databricks ARRAY values. The local examples use JSON arrays and SQLite JSON1 equivalents. For time reporting, normalize timestamps and time zones before truncating them into calendar periods.',
    tip: 'MIN_BY and MAX_BY can be nondeterministic when multiple rows tie for the same minimum or maximum ordering value. Add a deterministic tie-breaker when that matters.',
    guideTitle: 'ARRAY AND TIME PRACTICE', guideNote: 'DATABRICKS + SQLITE',
    functionGroups: [
      { name: 'Higher-order array functions', items: [
        ['TRANSFORM(array, x -> expression)', 'Run the lambda for every element and return a new array. The SQLite version expands and rebuilds JSON values.', `SELECT transform(array(1, 2, 3), x -> x * 10) AS scaled;`, `SELECT json_group_array(value * 10) AS scaled
FROM json_each('[1,2,3]');`],
        ['FILTER(array, x -> predicate)', 'Keep only array elements that pass the predicate. The SQLite version filters rows from json_each.', `SELECT filter(array(1, 2, 3, 4), x -> x % 2 = 0) AS even_values;`, `SELECT json_group_array(value) AS even_values
FROM json_each('[1,2,3,4]')
WHERE CAST(value AS INTEGER) % 2 = 0;`],
        ['AGGREGATE(array, start, merge)', 'Fold array elements into one scalar. This sums the values while carrying a running total.', `SELECT aggregate(array(1, 2, 3, 4), 0, (total, x) -> total + x) AS array_sum;`, `SELECT SUM(CAST(value AS INTEGER)) AS array_sum
FROM json_each('[1,2,3,4]');`],
      ]},
      { name: 'Choose a value by its minimum', items: [
        ['MIN_BY(value, order_by)', 'Return the value from the row with the smallest ordering value. This finds the earliest order id per customer; ties can be nondeterministic.', `SELECT customer_id,
       min_by(id, order_date) AS first_order_id,
       MIN(order_date) AS first_order_date
FROM orders
GROUP BY customer_id
ORDER BY customer_id;`, `WITH ranked AS (
  SELECT customer_id, id, order_date,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, id) AS row_num
  FROM orders
)
SELECT customer_id, id AS first_order_id, order_date AS first_order_date
FROM ranked WHERE row_num = 1
ORDER BY customer_id;`],
      ]},
      { name: 'Dates and timestamps', items: [
        ['DATE_TRUNC', 'Round a timestamp down to a calendar boundary such as month or day. SQLite strftime provides a local month bucket.', `SELECT date_trunc('MONTH', TIMESTAMP '2025-03-08 14:25:00') AS month_start;`, `SELECT strftime('%Y-%m-01 00:00:00', '2025-03-08 14:25:00') AS month_start;`],
        ['TO_DATE and TO_TIMESTAMP', 'Parse text into a date or timestamp type. TRY_TO_TIMESTAMP is useful when malformed inputs should become NULL instead of failing.', `SELECT to_date('2025-03-08') AS event_date,
       to_timestamp('2025-03-08 14:25:00') AS event_time,
       try_to_timestamp('not a time') AS invalid_time;`, `SELECT date('2025-03-08') AS event_date,
       datetime('2025-03-08 14:25:00') AS event_time,
       CASE WHEN datetime('not a time') IS NULL THEN NULL END AS invalid_time;`],
        ['TIMESTAMPDIFF', 'Measure elapsed time in a chosen unit. Databricks takes the unit, start timestamp, and end timestamp.', `SELECT timestampdiff(HOUR,
       TIMESTAMP '2025-03-08 09:00:00',
       TIMESTAMP '2025-03-08 14:30:00') AS hours_elapsed;`, `SELECT CAST((julianday('2025-03-08 14:30:00') - julianday('2025-03-08 09:00:00')) * 24 AS INTEGER) AS hours_elapsed;`],
      ]},
    ],
  },
];
