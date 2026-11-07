import { lessons as foundations } from './basicLessons.js';
import { advancedLessons } from './advancedLessons.js';
import { databricksLessons } from './databricksLessons.js';
import { operationsLessons } from './operationsLessons.js';
import { ecosystemLessons } from './ecosystemLessons.js';
import { coreGapLessons } from './coreGapLessons.js';
import { functionGapLessons } from './functionGapLessons.js';
import { databricksGapLessons } from './databricksGapLessons.js';
import { databaseDiscoveryLesson } from './databaseDiscoveryLesson.js';
import { curriculumGapLessons } from './curriculumGapLessons.js';

// Keep the unmodified order available so saved numeric progress can be migrated
// when new lessons are placed into the learning sequence.
export const previousLessonTitles = [...foundations, ...advancedLessons, ...databricksLessons, ...operationsLessons, ...ecosystemLessons].map((lesson) => lesson.title);

function insertLessonsAfter(source, additions) {
  const result = [];
  for (const lesson of source) {
    result.push(lesson);
    result.push(...(additions[lesson.title] || []));
  }
  return result;
}

const orderedFoundationsV2 = insertLessonsAfter(foundations.map((lesson) => ({ ...lesson })), {
  'Filter rows': [coreGapLessons[0]],
  'Summarize data': [coreGapLessons[1], coreGapLessons[2]],
  'Multi-table joins & grain': [coreGapLessons[3], coreGapLessons[4]],
  'SQL functions practice & examples': functionGapLessons,
});
const orderedOperations = insertLessonsAfter(operationsLessons, {
  'Delta table maintenance & clustering': [databricksGapLessons[0]],
  'SQL warehouse sizing & cost controls': databricksGapLessons.slice(1),
});
export const courseOrderTitlesV2 = [...orderedFoundationsV2, ...advancedLessons, ...databricksLessons, ...orderedOperations, ...ecosystemLessons].map((lesson) => lesson.title);
const orderedFoundationsV3 = insertLessonsAfter(orderedFoundationsV2, {
  'Databricks SQL functions': [databaseDiscoveryLesson],
});
export const courseOrderTitlesV3 = [...orderedFoundationsV3, ...advancedLessons, ...databricksLessons, ...orderedOperations, ...ecosystemLessons].map((lesson) => lesson.title);
const orderedFoundations = insertLessonsAfter(orderedFoundationsV3, {
  'Choose your columns': [curriculumGapLessons[0]],
  'Explore catalogs, schemas & columns': [curriculumGapLessons[3]],
  'Window frames & analytics': [curriculumGapLessons[2]],
});
const orderedAdvanced = insertLessonsAfter(advancedLessons, {
  'PIVOT, UNPIVOT & conditional aggregation': [curriculumGapLessons[1]],
});
const orderedDatabricks = insertLessonsAfter(databricksLessons, {
  'SQL UDFs & reusable logic': [curriculumGapLessons[4]],
});

const previousCourseOrder = [...orderedFoundations, ...orderedAdvanced, ...orderedDatabricks, ...orderedOperations, ...ecosystemLessons];
export const courseOrderTitlesV4 = previousCourseOrder.map((lesson) => lesson.title);

const databricksIntroTitles = new Set([
  'Databricks SQL functions',
  'Explore catalogs, schemas & columns',
  'Create and manage schemas',
  'SQL functions practice & examples',
  'Higher-order arrays & time functions',
  'QUALIFY window results',
]);
const coreFoundations = orderedFoundations.filter((lesson) => !databricksIntroTitles.has(lesson.title));
const databricksSqlLessons = orderedFoundations.filter((lesson) => databricksIntroTitles.has(lesson.title));

export const lessons = [
  ...coreFoundations,
  ...orderedAdvanced,
  ...databricksSqlLessons,
  ...orderedDatabricks,
  ...orderedOperations,
  ...ecosystemLessons,
];

export const tables = {
  customers: { rows: 6, cols: [['id', 'INTEGER', 'PK'], ['name', 'TEXT'], ['email', 'TEXT'], ['city', 'TEXT'], ['joined_on', 'TEXT']] },
  products: { rows: 6, cols: [['id', 'INTEGER', 'PK'], ['name', 'TEXT'], ['category', 'TEXT'], ['price', 'REAL'], ['stock', 'INTEGER']] },
  orders: { rows: 6, cols: [['id', 'INTEGER', 'PK'], ['customer_id', 'INTEGER'], ['order_date', 'TEXT'], ['total', 'REAL'], ['status', 'TEXT']] },
  order_items: { rows: 10, cols: [['id', 'INTEGER', 'PK'], ['order_id', 'INTEGER'], ['product_id', 'INTEGER'], ['quantity', 'INTEGER'], ['unit_price', 'REAL']] },
  web_events: { rows: 1000, cols: [['event_id', 'INTEGER', 'PK'], ['user_id', 'INTEGER'], ['event_type', 'TEXT'], ['event_date', 'TEXT'], ['region', 'TEXT'], ['amount', 'REAL']] },
};
