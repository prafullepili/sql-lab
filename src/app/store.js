import { configureStore } from '@reduxjs/toolkit';
import progressReducer from '../features/progress/progressSlice.js';
import queryReducer from '../features/query/querySlice.js';
import { courseOrderTitlesV2, courseOrderTitlesV3, courseOrderTitlesV4, lessons, previousLessonTitles } from '../data/index.js';

const STORAGE_KEY = 'sql-fieldnotes-react-state-v1';
const COURSE_ORDER_VERSION = 5;

function migrateProgress(progress) {
  const currentVersion = progress.courseOrderVersion || 1;
  if (currentVersion < COURSE_ORDER_VERSION) {
    const currentIndexes = new Map(lessons.map((lesson, index) => [lesson.title, index]));
    const savedTitles = currentVersion >= 4 ? courseOrderTitlesV4 : currentVersion >= 3 ? courseOrderTitlesV3 : currentVersion >= 2 ? courseOrderTitlesV2 : previousLessonTitles;
    const remap = (indexes) => (indexes || []).map((oldIndex) => {
      const title = savedTitles[oldIndex];
      return title == null ? null : currentIndexes.get(title);
    }).filter((index) => index != null);
    const oldCurrentTitle = savedTitles[progress.currentLesson || 0];
    progress.currentLesson = oldCurrentTitle == null ? 0 : (currentIndexes.get(oldCurrentTitle) ?? 0);
    progress.completed = remap(progress.completed);
    progress.tasksCompleted = remap(progress.tasksCompleted);
    progress.courseOrderVersion = COURSE_ORDER_VERSION;
  }
  return progress;
}

function readSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved) {
      const oldFirstLessonDefault = 'SELECT name, city\nFROM customers\nLIMIT 5;';
      if (saved.queries?.byLesson?.['Your first query'] === oldFirstLessonDefault) {
        delete saved.queries.byLesson['Your first query'];
      }
      if (saved.progress) {
        saved.progress = migrateProgress(saved.progress);
        saved.progress.completed = saved.progress.completed || [];
        saved.progress.tasksCompleted = saved.progress.tasksCompleted || [];
        delete saved.progress.checklistChecked;
      }
      return saved;
    }
    // Keep the learner's progress from the previous local version.
    const legacy = {
      progress: {
        currentLesson: 0,
        completed: JSON.parse(localStorage.getItem('sql-fieldnotes-progress') || '[]'),
        tasksCompleted: [],
      },
      queries: { byLesson: {} },
    };
    legacy.progress = migrateProgress(legacy.progress);
    return legacy;
  } catch {
    return undefined;
  }
}

export const store = configureStore({
  reducer: { progress: progressReducer, queries: queryReducer },
  preloadedState: readSavedState(),
});

store.subscribe(() => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState())); } catch { /* Storage can be disabled in private browsing. */ }
});
