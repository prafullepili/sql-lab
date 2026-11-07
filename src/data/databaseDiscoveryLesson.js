export const databaseDiscoveryLesson = {
  group: 'DATABRICKS SQL', title: 'Explore catalogs, schemas & columns', time: '10 MIN', level: 'BUILDING',
  intro: 'Find where data lives, list the tables in a schema, and inspect a table’s column names and types before writing a query.',
  task: 'Show the column names and data types for the local products table, in their original order.',
  hint: 'SQLite exposes table metadata through pragma_table_info. Select name and type, then order by cid.',
  query: `SELECT name AS column_name, type AS data_type
FROM pragma_table_info('products')
ORDER BY cid;`,
  heading: 'Locate the object, then inspect its shape',
  copy: 'Databricks with Unity Catalog uses a three-part object name: catalog.schema.table. SHOW CATALOGS lists catalogs, SHOW SCHEMAS (or its alias SHOW DATABASES) lists schemas, and SHOW TABLES lists tables in a schema. SHOW COLUMNS or DESCRIBE TABLE reveals a table’s columns and types.',
  example: `SELECT name AS table_name, type AS object_type
FROM sqlite_master
WHERE type IN ('table', 'view')
  AND name NOT LIKE 'sqlite_%'
ORDER BY type, name;`,
  caption: 'RUNNABLE SQLITE VERSION · LIST LOCAL TABLES AND VIEWS',
  after: 'SQLite does not use Databricks’ catalog.schema.table hierarchy. Its attached databases are listed with PRAGMA database_list, and its table metadata is available through pragma_table_info. These are local equivalents for practice, not identical namespace systems.',
  tip: 'SHOW SCHEMAS and SHOW DATABASES are interchangeable in Databricks; prefer SHOW SCHEMAS. SHOW COLUMNS IN table IN schema lists the column names, while DESCRIBE TABLE also includes types and comments.',
  guideTitle: 'FIND DATABASE OBJECTS', guideNote: 'CATALOG · SCHEMA · TABLE · COLUMN',
  functionGroups: [
    { name: 'Catalogs and schemas', items: [
      ['SHOW CATALOGS', 'List catalogs available to your Databricks identity and workspace.', `SHOW CATALOGS;`, `PRAGMA database_list;`],
      ['SHOW SCHEMAS / SHOW DATABASES', 'List schemas in the current catalog. DATABASES is a supported alias; SCHEMAS is preferred.', `SHOW SCHEMAS IN main;`, `PRAGMA database_list;`],
      ['USE CATALOG and USE SCHEMA', 'Choose the current namespace so unqualified table names resolve from the intended location.', `USE CATALOG main;
USE SCHEMA analytics;`, `SELECT 'SQLite uses main/temp databases rather than a catalog and schema path.' AS namespace_note;`],
    ]},
    { name: 'Tables and columns', items: [
      ['SHOW TABLES', 'List tables in a schema; use LIKE to narrow the names.', `SHOW TABLES IN analytics LIKE 'order*';`, `SELECT name AS table_name, type AS object_type
FROM sqlite_master
WHERE type IN ('table', 'view')
  AND name NOT LIKE 'sqlite_%'
ORDER BY name;`],
      ['SHOW COLUMNS', 'Return just the column names for a table in a schema.', `SHOW COLUMNS IN orders IN analytics;`, `SELECT name AS column_name
FROM pragma_table_info('orders')
ORDER BY cid;`],
      ['DESCRIBE TABLE', 'Inspect column names, types, and comments. Use this when you need more than the names alone.', `DESCRIBE TABLE main.analytics.orders;`, `SELECT name AS column_name, type AS data_type
FROM pragma_table_info('orders')
ORDER BY cid;`],
    ]},
  ],
};
