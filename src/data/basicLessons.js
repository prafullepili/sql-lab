export const lessons = [
  {
    group: "FOUNDATIONS",
    title: "Your first query",
    time: "5 MIN",
    level: "STARTER",
    intro:
      "SQL is how you ask a database questions. Start with one table, choose the columns you want, and let the data answer.",
    task: "List each product’s name and category.",
    hint: "Select the name and category columns from products.",
    query: "SELECT name, category\nFROM products;",
    glanceLabel: "List product names and categories",
    glanceExplanation: "Choose the name and category columns, then read them from the products table.",
    heading: "Ask a clear question",
    copy: "A database stores information in tables. Each table has columns (the fields) and rows (the individual records). A query is a question written in a language the database understands.",
    example: "SELECT name, city\nFROM customers;",
    caption: "THE SHAPE OF A QUERY",
    after:
      "SELECT names the columns you want back. FROM tells SQL where those columns live. The semicolon marks the end of the statement.",
    tip: "Change the column names in the editor, then press Ctrl + Enter or Run query. Click a table name below to peek at its columns.",
  },
  {
    group: "FOUNDATIONS",
    title: "Choose your columns",
    time: "6 MIN",
    level: "STARTER",
    intro:
      "A good query returns just the information you need. Pick columns by name, rename them with aliases, or ask for every column while exploring.",
    task: "Show the product name, category, and price. Rename price to list_price.",
    hint: "Use price AS list_price in your SELECT list.",
    query: "SELECT name, category, price AS list_price\nFROM products;",
    heading: "Be specific about the result",
    copy: "List column names after SELECT, separated by commas. To inspect an unfamiliar table, SELECT * returns every column. For finished queries, name the columns you actually need.",
    example: "SELECT name,\n       price AS list_price\nFROM products;",
    caption: "RENAME A COLUMN",
    after:
      "An alias changes the column label in the result. Use AS to make that intent clear. In SQLite, the keyword is optional, but clarity helps when queries grow.",
    tip: "SELECT * is handy for a quick look. AS gives a result column a friendlier name.",
  },
  {
    group: "FOUNDATIONS",
    title: "Filter rows",
    time: "8 MIN",
    level: "STARTER",
    intro:
      "Use WHERE to keep only the rows that match a condition. Combine comparisons to narrow a broad table into a useful answer.",
    task: "Show the name and price of products costing less than 50 that are in stock.",
    hint: "Put both conditions in WHERE and join them with AND.",
    query: "SELECT name, price\nFROM products\nWHERE price < 50 AND stock > 0;",
    heading: "Keep the rows that matter",
    copy: "WHERE is evaluated for each row. Only rows where the condition is true make it into the result. Use =, >, <, >=, and <> to compare values.",
    example:
      "SELECT name, price\nFROM products\nWHERE category = 'Accessories'\n  AND price < 50;",
    caption: "COMBINE CONDITIONS",
    after:
      "Use AND when every condition must be true, OR when either is enough, and parentheses when mixing them. Text values go inside single quotes.",
    tip: "For a range, try price BETWEEN 10 AND 50. For a set of values, use category IN ('Books', 'Accessories').",
  },
  {
    group: "FOUNDATIONS",
    title: "Sort & limit",
    time: "6 MIN",
    level: "STARTER",
    intro:
      "Sorting turns a pile of rows into a ranked list. Pair ORDER BY with LIMIT to focus on the top or bottom of a result.",
    task: "Sort order items by quantity, highest first, and show only three rows.",
    hint: "ORDER BY quantity DESC comes before LIMIT 3.",
    query:
      "SELECT product_id, quantity\nFROM order_items\nORDER BY quantity DESC\nLIMIT 3;",
    heading: "Put results in order",
    copy: "Databases do not promise a row order unless you ask. ORDER BY sorts by one or more columns. Add DESC for descending order; ascending order is the default.",
    example: "SELECT name, price\nFROM products\nORDER BY price DESC\nLIMIT 5;",
    caption: "TOP FIVE BY PRICE",
    after:
      "LIMIT caps the number of returned rows. Sort first, then limit, so the database knows which rows belong at the top.",
    tip: "Sort ties consistently by adding a second column, like ORDER BY price DESC, name. Use LIMIT 10 OFFSET 10 to skip the first page.",
  },
  {
    group: "WORK WITH DATA",
    title: "Summarize data",
    time: "9 MIN",
    level: "BUILDING",
    intro:
      "Aggregate functions turn many rows into a useful summary. Group rows by a category to compare totals side by side.",
    task: "Return each city and the number of customers who live there. Show the largest groups first.",
    hint: "COUNT(*) counts rows. Group by city, then order by the count alias.",
    query:
      "SELECT city, COUNT(*) AS customer_count\nFROM customers\nGROUP BY city\nORDER BY customer_count DESC;",
    heading: "From rows to summaries",
    copy: "COUNT, SUM, AVG, MIN, and MAX summarize values. Add GROUP BY to get a separate summary for each distinct group.",
    example:
      "SELECT customer_id,\n       SUM(total) AS lifetime_value\nFROM orders\nGROUP BY customer_id;",
    caption: "REVENUE BY CUSTOMER",
    after:
      "Every selected column must either be grouped or aggregated. Use COUNT(*) to count rows, even if some fields are empty.",
    tip: "Filter individual rows with WHERE. Filter completed groups with HAVING, for example HAVING COUNT(*) > 2.",
  },
  {
    group: "WORK WITH DATA",
    title: "Join tables",
    time: "12 MIN",
    level: "BUILDING",
    intro:
      "Related information often lives in separate tables. A JOIN combines rows using matching key values, so you can ask richer questions.",
    task: "Find orders placed by customers in Austin. Show the customer name, order id, and status.",
    hint: "Join orders to customers on customer_id = id, then filter on the customer's city.",
    query:
      "SELECT c.name AS customer, o.id AS order_id, o.status\nFROM orders AS o\nJOIN customers AS c ON o.customer_id = c.id\nWHERE c.city = 'Austin'\nORDER BY o.id;",
    heading: "Bring related tables together",
    copy: "Customer details and order facts are stored separately to avoid repeating customer information on every order. The customers table uses id as its primary key; orders.customer_id refers to that key. An INNER JOIN returns only orders with a matching customer.",
    example:
      "SELECT o.id, c.name, o.total\nFROM orders AS o\nJOIN customers AS c\n  ON o.customer_id = c.id;",
    caption: "ORDERS WITH CUSTOMER NAMES",
    after:
      "This is an inner join: only orders with a matching customer appear. Table aliases (o, c) keep the query readable.",
    tip: "LEFT JOIN keeps every row from the left table, even without a match. Qualify shared names like id with a table alias.",
  },
  {
    group: "WORK WITH DATA",
    title: "Join types & unmatched rows",
    time: "12 MIN",
    level: "BUILDING",
    intro:
      "An INNER JOIN keeps matching pairs. An outer join preserves rows that have no match, while CROSS JOIN creates every possible pair.",
    task: "Keep every customer in the result. Use LEFT JOIN to show their order, including customers with no orders.",
    hint: "Start from customers and LEFT JOIN orders on customer_id. A missing order appears as NULL.",
    query:
      "SELECT c.name AS customer, o.id AS order_id, o.status\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nORDER BY c.id, o.id;",
    heading: "Choose a join by what must remain",
    copy: "The left and right sides of a join are the inputs around the JOIN keyword. INNER returns only matching pairs. LEFT keeps every left row and fills unmatched right columns with NULL. The join type determines which unmatched rows survive.",
    example:
      "SELECT c.name, o.id AS order_id\nFROM customers AS c\nLEFT JOIN orders AS o\n  ON o.customer_id = c.id;",
    caption: "KEEP EVERY CUSTOMER",
    after:
      "RIGHT JOIN preserves unmatched rows from the right input; FULL OUTER preserves unmatched rows from both. CROSS JOIN makes a Cartesian product. In outer joins, putting a right-side filter in WHERE can remove NULL-extended rows and turn the result into an inner-like result.",
    tip: "Choose the preserved side first. Keep match conditions in ON, and place filters carefully when you need unmatched rows.",
    guideTitle: "JOIN TYPES AT A GLANCE",
    guideNote: "MATCH BEHAVIOR",
    functionGroups: [
      {
        name: "Matching and preserving rows",
        items: [
          [
            "INNER JOIN",
            "Keep only customer/order pairs that match on the key.",
            "SELECT c.name AS customer, o.id AS order_id\nFROM customers AS c\nINNER JOIN orders AS o ON o.customer_id = c.id\nORDER BY c.id, o.id;",
          ],
          [
            "LEFT OUTER JOIN",
            "Keep every customer; Eli stays with NULL order columns.",
            "SELECT c.name AS customer, o.id AS order_id\nFROM customers AS c\nLEFT OUTER JOIN orders AS o ON o.customer_id = c.id\nORDER BY c.id, o.id;",
          ],
          [
            "RIGHT OUTER JOIN",
            "Keep every row from the right input, even with no order match.",
            "SELECT c.name AS customer, o.id AS order_id\nFROM orders AS o\nRIGHT OUTER JOIN customers AS c ON c.id = o.customer_id\nORDER BY c.id, o.id;",
          ],
          [
            "FULL OUTER JOIN",
            "Keep unmatched rows from both inputs.",
            "SELECT c.name AS customer, o.id AS order_id\nFROM customers AS c\nFULL OUTER JOIN orders AS o ON o.customer_id = c.id\nORDER BY c.id, o.id;",
          ],
        ],
      },
      {
        name: "Other join forms and conditions",
        items: [
          [
            "CROSS JOIN",
            "Combine every customer with every product; this is a Cartesian product.",
            "SELECT c.name AS customer, p.name AS product\nFROM customers AS c\nCROSS JOIN products AS p\nORDER BY c.id, p.id\nLIMIT 8;",
          ],
          [
            "Filter in ON",
            "Keep every customer but match only shipped orders.",
            "SELECT c.name, o.id AS shipped_order\nFROM customers AS c\nLEFT JOIN orders AS o\n  ON o.customer_id = c.id AND o.status = 'shipped'\nORDER BY c.id, o.id;",
          ],
          [
            "Filter in WHERE",
            "The same filter in WHERE removes rows with no shipped order.",
            "SELECT c.name, o.id AS shipped_order\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nWHERE o.status = 'shipped'\nORDER BY c.id, o.id;",
          ],
          [
            "NULL-safe match",
            "SQLite IS compares NULLs safely; Databricks SQL uses <=>.",
            "SELECT a.name, b.name\nFROM customers AS a\nJOIN customers AS b ON a.city IS b.city AND a.id < b.id;",
          ],
          [
            "Explicit join key",
            "Match the foreign key to the primary key, not columns with similar names.",
            "SELECT c.name, o.id AS order_id\nFROM orders AS o\nJOIN customers AS c ON c.id = o.customer_id\nORDER BY o.id;",
          ],
        ],
      },
    ],
  },
  {
    group: "WORK WITH DATA",
    title: "JOIN cookbook: complete examples",
    time: "18 MIN",
    level: "BUILDING → ADVANCING",
    intro:
      "A reference you can run: standard join types, multi-table patterns, and advanced alternatives. Each portable example can be loaded directly into the query editor.",
    task: "Use INNER JOIN to list customers who have matching orders. Return each customer name and order id.",
    hint: "Start with INNER and LEFT to see the difference between matched rows and preserved rows.",
    query:
      "SELECT c.name AS customer, o.id AS order_id\nFROM customers AS c\nINNER JOIN orders AS o ON o.customer_id = c.id\nORDER BY c.id, o.id;",
    heading: "Every join needs a relationship",
    copy: "A join combines rows from two inputs using a match condition. The join type controls what happens to unmatched rows. The examples below use customers, orders, order_items, and products; the advanced section also includes Databricks-only syntax.",
    example:
      "SELECT c.name AS customer, o.id AS order_id\nFROM customers AS c\nINNER JOIN orders AS o\n  ON o.customer_id = c.id;",
    caption: "INNER JOIN · COMPLETE QUERY",
    after:
      "Choose “Try this query” to place a runnable example in the editor. RIGHT, FULL OUTER, self, range, USING, and NULL-safe examples run in the local SQLite sandbox. LEFT SEMI / LEFT ANTI and Databricks <=> are reference syntax; use the EXISTS / NOT EXISTS or IS equivalents in the local runner.",
    tip: "For a multi-table result, add one ON condition at a time. Check how many rows each join produces and whether that matches the grain you expect.",
    guideTitle: "JOIN COOKBOOK",
    guideNote: "LOAD + RUN",
    functionGroups: [
      {
        name: "Standard join types",
        items: [
          [
            "INNER JOIN",
            "Only matching customer and order rows.",
            "SELECT c.name AS customer, o.id AS order_id\nFROM customers AS c\nINNER JOIN orders AS o ON o.customer_id = c.id\nORDER BY c.id, o.id;",
            "SELECT c.name AS customer, o.id AS order_id\nFROM customers AS c\nINNER JOIN orders AS o ON o.customer_id = c.id\nORDER BY c.id, o.id;",
          ],
          [
            "LEFT [OUTER] JOIN",
            "Keep every customer, including Eli with no matching order.",
            "SELECT c.name AS customer, o.id AS order_id\nFROM customers AS c\nLEFT OUTER JOIN orders AS o ON o.customer_id = c.id\nORDER BY c.id, o.id;",
            "SELECT c.name AS customer, o.id AS order_id\nFROM customers AS c\nLEFT OUTER JOIN orders AS o ON o.customer_id = c.id\nORDER BY c.id, o.id;",
          ],
          [
            "RIGHT [OUTER] JOIN",
            "Keep every customer from the right input.",
            "SELECT c.name AS customer, o.id AS order_id\nFROM orders AS o\nRIGHT OUTER JOIN customers AS c ON c.id = o.customer_id\nORDER BY c.id, o.id;",
            "SELECT c.name AS customer, o.id AS order_id\nFROM orders AS o\nRIGHT OUTER JOIN customers AS c ON c.id = o.customer_id\nORDER BY c.id, o.id;",
          ],
          [
            "FULL [OUTER] JOIN",
            "Keep unmatched rows from both inputs.",
            "SELECT c.name AS customer, o.id AS order_id\nFROM customers AS c\nFULL OUTER JOIN orders AS o ON o.customer_id = c.id\nORDER BY c.id, o.id;",
            "SELECT c.name AS customer, o.id AS order_id\nFROM customers AS c\nFULL OUTER JOIN orders AS o ON o.customer_id = c.id\nORDER BY c.id, o.id;",
          ],
          [
            "CROSS JOIN",
            "Pair every customer with every product; LIMIT keeps the preview small.",
            "SELECT c.name AS customer, p.name AS product\nFROM customers AS c\nCROSS JOIN products AS p\nORDER BY c.id, p.id\nLIMIT 8;",
            "SELECT c.name AS customer, p.name AS product\nFROM customers AS c\nCROSS JOIN products AS p\nORDER BY c.id, p.id\nLIMIT 8;",
          ],
          [
            "JOIN ... USING",
            "Use USING when both inputs share the same key name.",
            "WITH customer_keys AS (SELECT id AS customer_id, name FROM customers)\nSELECT c.name, o.id AS order_id\nFROM customer_keys AS c\nJOIN orders AS o USING (customer_id)\nORDER BY c.name, o.id;",
            "WITH customer_keys AS (SELECT id AS customer_id, name FROM customers)\nSELECT c.name, o.id AS order_id\nFROM customer_keys AS c\nJOIN orders AS o USING (customer_id)\nORDER BY c.name, o.id;",
          ],
        ],
      },
      {
        name: "Advanced relationship patterns",
        items: [
          [
            "SEMI JOIN · Databricks",
            "Return left rows that have a match; the right side is only a filter.",
            "SELECT c.id, c.name\nFROM customers AS c\nLEFT SEMI JOIN orders AS o ON o.customer_id = c.id;",
            "SELECT c.id, c.name\nFROM customers AS c\nWHERE EXISTS (SELECT 1 FROM orders AS o WHERE o.customer_id = c.id)\nORDER BY c.id;",
          ],
          [
            "EXISTS · portable semi pattern",
            "Equivalent existence check that runs in SQLite and Databricks.",
            "SELECT c.id, c.name\nFROM customers AS c\nWHERE EXISTS (SELECT 1 FROM orders AS o WHERE o.customer_id = c.id)\nORDER BY c.id;",
            "SELECT c.id, c.name\nFROM customers AS c\nWHERE EXISTS (SELECT 1 FROM orders AS o WHERE o.customer_id = c.id)\nORDER BY c.id;",
          ],
          [
            "ANTI JOIN · Databricks",
            "Return left rows without a match.",
            "SELECT c.id, c.name\nFROM customers AS c\nLEFT ANTI JOIN orders AS o ON o.customer_id = c.id;",
            "SELECT c.id, c.name\nFROM customers AS c\nWHERE NOT EXISTS (SELECT 1 FROM orders AS o WHERE o.customer_id = c.id)\nORDER BY c.id;",
          ],
          [
            "NOT EXISTS · portable anti pattern",
            "Find customers with no orders; avoids NULL pitfalls of NOT IN.",
            "SELECT c.id, c.name\nFROM customers AS c\nWHERE NOT EXISTS (SELECT 1 FROM orders AS o WHERE o.customer_id = c.id)\nORDER BY c.id;",
            "SELECT c.id, c.name\nFROM customers AS c\nWHERE NOT EXISTS (SELECT 1 FROM orders AS o WHERE o.customer_id = c.id)\nORDER BY c.id;",
          ],
          [
            "Self join",
            "Compare customers who live in the same city, without duplicate pairs.",
            "SELECT a.name AS customer_a, b.name AS customer_b, a.city\nFROM customers AS a\nJOIN customers AS b ON b.city = a.city AND a.id < b.id\nORDER BY a.city;",
            "SELECT a.name AS customer_a, b.name AS customer_b, a.city\nFROM customers AS a\nJOIN customers AS b ON b.city = a.city AND a.id < b.id\nORDER BY a.city;",
          ],
          [
            "Non-equi / range join",
            "Match order pairs by a range or inequality, not only equality.",
            "SELECT a.customer_id, a.id AS earlier_order, b.id AS later_order,\n       julianday(b.order_date) - julianday(a.order_date) AS days_apart\nFROM orders AS a\nJOIN orders AS b ON b.customer_id = a.customer_id AND b.order_date > a.order_date\nORDER BY a.customer_id, a.order_date;",
            "SELECT a.customer_id, a.id AS earlier_order, b.id AS later_order,\n       julianday(b.order_date) - julianday(a.order_date) AS days_apart\nFROM orders AS a\nJOIN orders AS b ON b.customer_id = a.customer_id AND b.order_date > a.order_date\nORDER BY a.customer_id, a.order_date;",
          ],
          [
            "Composite-key join",
            "Match every column that makes up the key.",
            "WITH a AS (SELECT 7 AS tenant_id, 'A' AS code, 'left' AS label),\nb AS (SELECT 7 AS tenant_id, 'A' AS code, 'right' AS label)\nSELECT a.label, b.label\nFROM a JOIN b ON a.tenant_id = b.tenant_id AND a.code = b.code;",
            "WITH a AS (SELECT 7 AS tenant_id, 'A' AS code, 'left' AS label),\nb AS (SELECT 7 AS tenant_id, 'A' AS code, 'right' AS label)\nSELECT a.label, b.label\nFROM a JOIN b ON a.tenant_id = b.tenant_id AND a.code = b.code;",
          ],
        ],
      },
      {
        name: "Join conditions & NULLs",
        items: [
          [
            "Filter in ON",
            "Keep all customers, but attach only shipped orders.",
            "SELECT c.name, o.id AS shipped_order\nFROM customers AS c\nLEFT JOIN orders AS o\n  ON o.customer_id = c.id AND o.status = 'shipped'\nORDER BY c.id, o.id;",
            "SELECT c.name, o.id AS shipped_order\nFROM customers AS c\nLEFT JOIN orders AS o\n  ON o.customer_id = c.id AND o.status = 'shipped'\nORDER BY c.id, o.id;",
          ],
          [
            "NULL-safe equality · Databricks",
            "The <=> operator treats two NULL values as equal.",
            "SELECT a.id, b.id\nFROM customers AS a\nJOIN customers AS b ON a.city <=> b.city AND a.id < b.id;",
            "SELECT a.id, b.id\nFROM customers AS a\nJOIN customers AS b ON a.city IS b.city AND a.id < b.id;",
          ],
          [
            "NULL-safe equality · SQLite",
            "SQLite IS is the NULL-safe equality equivalent.",
            "SELECT a.id, b.id\nFROM customers AS a\nJOIN customers AS b ON a.city IS b.city AND a.id < b.id;",
            "SELECT a.id, b.id\nFROM customers AS a\nJOIN customers AS b ON a.city IS b.city AND a.id < b.id;",
          ],
          [
            "NATURAL JOIN · use caution",
            "Automatically joins on every shared column name, so schema changes can silently change matches.",
            "WITH a AS (SELECT 1 AS customer_id, 'open' AS status),\nb AS (SELECT 1 AS customer_id, 'closed' AS status)\nSELECT * FROM a NATURAL JOIN b;",
            "WITH a AS (SELECT 1 AS customer_id, 'open' AS status),\nb AS (SELECT 1 AS customer_id, 'closed' AS status)\nSELECT * FROM a NATURAL JOIN b;",
          ],
        ],
      },
      {
        name: "More examples across the sample data",
        items: [
          [
            "Three-table detail",
            "Join each order line to its product name.",
            "SELECT o.id AS order_id, p.name AS product, oi.quantity\nFROM orders AS o\nJOIN order_items AS oi ON oi.order_id = o.id\nJOIN products AS p ON p.id = oi.product_id\nORDER BY o.id, oi.id;",
            "SELECT o.id AS order_id, p.name AS product, oi.quantity\nFROM orders AS o\nJOIN order_items AS oi ON oi.order_id = o.id\nJOIN products AS p ON p.id = oi.product_id\nORDER BY o.id, oi.id;",
          ],
          [
            "LEFT JOIN with a count",
            "Keep customers with zero orders; COUNT the non-NULL order key.",
            "SELECT c.name, COUNT(o.id) AS order_count\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nORDER BY order_count DESC, c.name;",
            "SELECT c.name, COUNT(o.id) AS order_count\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nORDER BY order_count DESC, c.name;",
          ],
          [
            "RIGHT JOIN product coverage",
            "Keep every product, including the one with no order items.",
            "SELECT p.name AS product, COUNT(oi.id) AS line_count\nFROM order_items AS oi\nRIGHT JOIN products AS p ON p.id = oi.product_id\nGROUP BY p.id, p.name\nORDER BY p.id;",
            "SELECT p.name AS product, COUNT(oi.id) AS line_count\nFROM order_items AS oi\nRIGHT JOIN products AS p ON p.id = oi.product_id\nGROUP BY p.id, p.name\nORDER BY p.id;",
          ],
          [
            "FULL OUTER with an unmatched side",
            "Preserve products without sales and all line items.",
            "SELECT p.name AS product, oi.order_id\nFROM products AS p\nFULL OUTER JOIN order_items AS oi ON oi.product_id = p.id\nORDER BY p.id, oi.order_id;",
            "SELECT p.name AS product, oi.order_id\nFROM products AS p\nFULL OUTER JOIN order_items AS oi ON oi.product_id = p.id\nORDER BY p.id, oi.order_id;",
          ],
          [
            "CROSS JOIN two derived lists",
            "Make every combination of product category and order status.",
            "WITH categories AS (SELECT DISTINCT category FROM products),\nstatuses AS (SELECT DISTINCT status FROM orders)\nSELECT category, status\nFROM categories CROSS JOIN statuses\nORDER BY category, status;",
            "WITH categories AS (SELECT DISTINCT category FROM products),\nstatuses AS (SELECT DISTINCT status FROM orders)\nSELECT category, status\nFROM categories CROSS JOIN statuses\nORDER BY category, status;",
          ],
          [
            "LEFT JOIN filtered in WHERE",
            "Contrast with the ON-filter example: unmatched customers are removed here.",
            "SELECT c.name, o.id AS shipped_order\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nWHERE o.status = 'shipped'\nORDER BY c.id, o.id;",
            "SELECT c.name, o.id AS shipped_order\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nWHERE o.status = 'shipped'\nORDER BY c.id, o.id;",
          ],
          [
            "Four-table revenue summary",
            "Roll line-item revenue up to customer grain across four tables.",
            "SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS item_revenue\nFROM customers AS c\nJOIN orders AS o ON o.customer_id = c.id\nJOIN order_items AS oi ON oi.order_id = o.id\nJOIN products AS p ON p.id = oi.product_id\nGROUP BY c.id, c.name\nORDER BY item_revenue DESC;",
            "SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS item_revenue\nFROM customers AS c\nJOIN orders AS o ON o.customer_id = c.id\nJOIN order_items AS oi ON oi.order_id = o.id\nJOIN products AS p ON p.id = oi.product_id\nGROUP BY c.id, c.name\nORDER BY item_revenue DESC;",
          ],
        ],
      },
      {
        name: "Read the query and its keywords",
        items: [
          [
            "SELECT · AS",
            "SELECT chooses output columns. AS gives a column or table a readable alias.",
            "SELECT c.name AS customer, o.id AS order_id\nFROM customers AS c\nJOIN orders AS o ON o.customer_id = c.id;",
            "SELECT c.name AS customer, o.id AS order_id\nFROM customers AS c\nJOIN orders AS o ON o.customer_id = c.id;",
          ],
          [
            "FROM · JOIN",
            "FROM sets the starting table; each JOIN adds related rows from another table.",
            "SELECT o.id, oi.product_id\nFROM orders AS o\nJOIN order_items AS oi ON oi.order_id = o.id;",
            "SELECT o.id, oi.product_id\nFROM orders AS o\nJOIN order_items AS oi ON oi.order_id = o.id;",
          ],
          [
            "ON",
            "ON says which key values make rows match. Use the foreign-key relationship.",
            "SELECT c.name, o.id\nFROM customers AS c\nJOIN orders AS o ON o.customer_id = c.id;",
            "SELECT c.name, o.id\nFROM customers AS c\nJOIN orders AS o ON o.customer_id = c.id;",
          ],
          [
            "WHERE",
            "WHERE filters joined rows after matching. On an outer join, a right-side WHERE filter can remove unmatched rows.",
            "SELECT c.name, o.id\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nWHERE o.status = 'shipped';",
            "SELECT c.name, o.id\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nWHERE o.status = 'shipped';",
          ],
          [
            "GROUP BY · COUNT",
            "GROUP BY sets the summary grain. COUNT(o.id) stays zero for a left row with no match.",
            "SELECT c.name, COUNT(o.id) AS order_count\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nORDER BY order_count DESC;",
            "SELECT c.name, COUNT(o.id) AS order_count\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nORDER BY order_count DESC;",
          ],
          [
            "ORDER BY · LIMIT",
            "ORDER BY controls result order; LIMIT caps the rows shown.",
            "SELECT c.name, o.order_date\nFROM customers AS c\nJOIN orders AS o ON o.customer_id = c.id\nORDER BY o.order_date DESC\nLIMIT 3;",
            "SELECT c.name, o.order_date\nFROM customers AS c\nJOIN orders AS o ON o.customer_id = c.id\nORDER BY o.order_date DESC\nLIMIT 3;",
          ],
        ],
      },
    ],
  },
  {
    group: "WORK WITH DATA",
    title: "Multi-table joins & grain",
    time: "15 MIN",
    level: "BUILDING",
    intro:
      "Real questions often need three or more tables. Follow the key relationships one step at a time, qualify column names, and keep the output grain in view.",
    task: "Build a four-table order detail. Return the customer, order, product, quantity, and line total.",
    hint: "Join customers → orders → order_items → products using each table primary/foreign key pair.",
    query:
      "SELECT c.name AS customer, o.id AS order_id, p.name AS product,\n       oi.quantity, ROUND(oi.quantity * oi.unit_price, 2) AS line_total\nFROM customers AS c\nJOIN orders AS o ON o.customer_id = c.id\nJOIN order_items AS oi ON oi.order_id = o.id\nJOIN products AS p ON p.id = oi.product_id\nORDER BY o.id, oi.id;",
    heading: "Walk the relationship path",
    copy: "Each ON clause connects one relationship: customers.id → orders.customer_id → order_items.order_id, then order_items.product_id → products.id. order_items is the bridge between orders and products. Joining one edge at a time makes missing or incorrect keys easier to spot.",
    example:
      "SELECT c.name AS customer, o.id AS order_id, p.name AS product,\n       oi.quantity, ROUND(oi.quantity * oi.unit_price, 2) AS line_total\nFROM customers AS c\nJOIN orders AS o ON o.customer_id = c.id\nJOIN order_items AS oi ON oi.order_id = o.id\nJOIN products AS p ON p.id = oi.product_id;",
    caption: "FOUR TABLES, THREE KEY LINKS",
    after:
      "This result has one row per order item, not one row per order. An order with three line items appears three times. If you sum orders.total after joining items, each order total is repeated; aggregate at the order level first or sum line totals instead.",
    tip: "Before a multi-table query, write down the grain of each table and the grain you want in the output. Then add one join at a time and check row counts.",
    guideTitle: "MULTI-TABLE JOIN CHECKLIST",
    guideNote: "FOLLOW THE KEYS",
    functionGroups: [
      {
        name: "Follow each relationship",
        items: [
          [
            "Customer → order",
            "A customer can have several matching orders.",
            "SELECT c.name, o.id AS order_id\nFROM customers AS c\nJOIN orders AS o ON o.customer_id = c.id\nORDER BY c.id, o.id;",
          ],
          [
            "Order → line item",
            "Each order can expand into multiple item rows.",
            "SELECT o.id AS order_id, oi.id AS item_id, oi.quantity\nFROM orders AS o\nJOIN order_items AS oi ON oi.order_id = o.id\nORDER BY o.id, oi.id;",
          ],
          [
            "Line item → product",
            "Many line items can refer to the same product.",
            "SELECT oi.order_id, oi.id AS item_id, p.name AS product\nFROM order_items AS oi\nJOIN products AS p ON p.id = oi.product_id\nORDER BY oi.order_id, oi.id;",
          ],
          [
            "Bridge through order_items",
            "Use the line-item table to connect orders to products.",
            "SELECT o.id AS order_id, p.name AS product, oi.quantity\nFROM orders AS o\nJOIN order_items AS oi ON oi.order_id = o.id\nJOIN products AS p ON p.id = oi.product_id\nORDER BY o.id, oi.id;",
          ],
        ],
      },
      {
        name: "Check grain and totals",
        items: [
          [
            "Qualify repeated id columns",
            "Aliases make it clear which table each id comes from.",
            "SELECT c.id AS customer_id, o.id AS order_id, oi.id AS item_id, p.id AS product_id\nFROM customers AS c\nJOIN orders AS o ON o.customer_id = c.id\nJOIN order_items AS oi ON oi.order_id = o.id\nJOIN products AS p ON p.id = oi.product_id\nORDER BY o.id, oi.id\nLIMIT 5;",
          ],
          [
            "See one-to-many expansion",
            "Order totals repeat once per item row after this join.",
            "SELECT o.id AS order_id, o.total AS order_total, oi.id AS item_id\nFROM orders AS o\nJOIN order_items AS oi ON oi.order_id = o.id\nORDER BY o.id, oi.id;",
          ],
          [
            "Pre-aggregate to order grain",
            "Sum item values by order before joining to customer.",
            "WITH item_totals AS (\n  SELECT order_id, SUM(quantity * unit_price) AS item_total\n  FROM order_items\n  GROUP BY order_id\n)\nSELECT o.id AS order_id, c.name, item_totals.item_total\nFROM orders AS o\nJOIN customers AS c ON c.id = o.customer_id\nJOIN item_totals ON item_totals.order_id = o.id\nORDER BY o.id;",
          ],
          [
            "Find unmatched customers",
            "LEFT JOIN plus IS NULL finds customers with no order.",
            "SELECT c.id, c.name\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nWHERE o.id IS NULL;",
          ],
        ],
      },
    ],
  },
  {
    group: "GO FURTHER",
    title: "Subqueries & CTEs",
    time: "12 MIN",
    level: "ADVANCING",
    intro:
      "When a query starts doing too much at once, give a step its own name. Subqueries and CTEs let you build answers in layers.",
    task: "Find customers whose average order is above the overall average order total.",
    hint: "Use a CTE for customer averages, then compare with (SELECT AVG(total) FROM orders).",
    query:
      "WITH customer_averages AS (\n  SELECT customer_id, AVG(total) AS avg_total\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT c.name, ROUND(a.avg_total, 2) AS avg_total\nFROM customer_averages AS a\nJOIN customers AS c ON c.id = a.customer_id\nWHERE a.avg_total > (SELECT AVG(total) FROM orders)\nORDER BY avg_total DESC;",
    heading: "Name a step in the answer",
    copy: "A subquery is a query nested inside another. A common table expression (CTE) gives a temporary name to a result, making multi-step logic easier to read.",
    example:
      "WITH monthly_sales AS (\n  SELECT month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT * FROM monthly_sales;",
    caption: "BUILD THEN QUERY",
    after:
      "Think of the CTE as a named result available to the query that follows it. You can define multiple CTEs, separated by commas.",
    tip: "A scalar subquery returns one value. A subquery in FROM can act like a temporary table.",
  },
  {
    group: "GO FURTHER",
    title: "Window functions",
    time: "15 MIN",
    level: "ADVANCING",
    intro:
      "Window functions calculate across related rows while keeping each row visible. Use them for rankings, running totals, and comparisons.",
    task: "Show every order with its customer, total, and rank from highest to lowest total within that customer.",
    hint: "Use ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC).",
    query:
      "SELECT c.name AS customer, o.id AS order_id, o.total,\n       ROW_NUMBER() OVER (\n         PARTITION BY o.customer_id\n         ORDER BY o.total DESC\n       ) AS order_rank\nFROM orders AS o\nJOIN customers AS c ON c.id = o.customer_id\nORDER BY c.name, order_rank;",
    heading: "Calculate across a window",
    copy: "Unlike GROUP BY, a window function does not collapse rows. The OVER clause defines which rows to compare and in what order.",
    example:
      "SELECT customer_id, total,\n       ROW_NUMBER() OVER (\n         PARTITION BY customer_id\n         ORDER BY total DESC\n       ) AS order_rank\nFROM orders;",
    caption: "RANK EACH CUSTOMER’S ORDERS",
    after:
      "PARTITION BY starts the calculation again for each customer. Other useful window functions include RANK(), LAG(), and running SUM().",
    tip: "Use ROW_NUMBER when every row needs a unique position. Use RANK when ties should share a rank.",
  },
  {
    group: "DATABRICKS SQL",
    title: "Databricks SQL functions",
    time: "12 MIN",
    level: "DATABRICKS",
    intro:
      "Databricks SQL adds a rich built-in function library for strings, dates, arrays, JSON, statistics, and more. Learn the patterns and know which ones are portable.",
    task: "Summarize average product price by category. Use LOWER to normalize labels and ROUND for a readable average.",
    hint: "SELECT LOWER(category), ROUND(AVG(price), 2) ... GROUP BY LOWER(category).",
    query:
      "SELECT LOWER(category) AS category,\n       ROUND(AVG(price), 2) AS avg_price\nFROM products\nGROUP BY LOWER(category)\nORDER BY avg_price DESC;",
    heading: "A function for every kind of data",
    copy: "Functions transform values, work with missing data, parse semi-structured records, and calculate statistics. Databricks SQL includes common SQL functions plus Spark-specific functions for arrays, maps, JSON, and approximate analytics.",
    example:
      "SELECT LOWER(category) AS category,\n       ROUND(AVG(price), 2) AS avg_price\nFROM products\nGROUP BY LOWER(category);",
    caption: "PORTABLE SQL FUNCTIONS",
    after:
      "LOWER and ROUND are available in both SQLite and Databricks SQL, so this lesson query runs here. The reference examples below use Databricks SQL syntax; this browser runner uses SQLite and cannot execute every Databricks-specific function.",
    tip: "Start with the shared functions, then check Databricks SQL docs when a function uses arrays, JSON, dates, or approximate statistics.",
    functionGroups: [
      {
        name: "Strings & cleanup",
        items: [
          [
            "concat(expr1, expr2, …)",
            "Join values into one string. The local runner can run CONCAT too; || is SQLite’s portable equivalent.",
            `SELECT concat('Ada', ' ', 'Lovelace') AS full_name;`,
            `SELECT 'Ada' || ' ' || 'Lovelace' AS full_name;`,
          ],
          [
            "split(str, regex)",
            "Split text into an array. SQLite has no SPLIT function, so the local example extracts the part before @.",
            `SELECT split('ada@example.com', '@') AS email_parts;`,
            `SELECT substr('ada@example.com', 1, instr('ada@example.com', '@') - 1) AS email_name;`,
          ],
          [
            "regexp_extract(str, regex, idx)",
            "Extract a regex capture group. The SQLite equivalent uses string functions for this fixed code pattern.",
            `SELECT regexp_extract('ORD-4827-paid', '([A-Z]+)-', 1) AS order_prefix;`,
            `SELECT substr('ORD-4827-paid', 1, instr('ORD-4827-paid', '-') - 1) AS order_prefix;`,
          ],
          [
            "trim(str) · lower(str)",
            "Remove spaces or normalize case",
            `SELECT lower(trim('  Ada@Example.com  ')) AS clean_email;`,
            `SELECT lower(trim('  Ada@Example.com  ')) AS clean_email;`,
          ],
        ],
      },
      {
        name: "Dates & time",
        items: [
          [
            "date_add(date, days)",
            "Add or subtract whole days from a date.",
            `SELECT date_add(DATE '2025-02-10', 7) AS next_week;`,
            `SELECT date('2025-02-10', '+7 days') AS next_week;`,
          ],
          [
            "datediff(end, start)",
            "Return whole days between two dates. Databricks takes end date first.",
            `SELECT datediff(DATE '2025-02-18', DATE '2025-02-10') AS days_apart;`,
            `SELECT CAST(julianday('2025-02-18') - julianday('2025-02-10') AS INTEGER) AS days_apart;`,
          ],
          [
            "date_format(ts, fmt)",
            "Format a date or timestamp as text.",
            `SELECT date_format(TIMESTAMP '2025-02-10 09:30:00', 'yyyy-MM') AS month_label;`,
            `SELECT strftime('%Y-%m', '2025-02-10 09:30:00') AS month_label;`,
          ],
        ],
      },
      {
        name: "Nulls & safe conversion",
        items: [
          [
            "coalesce(a, b, …)",
            "First non-NULL value",
            `SELECT coalesce(NULL, NULL, 'Unknown') AS safe_label;`,
            `SELECT coalesce(NULL, NULL, 'Unknown') AS safe_label;`,
          ],
          [
            "try_cast(value AS type)",
            "Cast safely; malformed input becomes NULL instead of raising a conversion error.",
            `SELECT try_cast('42.50' AS DECIMAL(10,2)) AS converted_price;`,
            `WITH inputs(raw_value) AS (VALUES ('42.50'), ('oops'))
SELECT raw_value,
       CASE WHEN raw_value <> '' AND raw_value NOT GLOB '*[^0-9.]*'
            THEN CAST(raw_value AS REAL) END AS converted_price
FROM inputs;`,
          ],
          [
            "try_divide(a, b)",
            "Divide safely; zero returns NULL",
            `SELECT try_divide(10, 2) AS result, try_divide(5, 0) AS zero_case;`,
            `SELECT 10.0 / NULLIF(2, 0) AS result, 5.0 / NULLIF(0, 0) AS zero_case;`,
          ],
        ],
      },
      {
        name: "Arrays, JSON & analytics",
        items: [
          [
            "explode(array)",
            "Turn each array element into its own row.",
            `SELECT tag FROM (SELECT array('sql', 'spark') AS tags) AS source, LATERAL VIEW explode(tags) AS tag;`,
            `SELECT value AS tag FROM json_each('["sql", "spark"]');`,
          ],
          [
            "from_json(json, schema)",
            "Parse JSON using an explicit schema into a typed structure.",
            `SELECT from_json('{"id":7,"city":"west"}', 'id BIGINT, city STRING') AS event;`,
            `SELECT json_extract('{"id":7,"city":"west"}', '$.id') AS id,
       json_extract('{"id":7,"city":"west"}', '$.city') AS city;`,
          ],
          [
            "approx_count_distinct(expr)",
            "Estimate a distinct count efficiently. SQLite uses an exact count in this local equivalent.",
            `SELECT approx_count_distinct(user_id) AS estimated_users FROM VALUES (10), (10), (12) AS t(user_id);`,
            `WITH users(user_id) AS (VALUES (10), (10), (12))
SELECT COUNT(DISTINCT user_id) AS distinct_users FROM users;`,
          ],
          [
            "percentile_approx(value, p)",
            "Estimate a percentile. This local example selects the median from a small ordered sample.",
            `SELECT percentile_approx(duration_ms, 0.5) AS median_ms FROM VALUES (100), (200), (300), (400), (500) AS t(duration_ms);`,
            `WITH durations(value) AS (VALUES (100), (200), (300), (400), (500))
SELECT value AS median_ms FROM durations ORDER BY value LIMIT 1 OFFSET 2;`,
          ],
          [
            "max_by(value, order_by)",
            "Return the value from the row with the greatest ordering value. Here it finds the latest review action. If timestamps tie, the chosen value may be nondeterministic. SQLite has no max_by, so its example uses ROW_NUMBER instead.",
            `WITH review_actions AS (
  SELECT * FROM VALUES
    ('hash-001', 1, TIMESTAMP '2025-02-01 09:00:00', 'APPROVED', TIMESTAMP '2025-02-01 09:10:00'),
    ('hash-001', 1, TIMESTAMP '2025-02-01 09:00:00', 'REJECTED', TIMESTAMP '2025-02-01 09:12:00'),
    ('hash-002', 1, TIMESTAMP '2025-02-01 09:30:00', 'APPROVED', TIMESTAMP '2025-02-01 09:35:00')
    AS r(record_hash_id, model_version, prediction_timestamp, review_action, action_timestamp)
)
SELECT record_hash_id, model_version, prediction_timestamp,
       max_by(review_action, action_timestamp) AS latest_review_action,
       MAX(action_timestamp) AS latest_action_timestamp
FROM review_actions
GROUP BY record_hash_id, model_version, prediction_timestamp
ORDER BY record_hash_id;`,
            `WITH review_actions AS (
  SELECT 'hash-001' AS record_hash_id, 1 AS model_version,
         '2025-02-01 09:00:00' AS prediction_timestamp,
         'APPROVED' AS review_action, '2025-02-01 09:10:00' AS action_timestamp
  UNION ALL SELECT 'hash-001', 1, '2025-02-01 09:00:00', 'REJECTED', '2025-02-01 09:12:00'
  UNION ALL SELECT 'hash-002', 1, '2025-02-01 09:30:00', 'APPROVED', '2025-02-01 09:35:00'
), ranked_reviews AS (
  SELECT *, ROW_NUMBER() OVER (
    PARTITION BY record_hash_id, model_version, prediction_timestamp
    ORDER BY action_timestamp DESC
  ) AS row_num
  FROM review_actions
)
SELECT record_hash_id, model_version, prediction_timestamp,
       review_action AS latest_review_action,
       action_timestamp AS latest_action_timestamp
FROM ranked_reviews
WHERE row_num = 1
ORDER BY record_hash_id;`,
          ],
        ],
      },
    ],
  },
  {
    group: "DATABRICKS SQL",
    title: "SQL functions practice & examples",
    time: "20 MIN",
    level: "PRACTICE",
    intro: "Practice useful SQL functions with small examples. Each note explains what the function changes, and each example can be loaded and run locally.",
    task: "Show each product category in lowercase and its average price rounded to two decimal places.",
    hint: "Use LOWER(TRIM(category)) and ROUND(AVG(price), 2). Group by the same cleaned category expression.",
    query: `SELECT LOWER(TRIM(category)) AS category,
       ROUND(AVG(price), 2) AS average_price
FROM products
GROUP BY LOWER(TRIM(category))
ORDER BY category;`,
    heading: "Choose a function for the job",
    copy: "A scalar function transforms one value in each row, while an aggregate function summarizes values across rows. Function names can look similar across SQL engines, but argument order and available features can differ. Use the SQLite version in this local editor to practice the idea, then use the Databricks form in a Databricks warehouse.",
    example: `SELECT name, price,
       ROUND(price * 1.08, 2) AS price_with_tax
FROM products
ORDER BY price DESC
LIMIT 3;`,
    caption: "CLEAN AND SUMMARIZE",
    after: "Click an example to run its SQLite version. Compare the result, then change the input or filter and run it again. MAX_BY returns a value attached to the latest ordering value; it is not available in SQLite, so the local example uses ROW_NUMBER.",
    tip: "When a function returns an unexpected result, check its input type, NULL behavior, and argument order first.",
    guideTitle: "FUNCTION PRACTICE",
    guideNote: "EXPLANATION + RUNNABLE EXAMPLE",
    functionGroups: [
      {
        name: "String functions",
        items: [
          ["LOWER and TRIM", "LOWER changes text to lowercase. TRIM removes spaces at the beginning and end, which helps normalize labels before grouping.", `SELECT LOWER(TRIM('  Analytics  ')) AS clean_label;`, `SELECT LOWER(TRIM('  Analytics  ')) AS clean_label;`],
          ["CONCAT", "CONCAT joins pieces of text into one value. Use it to build a display label from separate fields. The local runner accepts CONCAT for Databricks practice; the portable SQLite form uses the || operator.", `SELECT CONCAT('SQL', ' practice') AS label;`, `SELECT 'SQL' || ' practice' AS label;`],
          ["REGEXP_EXTRACT", "REGEXP_EXTRACT returns the text captured by a regular-expression group. The local SQLite substitute below extracts the digits from this simple fixed pattern.", `SELECT regexp_extract('order-4827-paid', 'order-([0-9]+)', 1) AS order_id;`, `SELECT substr('order-4827-paid', 7, instr(substr('order-4827-paid', 7), '-') - 1) AS order_id;`],
        ],
      },
      {
        name: "Date and time functions",
        items: [
          ["DATE_ADD", "DATE_ADD moves a date forward or backward by a number of days. Databricks takes the date and day count; SQLite uses a date modifier string.", `SELECT date_add(DATE '2025-02-10', 7) AS next_week;`, `SELECT date('2025-02-10', '+7 days') AS next_week;`],
          ["DATEDIFF", "DATEDIFF returns the number of whole days between two dates. In Databricks, the end date comes first and the start date second.", `SELECT datediff(DATE '2025-02-18', DATE '2025-02-10') AS days_apart;`, `SELECT CAST(julianday('2025-02-18') - julianday('2025-02-10') AS INTEGER) AS days_apart;`],
          ["DATE_FORMAT", "DATE_FORMAT converts a date or timestamp to text using a format pattern. Databricks uses patterns like yyyy-MM; SQLite uses strftime tokens like %Y-%m.", `SELECT date_format(TIMESTAMP '2025-02-10 09:30:00', 'yyyy-MM') AS month_label;`, `SELECT strftime('%Y-%m', '2025-02-10 09:30:00') AS month_label;`],
        ],
      },
      {
        name: "NULL handling and safe conversion",
        items: [
          ["COALESCE", "COALESCE returns the first non-NULL value. Use it to supply a readable default when optional data is missing.", `SELECT COALESCE(NULL, NULL, 'Unknown') AS safe_label;`, `SELECT COALESCE(NULL, NULL, 'Unknown') AS safe_label;`],
          ["TRY_CAST", "TRY_CAST converts a value to a requested type and returns NULL when conversion fails, instead of stopping the query. The SQLite example uses CASE to safely convert unsigned integers.", `SELECT try_cast('42' AS INT) AS converted_value;`, `WITH inputs(raw_value) AS (VALUES ('42'), ('oops'))
SELECT raw_value,
       CASE WHEN raw_value <> '' AND raw_value NOT GLOB '*[^0-9]*'
            THEN CAST(raw_value AS INTEGER) END AS converted_value
FROM inputs;`],
          ["TRY_DIVIDE", "TRY_DIVIDE returns NULL when the divisor is zero. NULLIF provides the same safe-divide behavior in this SQLite example.", `SELECT try_divide(10, 2) AS result,
       try_divide(5, 0) AS zero_case;`, `SELECT 10 / NULLIF(2, 0) AS result,
       5 / NULLIF(0, 0) AS zero_case;`],
        ],
      },
      {
        name: "Arrays and JSON",
        items: [
          ["EXPLODE", "EXPLODE turns each array element into its own row. The local version uses json_each to expand a JSON array.", `SELECT tag
FROM (SELECT array('sql', 'spark') AS tags) AS source,
LATERAL explode(tags) AS expanded(tag);`, `SELECT value AS tag
FROM json_each('["sql", "spark"]');`],
          ["FROM_JSON", "FROM_JSON parses JSON into a typed structure using a schema. SQLite can access the same JSON fields, but it does not create a typed STRUCT.", `SELECT from_json('{"id": 7, "region": "west"}', 'id INT, region STRING') AS event;`, `SELECT json_object(
  'id', json_extract('{"id": 7, "region": "west"}', '$.id'),
  'region', json_extract('{"id": 7, "region": "west"}', '$.region')
) AS event;`],
          ["GET_JSON_OBJECT", "GET_JSON_OBJECT reads a value at a JSON path and returns it as text. SQLite's json_extract reads the same path for this local example.", `SELECT get_json_object('{"campaign":"spring"}', '$.campaign') AS campaign;`, `SELECT json_extract('{"campaign":"spring"}', '$.campaign') AS campaign;`],
        ],
      },
      {
        name: "Analytics functions",
        items: [
          ["APPROX_COUNT_DISTINCT", "This function estimates the number of distinct values and can be faster on large datasets. SQLite's COUNT(DISTINCT ...) gives an exact count for the local practice data.", `SELECT approx_count_distinct(user_id) AS estimated_users
FROM web_events;`, `SELECT COUNT(DISTINCT user_id) AS distinct_users
FROM web_events;`],
          ["PERCENTILE_APPROX", "PERCENTILE_APPROX estimates a percentile, such as the median at 0.5. The SQLite example computes the exact median for the small orders table.", `SELECT percentile_approx(total, 0.5) AS median_order_total
FROM orders;`, `WITH ranked AS (
  SELECT total,
         ROW_NUMBER() OVER (ORDER BY total) AS row_num,
         COUNT(*) OVER () AS row_count
  FROM orders
)
SELECT AVG(total) AS median_order_total
FROM ranked
WHERE row_num IN ((row_count + 1) / 2, (row_count + 2) / 2);`],
          ["MAX_BY", "MAX_BY returns the value from the row with the greatest ordering value. Here it returns the review action at the latest action timestamp. If timestamps tie, the selected value can be nondeterministic.", `WITH review_actions AS (
  SELECT * FROM VALUES
    ('hash-001', 'APPROVED', TIMESTAMP '2025-02-01 09:10:00'),
    ('hash-001', 'REJECTED', TIMESTAMP '2025-02-01 09:12:00'),
    ('hash-002', 'APPROVED', TIMESTAMP '2025-02-01 09:35:00')
    AS r(record_hash_id, review_action, action_timestamp)
)
SELECT record_hash_id,
       max_by(review_action, action_timestamp) AS latest_review_action,
       MAX(action_timestamp) AS latest_action_timestamp
FROM review_actions
GROUP BY record_hash_id
ORDER BY record_hash_id;`, `WITH review_actions AS (
  SELECT 'hash-001' AS record_hash_id, 'APPROVED' AS review_action, '2025-02-01 09:10:00' AS action_timestamp
  UNION ALL SELECT 'hash-001', 'REJECTED', '2025-02-01 09:12:00'
  UNION ALL SELECT 'hash-002', 'APPROVED', '2025-02-01 09:35:00'
), ranked AS (
  SELECT *, ROW_NUMBER() OVER (
    PARTITION BY record_hash_id ORDER BY action_timestamp DESC
  ) AS row_num
  FROM review_actions
)
SELECT record_hash_id, review_action AS latest_review_action,
       action_timestamp AS latest_action_timestamp
FROM ranked
WHERE row_num = 1
ORDER BY record_hash_id;`],
        ],
      },
    ],
  },
  {
    group: "ADVANCED PRACTICE",
    title: "Advanced join patterns",
    time: "16 MIN",
    level: "ADVANCING",
    intro:
      "Build multi-table answers without losing track of what each row represents. Learn outer joins, semi and anti joins, self joins, and how to prevent duplicate totals.",
    task: "Calculate each customer’s total item revenue. Join customers to orders to order items, then group at customer level.",
    hint: "Join customers.id to orders.customer_id and orders.id to order_items.order_id. Sum quantity * unit_price.",
    query:
      "SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS item_revenue\nFROM customers AS c\nJOIN orders AS o ON o.customer_id = c.id\nJOIN order_items AS oi ON oi.order_id = o.id\nGROUP BY c.id, c.name\nORDER BY item_revenue DESC;",
    heading: "Track the grain of every join",
    copy: "Grain means what one row represents. Customers joined to orders produce one row per order; adding order_items produces one row per item. That one-to-many expansion is expected, but summing an order total after the expansion repeats it for every item.",
    example:
      "WITH item_revenue AS (\n  SELECT order_id, SUM(quantity * unit_price) AS item_total\n  FROM order_items\n  GROUP BY order_id\n)\nSELECT c.name, SUM(ir.item_total) AS revenue\nFROM customers AS c\nJOIN orders AS o ON o.customer_id = c.id\nJOIN item_revenue AS ir ON ir.order_id = o.id\nGROUP BY c.id, c.name;",
    caption: "PRE-AGGREGATE TO AVOID FANOUT",
    after:
      "Choose INNER when both sides must match; LEFT when every left row must remain. FULL OUTER keeps unmatched rows from both sides, while CROSS creates every possible pair. Databricks also supports LEFT SEMI and LEFT ANTI joins for existence checks.",
    tip: "Before aggregating, ask: what does one output row represent? If a join multiplies rows, pre-aggregate a child table to the parent key first.",
    guideTitle: "ADVANCED JOIN PATTERNS",
    guideNote: "DATABRICKS + SQL",
    functionGroups: [
      {
        name: "Join and existence patterns",
        items: [
          [
            "INNER JOIN",
            "Return only matching order and customer pairs.",
            "SELECT c.name, o.id AS order_id\nFROM orders AS o\nJOIN customers AS c ON c.id = o.customer_id\nORDER BY o.id;",
          ],
          [
            "LEFT JOIN",
            "Keep all customers, including customers with no orders.",
            "SELECT c.name, o.id AS order_id\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nORDER BY c.id, o.id;",
          ],
          [
            "FULL OUTER JOIN",
            "Keep matches and unmatched rows on both sides.",
            "SELECT c.name, o.id AS order_id\nFROM customers AS c\nFULL OUTER JOIN orders AS o ON o.customer_id = c.id\nORDER BY c.id, o.id;",
          ],
          [
            "CROSS JOIN",
            "Generate each possible category/status pair.",
            "WITH categories AS (SELECT DISTINCT category FROM products),\nstatuses AS (SELECT DISTINCT status FROM orders)\nSELECT category, status\nFROM categories CROSS JOIN statuses\nORDER BY category, status;",
          ],
          [
            "SEMI JOIN · Databricks",
            "Return left-side rows that have a match; button loads the portable EXISTS form.",
            "SELECT c.id, c.name\nFROM customers AS c\nLEFT SEMI JOIN orders AS o ON o.customer_id = c.id;",
            "SELECT c.id, c.name\nFROM customers AS c\nWHERE EXISTS (SELECT 1 FROM orders AS o WHERE o.customer_id = c.id)\nORDER BY c.id;",
          ],
          [
            "ANTI JOIN · Databricks",
            "Return left-side rows without a match; button loads NOT EXISTS.",
            "SELECT c.id, c.name\nFROM customers AS c\nLEFT ANTI JOIN orders AS o ON o.customer_id = c.id;",
            "SELECT c.id, c.name\nFROM customers AS c\nWHERE NOT EXISTS (SELECT 1 FROM orders AS o WHERE o.customer_id = c.id)\nORDER BY c.id;",
          ],
        ],
      },
      {
        name: "Self, composite, and range joins",
        items: [
          [
            "Self join",
            "Pair customers who live in the same city without mirrored duplicates.",
            "SELECT a.name AS customer_a, b.name AS customer_b, a.city\nFROM customers AS a\nJOIN customers AS b ON b.city = a.city AND a.id < b.id\nORDER BY a.city;",
          ],
          [
            "Composite key",
            "Match both tenant_id and code in this small inline example.",
            "WITH a AS (SELECT 7 AS tenant_id, 'A' AS code, 'left' AS label),\nb AS (SELECT 7 AS tenant_id, 'A' AS code, 'right' AS label)\nSELECT a.label, b.label\nFROM a JOIN b ON a.tenant_id = b.tenant_id AND a.code = b.code;",
          ],
          [
            "Non-equi join",
            "Pair earlier/later orders for the same customer using a greater-than match.",
            "SELECT a.customer_id, a.id AS earlier_order, b.id AS later_order\nFROM orders AS a\nJOIN orders AS b ON b.customer_id = a.customer_id AND b.order_date > a.order_date\nORDER BY a.customer_id, a.order_date;",
          ],
          [
            "Range join",
            "Match products with prices within ten units of each other.",
            "SELECT a.name AS product_a, b.name AS product_b, a.price, b.price\nFROM products AS a\nJOIN products AS b ON a.id < b.id AND b.price BETWEEN a.price - 10 AND a.price + 10\nORDER BY a.price;",
          ],
        ],
      },
      {
        name: "Correctness and tuning",
        items: [
          [
            "Fanout example",
            "See how one order appears once per line item after a one-to-many join.",
            "SELECT o.id AS order_id, o.total AS order_total, oi.id AS item_id\nFROM orders AS o\nJOIN order_items AS oi ON oi.order_id = o.id\nORDER BY o.id, oi.id;",
          ],
          [
            "NULL-safe equality · Databricks",
            "The <=> operator treats two NULL values as equal; button loads SQLite IS.",
            "SELECT a.id, b.id\nFROM customers AS a\nJOIN customers AS b ON a.city <=> b.city AND a.id < b.id;",
            "SELECT a.id, b.id\nFROM customers AS a\nJOIN customers AS b ON a.city IS b.city AND a.id < b.id;",
          ],
          [
            "Broadcast hint · Databricks",
            "A hint can suggest broadcasting a small dimension table.",
            "SELECT /*+ BROADCAST(c) */ c.name, o.id AS order_id\nFROM orders AS o\nJOIN customers AS c ON c.id = o.customer_id;",
            "SELECT c.name, o.id AS order_id\nFROM orders AS o\nJOIN customers AS c ON c.id = o.customer_id;",
          ],
          [
            "EXPLAIN the join plan",
            "Databricks uses EXPLAIN FORMATTED; button loads the local SQLite plan query.",
            "EXPLAIN FORMATTED\nSELECT c.name, o.id\nFROM orders AS o JOIN customers AS c ON c.id = o.customer_id;",
            "EXPLAIN QUERY PLAN\nSELECT c.name, o.id\nFROM orders AS o JOIN customers AS c ON c.id = o.customer_id;",
          ],
        ],
      },
    ],
  },
  {
    group: "ADVANCED PRACTICE",
    title: "CASE, aliases & CTEs",
    time: "14 MIN",
    level: "ADVANCING",
    intro:
      "Use CASE WHEN THEN ELSE END to classify rows, AS to name the results, and WITH to break a large query into clear steps.",
    task: "Create a spending segment for each customer. Use a CTE for customer totals and CASE for VIP, Growing, or New.",
    hint: "Write WITH customer_metrics AS (...), then CASE WHEN spend >= 100 THEN ... WHEN spend >= 60 THEN ... ELSE ... END AS segment.",
    query:
      "WITH customer_metrics AS (\n  SELECT customer_id, COUNT(*) AS order_count, SUM(total) AS spend\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT c.name AS customer, m.order_count, ROUND(m.spend, 2) AS spend,\n       CASE\n         WHEN m.spend >= 100 THEN 'VIP'\n         WHEN m.spend >= 60 THEN 'Growing'\n         ELSE 'New'\n       END AS segment\nFROM customer_metrics AS m\nJOIN customers AS c ON c.id = m.customer_id\nORDER BY m.spend DESC;",
    heading: "Put conditions into a readable result",
    copy: "CASE evaluates branches from top to bottom. The first matching WHEN returns its THEN value. ELSE is the fallback; if you omit it and no branch matches, the result is NULL. END closes the expression.",
    example:
      "SELECT id, total,\n       CASE\n         WHEN total >= 100 THEN 'Large'\n         WHEN total >= 50 THEN 'Medium'\n         ELSE 'Small'\n       END AS order_band\nFROM orders\nORDER BY id;",
    caption: "WHEN → THEN → ELSE → END",
    after:
      "AS names a column expression (order_band), a table (orders AS o), or a CTE. WITH defines a named result for the query that follows it; it does not permanently create a table.",
    tip: "Put the most specific CASE condition first. Keep CASE branches the same data type, and include ELSE so unexpected values are visible.",
    guideTitle: "CASE, AS & WITH AT A GLANCE",
    guideNote: "CLAUSE GUIDE",
    functionGroups: [
      {
        name: "CASE expression",
        items: [
          [
            "CASE WHEN condition THEN value",
            "Return a value when a condition is true",
            "CASE WHEN stock = 0 THEN 'Out of stock'",
          ],
          [
            "WHEN",
            "Checks the next condition, in order",
            "WHEN price >= 50 THEN 'Premium'",
          ],
          ["THEN", "Supplies the value for a matching WHEN", "THEN 'Premium'"],
          [
            "ELSE",
            "Fallback when no WHEN matches",
            "ELSE 'Standard' END AS price_band",
          ],
        ],
      },
      {
        name: "Names & query steps",
        items: [
          [
            "AS column_alias",
            "Name a selected expression",
            "SUM(total) AS revenue",
          ],
          [
            "AS table_alias",
            "Short name for a table reference",
            "FROM order_items AS oi",
          ],
          [
            "WITH cte_name AS (...)",
            "Name a temporary query result",
            "WITH totals AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id)",
          ],
          [
            "WITH multiple CTEs",
            "Separate named steps with commas",
            "WITH a AS (...), b AS (...) SELECT ... FROM b",
          ],
        ],
      },
    ],
  },
  {
    group: "ADVANCED PRACTICE",
    title: "Recursive CTEs",
    time: "16 MIN",
    level: "ADVANCING",
    intro:
      "A recursive CTE repeatedly applies a query to its own previous result. Use it for hierarchies, date series, and graph-like paths.",
    task: "Generate a six-day date series. Use a recursive CTE with a clear stopping condition.",
    hint: "Start with DATE('2024-04-01'), UNION ALL one day after the prior row, and stop when day reaches April 6.",
    query:
      "WITH RECURSIVE dates(day) AS (\n  SELECT DATE('2024-04-01')\n  UNION ALL\n  SELECT DATE(day, '+1 day')\n  FROM dates\n  WHERE day < '2024-04-06'\n)\nSELECT day FROM dates;",
    heading: "Give recursion a base and a brake",
    copy: "A recursive CTE has an anchor query that starts the result and a recursive member that reads from the CTE and adds another step. The WHERE condition is the termination rule. Without a safe stopping condition, recursion can run too long or hit an engine limit.",
    example:
      "WITH RECURSIVE numbers(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM numbers WHERE n < 5\n)\nSELECT n FROM numbers;",
    caption: "ANCHOR → RECURSIVE MEMBER",
    after:
      "For a hierarchy, carry the current node and depth through each step, then join children where parent_id matches. SQLite runs this example locally. Databricks SQL supports recursive CTEs; Databricks Runtime requires version 17.0 or later. Recursion limits and supported clauses differ by engine.",
    tip: "Keep the recursive step narrow, add an explicit termination predicate, and use UNION instead of UNION ALL only when duplicate elimination is required.",
    guideTitle: "RECURSION CHECKLIST",
    guideNote: "ADVANCED SQL",
    functionGroups: [
      {
        name: "The two parts",
        items: [
          [
            "Anchor member",
            "Produces the starting row or rows",
            "SELECT 1 AS level",
          ],
          [
            "Recursive member",
            "Reads prior output and produces the next step",
            "SELECT level + 1 FROM levels WHERE level < 10",
          ],
          [
            "UNION ALL",
            "Stacks each recursive result onto the CTE",
            "anchor_query UNION ALL recursive_query",
          ],
          [
            "Termination rule",
            "Stops when no next rows satisfy the condition",
            "WHERE depth < 8",
          ],
        ],
      },
      {
        name: "Useful applications",
        items: [
          [
            "Date series",
            "Generate calendar rows for a bounded interval",
            "DATE(day, '+1 day')",
          ],
          [
            "Hierarchy walk",
            "Carry node_id, parent_id, and depth",
            "child.parent_id = tree.node_id",
          ],
          [
            "Path tracking",
            "Append each visited node to a path value",
            "path || '/' || child.id",
          ],
          [
            "Cycle safety",
            "Use a depth cap or visited-node check",
            "WHERE depth < 100",
          ],
        ],
      },
    ],
  },
  {
    group: "ADVANCED PRACTICE",
    title: "Window frames & analytics",
    time: "18 MIN",
    level: "ADVANCING",
    intro:
      "Window functions can look at a precise frame of neighboring rows. Combine frames with LAG, LEAD, and rankings for time-based analysis.",
    task: "Analyze order history by customer. Calculate running spend and show the previous order amount.",
    hint: "Use SUM(total) OVER (PARTITION BY customer_id ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), plus LAG(total).",
    query:
      "SELECT customer_id, id AS order_id, order_date, total,\n       SUM(total) OVER (\n         PARTITION BY customer_id\n         ORDER BY order_date, id\n         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n       ) AS running_spend,\n       LAG(total) OVER (\n         PARTITION BY customer_id\n         ORDER BY order_date, id\n       ) AS previous_order\nFROM orders\nORDER BY customer_id, order_date, id;",
    heading: "Define exactly which rows count",
    copy: "PARTITION BY separates independent groups. ORDER BY establishes sequence inside each group. A frame clause chooses which rows around the current row participate in an aggregate window function.",
    example:
      "SELECT customer_id, id AS order_id, order_date, total,\n       SUM(total) OVER (\n         PARTITION BY customer_id\n         ORDER BY order_date, id\n         ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n       ) AS recent_three_orders\nFROM orders\nORDER BY customer_id, order_date, id;",
    caption: "A MOVING THREE-ROW TOTAL",
    after:
      "ROWS counts physical rows. RANGE groups peers with the same ordering value. Specify a deterministic tie-breaker such as id when sequence matters; engine defaults for frames can otherwise change the result.",
    tip: "Use LAG and LEAD to compare a row with its neighbors. Use ROW_NUMBER for a unique sequence, RANK for ties with gaps, and DENSE_RANK for ties without gaps.",
    guideTitle: "WINDOW FRAME PATTERNS",
    guideNote: "ADVANCED SQL",
    functionGroups: [
      {
        name: "Frame boundaries",
        items: [
          [
            "UNBOUNDED PRECEDING",
            "Start at the first row in the partition",
            "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
          ],
          [
            "n PRECEDING / FOLLOWING",
            "Use a fixed number of nearby rows",
            "ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING",
          ],
          [
            "CURRENT ROW",
            "Include the row being calculated",
            "... AND CURRENT ROW",
          ],
          [
            "UNBOUNDED FOLLOWING",
            "Extend through the final row in the partition",
            "ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING",
          ],
        ],
      },
      {
        name: "Neighbor & rank tools",
        items: [
          [
            "LAG(value, offset)",
            "Read a prior row in the ordered partition",
            "LAG(total, 1) OVER (PARTITION BY customer_id ORDER BY order_date)",
          ],
          [
            "LEAD(value, offset)",
            "Read a later row",
            "LEAD(order_date, 1) OVER (...)",
          ],
          [
            "RANK()",
            "Tied values share a rank and leave gaps",
            "RANK() OVER (ORDER BY total DESC)",
          ],
          [
            "DENSE_RANK()",
            "Tied values share a rank with no gaps",
            "DENSE_RANK() OVER (ORDER BY total DESC)",
          ],
        ],
      },
    ],
  },
  {
    group: "ADVANCED PRACTICE",
    title: "Execution plans & tuning",
    time: "18 MIN",
    level: "ADVANCING",
    intro:
      "A correct query can still be expensive. Read a query plan, reduce unnecessary work, and tune joins and filters based on evidence.",
    task: "Inspect the plan for an orders-to-customers query filtered by date. Run EXPLAIN QUERY PLAN and look at the steps.",
    hint: "Prefix the SELECT with EXPLAIN QUERY PLAN. Databricks uses EXPLAIN with modes such as FORMATTED.",
    query:
      "EXPLAIN QUERY PLAN\nSELECT c.name, o.order_date, o.total\nFROM orders AS o\nJOIN customers AS c ON c.id = o.customer_id\nWHERE o.order_date >= '2024-02-01'\nORDER BY o.order_date;",
    heading: "Measure the work before tuning",
    copy: "An execution plan describes how an engine expects to read, filter, join, and sort data. This sandbox uses SQLite, so EXPLAIN QUERY PLAN shows SQLite details. Databricks has its own EXPLAIN output and distributed execution model.",
    example:
      "EXPLAIN QUERY PLAN\nSELECT id, order_date, total\nFROM orders\nWHERE total >= 50\nORDER BY total DESC;",
    caption: "RUNNABLE SQLITE PLAN INSPECTION",
    after:
      "Project only needed columns, filter early when semantics allow, and join on the correct keys. In Databricks, consider partition pruning, data skipping, file sizes, skew, and broadcast eligibility; an index is not the main tuning mechanism for Delta tables.",
    tip: "Change one thing at a time and compare plans and runtime on representative data. Do not add hints or indexes without a measured bottleneck.",
    guideTitle: "TUNING CHECKLIST",
    guideNote: "PLAN FIRST",
    functionGroups: [
      {
        name: "Lower the amount of work",
        items: [
          [
            "Select needed columns",
            "Avoid carrying wide rows through joins",
            "SELECT customer_id, total FROM orders",
          ],
          [
            "Filter precisely",
            "Use selective predicates and keep types aligned",
            "WHERE order_date >= DATE '2024-02-01'",
          ],
          [
            "Aggregate early",
            "Reduce child rows before a one-to-many join",
            "GROUP BY order_id before joining order totals",
          ],
          [
            "Avoid accidental cross joins",
            "Check every join has the intended condition",
            "ON a.key = b.key",
          ],
        ],
      },
      {
        name: "Databricks considerations",
        items: [
          [
            "EXPLAIN FORMATTED",
            "Inspect physical and logical plan details",
            "EXPLAIN FORMATTED SELECT ...",
          ],
          [
            "Partition pruning",
            "Filter on partition columns when appropriate",
            "WHERE event_date >= DATE '2024-01-01'",
          ],
          [
            "Data skew",
            "Look for a few keys dominating the work",
            "Measure key frequency before tuning",
          ],
          [
            "Broadcast join",
            "Can help when one side is genuinely small",
            "/*+ BROADCAST(dim) */",
          ],
        ],
      },
    ],
  },
  {
    group: "ADVANCED PRACTICE",
    title: "Transactions & safe changes",
    time: "15 MIN",
    level: "ADVANCING",
    intro:
      "Transactions group multiple changes into one logical unit. Practice checking a change and rolling it back before committing it.",
    task: "Test a price change safely. Raise one product price inside a transaction, inspect it, then undo with ROLLBACK.",
    hint: "Run BEGIN, UPDATE, SELECT, and ROLLBACK in order. The final SELECT confirms the original price is back.",
    query:
      "BEGIN;\nUPDATE products SET price = price + 1 WHERE id = 2;\nSELECT id, name, price FROM products WHERE id = 2;\nROLLBACK;\nSELECT id, name, price FROM products WHERE id = 2;",
    heading: "Make a change reversible",
    copy: "A transaction groups statements so they succeed or fail together. COMMIT keeps the changes; ROLLBACK discards the work since the transaction began. This is useful when a multi-step update needs a safety check.",
    example:
      "BEGIN;\nUPDATE orders SET status = 'review'\nWHERE id = 3;\nSELECT id, status FROM orders WHERE id = 3;\nROLLBACK;",
    caption: "INSPECT, THEN ROLLBACK",
    after:
      "ACID describes atomicity, consistency, isolation, and durability. Exact transaction behavior, isolation levels, and supported DDL differ across SQLite, Databricks SQL warehouses, and streaming contexts.",
    tip: "Before a destructive update or delete, write the matching SELECT with the same WHERE clause. Confirm the rows first, then run the change inside a transaction when supported.",
    guideTitle: "TRANSACTION COMMANDS",
    guideNote: "SAFE PRACTICE",
    functionGroups: [
      {
        name: "Core commands",
        items: [
          ["BEGIN", "Start a transaction", "BEGIN;"],
          ["COMMIT", "Keep changes made in the transaction", "COMMIT;"],
          ["ROLLBACK", "Undo uncommitted changes", "ROLLBACK;"],
          [
            "SAVEPOINT name",
            "Set a point for partial rollback",
            "SAVEPOINT before_step;",
          ],
        ],
      },
      {
        name: "Safe workflow",
        items: [
          [
            "1 · Preview",
            "Check the exact rows first",
            "SELECT * FROM products WHERE id = 2;",
          ],
          [
            "2 · Change",
            "Use a narrow, reviewed predicate",
            "UPDATE products SET price = 20 WHERE id = 2;",
          ],
          [
            "3 · Verify",
            "Read the affected rows inside the transaction",
            "SELECT id, price FROM products WHERE id = 2;",
          ],
          [
            "4 · Decide",
            "Commit to keep or roll back to undo",
            "COMMIT;  -- or ROLLBACK;",
          ],
        ],
      },
    ],
  },
];
const tables = {
  customers: {
    rows: 6,
    cols: [
      ["id", "INTEGER", "PK"],
      ["name", "TEXT"],
      ["email", "TEXT"],
      ["city", "TEXT"],
      ["joined_on", "TEXT"],
    ],
  },
  products: {
    rows: 6,
    cols: [
      ["id", "INTEGER", "PK"],
      ["name", "TEXT"],
      ["category", "TEXT"],
      ["price", "REAL"],
      ["stock", "INTEGER"],
    ],
  },
  orders: {
    rows: 6,
    cols: [
      ["id", "INTEGER", "PK"],
      ["customer_id", "INTEGER"],
      ["order_date", "TEXT"],
      ["total", "REAL"],
      ["status", "TEXT"],
    ],
  },
  order_items: {
    rows: 10,
    cols: [
      ["id", "INTEGER", "PK"],
      ["order_id", "INTEGER"],
      ["product_id", "INTEGER"],
      ["quantity", "INTEGER"],
      ["unit_price", "REAL"],
    ],
  },
};
