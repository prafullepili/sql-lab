# SQL Fieldnotes

A local, hands-on SQL course built with React, JavaScript, Tailwind CSS, and Redux Toolkit. SQL runs in the browser through SQLite WASM; the app does not need a backend.

## Run locally

```sh
npm install
npm run dev
```

Vite binds only to `127.0.0.1` (this computer). The generated production site is built with `npm run build` into `dist/`.

## Project structure

- `src/components/` — course header, lesson content, database schema, and roadmap UI
- `src/components/LessonContent.jsx` — lesson presentation and loadable examples
- `src/features/query/` — SQL editor, query state, and results
- `src/features/progress/` — lesson progress and roadmap state
- `src/db/` — SQLite setup, sample data, and IndexedDB persistence
- `src/data/` — course content and table metadata
- `public/vendor/` — local SQLite WASM runtime

Lesson progress and editor queries are stored in `localStorage`. The SQLite database, including the generated 1,000-row `web_events` sample table, is saved in IndexedDB.
