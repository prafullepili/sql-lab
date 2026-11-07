const group = 'DATABRICKS ECOSYSTEM';

export const ecosystemLessons = [
  {
    group, title: 'Delta Sharing & secure data exchange', time: '18 MIN', level: 'ADVANCED',
    intro: 'Share selected, governed data with another organization through an open protocol. Learn the provider workflow and how to limit the shared surface area.',
    task: 'Summarize event counts and total amounts by region and event type.',
    hint: 'Start from web_events, group by region and event_type, and keep direct identifiers out of your result.',
    query: `SELECT region, event_type,
       COUNT(*) AS event_count,
       ROUND(SUM(amount), 2) AS total_amount
FROM web_events
GROUP BY region, event_type
ORDER BY region, event_count DESC;`,
    heading: 'Grant access to a curated share',
    copy: 'A provider creates a share, adds supported data assets, creates a recipient, and grants that recipient SELECT on the share. A recipient reads the authorized assets through Delta Sharing without the provider making a separate managed table copy. Use a curated view when a partner should see only selected columns or rows, and review the recipient protocol and storage access requirements before sharing.',
    example: `SELECT event_date, COUNT(DISTINCT user_id) AS active_users
FROM web_events
GROUP BY event_date
ORDER BY active_users DESC
LIMIT 14;`,
    caption: 'RUNNABLE SQLITE VERSION · PARTNER METRIC PREVIEW',
    after: 'The local editor can preview the data shape, but it cannot create a Unity Catalog share or grant an external recipient access. Use the Databricks snippets as provider-side reference commands.',
    tip: 'Share a deliberately scoped view when the recipient should not receive every source column. Treat activation links and recipient credentials as secrets.',
    glanceLabel: 'Preview data before sharing',
    glanceExplanation: 'Inspect the partner-facing aggregate locally first. In Databricks, expose a governed asset through a share and grant only the intended recipient.',
    functionGroups: [{ name: 'Provider workflow and safe scope', items: [
      ['CREATE SHARE', 'Create a named container for assets approved for external access.', `CREATE SHARE IF NOT EXISTS partner_metrics
COMMENT 'Curated regional event metrics';`, `SELECT region, event_type, COUNT(*) AS event_count
FROM web_events
GROUP BY region, event_type
ORDER BY event_count DESC;`],
      ['Add an approved view', 'Add a view that exposes only the columns and rows the partner needs.', `ALTER SHARE partner_metrics
ADD TABLE main.partner.vw_regional_event_metrics;`, `SELECT region, event_type, COUNT(*) AS event_count
FROM web_events
GROUP BY region, event_type;`],
      ['Create recipient and grant access', 'Create a recipient, share its activation flow securely, then grant access to this share.', `CREATE RECIPIENT IF NOT EXISTS analytics_partner
COMMENT 'External analytics partner';

GRANT SELECT ON SHARE partner_metrics
TO RECIPIENT analytics_partner;`, `SELECT event_type, COUNT(*) AS event_count
FROM web_events
GROUP BY event_type
ORDER BY event_count DESC;`],
      ['Review share contents', 'Verify exactly which assets are exposed before and after changing a share.', `SHOW ALL IN SHARE partner_metrics;
DESCRIBE SHARE partner_metrics;`, `SELECT region, COUNT(*) AS events
FROM web_events
GROUP BY region
ORDER BY events DESC;`],
    ] }],
  },
  {
    group, title: 'Lakehouse Federation & external sources', time: '20 MIN', level: 'ADVANCED',
    intro: 'Query supported external databases through Unity Catalog without first copying their tables into the lakehouse. Compare pushdown, remote load, network latency, and ingestion tradeoffs.',
    task: 'Filter events to a recent date range before calculating count and average amount by region.',
    hint: 'Apply a selective date predicate before the GROUP BY. In Databricks, inspect EXPLAIN FORMATTED to see what the connector pushes down.',
    query: `SELECT region, COUNT(*) AS recent_events,
       ROUND(AVG(amount), 2) AS average_amount
FROM web_events
WHERE event_date >= '2025-03-01'
GROUP BY region
ORDER BY recent_events DESC;`,
    heading: 'Connect once; query through a foreign catalog',
    copy: 'Lakehouse Federation uses a Unity Catalog connection and foreign catalog to provide governed, read-only access to supported sources. Databricks can push supported filters and operations to the remote database; unsupported expressions may execute in Databricks after rows cross the connection. Pushdown support varies by connector, and remote database capacity, network distance, and result size affect latency.',
    example: `SELECT category, ROUND(AVG(price), 2) AS average_price,
       COUNT(*) AS product_count
FROM products
GROUP BY category
ORDER BY product_count DESC;`,
    caption: 'RUNNABLE SQLITE VERSION · REMOTE QUERY SHAPE',
    after: 'This browser query runs against its local SQLite sample and has no remote connection. In Databricks, use the qualified foreign catalog name and check the physical plan and query profile before assuming an operation was pushed down.',
    tip: 'Federation is useful for live, read-only exploration and hybrid access. For repeatedly queried large datasets or lower-latency analytics, compare it with an ingestion pipeline.',
    glanceLabel: 'Reduce remote rows early',
    glanceExplanation: 'A selective filter can reduce data returned from a source. The actual pushdown depends on the source connector and the specific expression.',
    functionGroups: [{ name: 'Connections, catalogs, and pushdown', items: [
      ['CREATE CONNECTION', 'Store the remote endpoint and reference credentials from a secret scope.', `CREATE CONNECTION pg_sales
TYPE POSTGRESQL
OPTIONS (
  host 'postgres.example.net',
  port '5432',
  user secret('prod-db', 'username'),
  password secret('prod-db', 'password')
);`, `SELECT status, COUNT(*) AS order_count
FROM orders
GROUP BY status
ORDER BY order_count DESC;`],
      ['CREATE FOREIGN CATALOG', 'Register a remote database as a read-only catalog governed through Unity Catalog.', `CREATE FOREIGN CATALOG pg_sales_catalog
USING CONNECTION pg_sales
OPTIONS (database 'salesdb');`, `SELECT c.city, COUNT(*) AS customer_count
FROM customers AS c
GROUP BY c.city
ORDER BY customer_count DESC;`],
      ['Query external data', 'Use a three-part foreign catalog name; grants on the catalog and its objects still apply.', `SELECT region, COUNT(*) AS event_count
FROM pg_sales_catalog.public.events
WHERE event_date >= DATE '2025-03-01'
GROUP BY region;`, `SELECT region, COUNT(*) AS event_count
FROM web_events
WHERE event_date >= '2025-03-01'
GROUP BY region;`],
      ['Inspect pushdown', 'Review the plan to determine which scans and predicates execute at the source.', `EXPLAIN FORMATTED
SELECT region, COUNT(*)
FROM pg_sales_catalog.public.events
WHERE event_date >= DATE '2025-03-01'
GROUP BY region;`, `EXPLAIN QUERY PLAN
SELECT region, COUNT(*)
FROM web_events
WHERE event_date >= '2025-03-01'
GROUP BY region;`],
    ] }],
  },
  {
    group, title: 'Unity Catalog lineage & audit', time: '19 MIN', level: 'ADVANCED',
    intro: 'Trace upstream and downstream table dependencies, inspect column lineage, and query audit events to investigate who performed an action and when.',
    task: 'Count lineage events and find the latest activity date for each creator.',
    hint: 'For lineage, group by created_by and target. For audit review, filter by event date and service before sorting by event time.',
    query: `WITH lineage(source_name, target_name, created_by, event_date) AS (
  VALUES
    ('bronze.orders', 'silver.orders', 'ana', '2025-03-01'),
    ('silver.orders', 'gold.revenue', 'lee', '2025-03-02'),
    ('silver.customers', 'gold.revenue', 'lee', '2025-03-02'),
    ('bronze.returns', 'silver.returns', 'ana', '2025-03-03')
)
SELECT created_by, COUNT(*) AS lineage_events,
       MAX(event_date) AS latest_event
FROM lineage
GROUP BY created_by
ORDER BY latest_event DESC;`,
    heading: 'Use lineage for dependencies and audit logs for actions',
    copy: 'Unity Catalog captures lineage for supported Databricks queries on registered assets and can show table, column, and workload dependencies. Audit logs answer a different question: which identity performed an action, through which service, and at what time. Lineage system tables provide queryable read/write records; Catalog Explorer offers an interactive graph. Coverage depends on supported workloads and permissions.',
    example: `WITH audit_events(event_date, event_time, user_email, service_name, action_name) AS (
  VALUES
    ('2025-03-04', '09:12:00', 'ana@example.com', 'unityCatalog', 'getTable'),
    ('2025-03-04', '09:18:00', 'lee@example.com', 'unityCatalog', 'grantPermission'),
    ('2025-03-05', '11:30:00', 'ana@example.com', 'sql', 'runStatement')
)
SELECT event_date, user_email, service_name, action_name
FROM audit_events
WHERE service_name = 'unityCatalog'
ORDER BY event_date DESC, event_time DESC;`,
    caption: 'RUNNABLE SQLITE VERSION · AUDIT EVENT TRIAGE',
    after: 'The local examples use inline rows to teach dependency and audit query shapes. They do not inspect real Unity Catalog events. System-table availability, permissions, and retention are managed by the Databricks account.',
    tip: 'Filter lineage tables by event_date for efficient history queries. The lineage system tables retain a rolling 395-day window by default; verify permissions before exposing audit details.',
    glanceLabel: 'Follow dependencies upstream',
    glanceExplanation: 'A source-to-target edge tells you which upstream objects contributed to an output. Use the lineage graph for impact analysis and the audit table for identity and action history.',
    functionGroups: [{ name: 'Lineage and audit query patterns', items: [
      ['Table lineage', 'Find source-to-target dependencies and the workload user.', `SELECT source_table_full_name, target_table_full_name,
       created_by, event_time, direct_access
FROM system.access.table_lineage
WHERE event_date >= DATE_SUB(CURRENT_DATE(), 30)
  AND target_table_full_name = 'main.analytics.daily_revenue'
ORDER BY event_time DESC;`, `WITH edges(source_name, target_name) AS (
  VALUES ('silver.orders', 'gold.daily_revenue'),
         ('silver.customers', 'gold.daily_revenue')
)
SELECT source_name, target_name
FROM edges
WHERE target_name = 'gold.daily_revenue';`],
      ['Column lineage', 'Trace which source columns contribute to a target column.', `SELECT source_table_full_name, source_column_name,
       target_table_full_name, target_column_name,
       created_by, event_time
FROM system.access.column_lineage
WHERE event_date >= DATE_SUB(CURRENT_DATE(), 30)
  AND target_column_name = 'revenue'
ORDER BY event_time DESC;`, `WITH columns(source_table, source_column, target_table, target_column) AS (
  VALUES ('silver.orders', 'amount', 'gold.revenue', 'revenue'),
         ('silver.returns', 'amount', 'gold.revenue', 'revenue')
)
SELECT source_table, source_column, target_table, target_column
FROM columns WHERE target_column = 'revenue';`],
      ['Audit an identity action', 'Filter the audit system table by partition date, service, and actor.', `SELECT event_date, event_time, user_identity.email AS actor,
       service_name, action_name, request_id
FROM system.access.audit
WHERE event_date >= DATE_SUB(CURRENT_DATE(), 7)
  AND service_name = 'unityCatalog'
ORDER BY event_time DESC
LIMIT 100;`, `WITH audit_events(event_date, event_time, actor, service_name, action_name) AS (
  VALUES ('2025-03-04', '09:12:00', 'ana@example.com', 'unityCatalog', 'getTable'),
         ('2025-03-04', '09:18:00', 'lee@example.com', 'unityCatalog', 'grantPermission')
)
SELECT event_date, event_time, actor, action_name
FROM audit_events
WHERE service_name = 'unityCatalog'
ORDER BY event_time DESC;`],
      ['Column-level access review', 'Use table and column grants to explain why an audit or lineage view may be masked.', `SHOW GRANTS ON CATALOG main;
SHOW GRANTS ON SCHEMA main.analytics;
SHOW GRANTS ON TABLE main.analytics.daily_revenue;`, `SELECT region, COUNT(*) AS event_count
FROM web_events
GROUP BY region
ORDER BY event_count DESC;`],
    ] }],
  },
  {
    group, title: 'Databricks SQL projects & CI/CD', time: '20 MIN', level: 'ADVANCED',
    intro: 'Version SQL and project configuration, validate changes, run data checks, and promote a tested bundle through isolated environments.',
    task: 'Find order rows with a missing customer, a missing total, or a negative total.',
    hint: 'Return only invalid records so a passing data-quality check returns zero rows. Keep environment-specific catalogs and warehouse settings in target configuration.',
    query: `SELECT id AS order_id, customer_id, total, status
FROM orders
WHERE customer_id IS NULL
   OR total IS NULL
   OR total < 0
ORDER BY id;`,
    heading: 'Promote reviewed SQL with repeatable deployments',
    copy: 'Keep SQL source and deployment configuration in Git. Use Git folders for collaboration and Declarative Automation Bundles (formerly Databricks Asset Bundles) to define, validate, deploy, and run project resources across named targets. A reliable promotion path runs checks against a development target, reviews the change, deploys to staging, then promotes the same reviewed commit to production. Keep credentials in secret management rather than source control.',
    example: `SELECT status, COUNT(*) AS order_count,
       ROUND(SUM(total), 2) AS order_total
FROM orders
GROUP BY status
ORDER BY order_total DESC;`,
    caption: 'RUNNABLE SQLITE VERSION · PRE-DEPLOYMENT CHECK',
    after: 'This query validates local sample data only; it does not deploy assets. Bundle CLI commands and Git workflows run in a configured Databricks project and workspace.',
    tip: 'Declarative Automation Bundles include targets and resource definitions. Use different catalogs, schemas, and warehouse settings per environment, and never commit tokens or passwords.',
    glanceLabel: 'Fail fast on invalid rows',
    glanceExplanation: 'A validation query that returns zero rows can act as a simple gate. Add richer tests for keys, duplicates, freshness, and accepted values as the project matures.',
    functionGroups: [{ name: 'Version, validate, and promote', items: [
      ['Initialize a SQL project', 'Start from the Databricks default SQL bundle template, then commit the generated project to Git.', `databricks bundle init default-sql`, `SELECT COUNT(*) AS invalid_orders
FROM orders
WHERE customer_id IS NULL OR total < 0;`],
      ['Validate a target', 'Check bundle configuration and target-specific substitutions before deploying.', `databricks bundle validate -t dev`, `SELECT id, customer_id, total
FROM orders
WHERE customer_id IS NULL OR total < 0;`],
      ['Deploy to a non-production target', 'Deploy the validated project to an isolated development workspace target.', `databricks bundle deploy -t dev`, `SELECT status, COUNT(*) AS order_count
FROM orders
GROUP BY status
ORDER BY order_count DESC;`],
      ['Promote the reviewed commit', 'Use a protected CI/CD workflow to deploy that reviewed revision to staging, then production.', `# Example promotion stages
databricks bundle validate -t staging
databricks bundle deploy -t staging
# After approval:
databricks bundle deploy -t prod`, `SELECT event_type, COUNT(*) AS event_count
FROM web_events
GROUP BY event_type
ORDER BY event_count DESC;`],
    ] }],
  },
];
