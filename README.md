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

## Deploy to GitHub Pages

This repository includes `.github/workflows/deploy.yml`. It builds the Vite app and publishes the generated `dist/` files whenever a commit is pushed to `main`; it can also be started manually from the Actions tab.

On GitHub, open **Settings → Pages → Build and deployment** and choose **GitHub Actions** as the source. Then push to `main` and check the **Actions** tab for the deployment. The project URL is `https://prafullepili.github.io/sql-lab/`.

### What the workflow does

- A **trigger** starts the workflow when code is pushed to `main` or when it is run manually.
- A **job** runs on a temporary GitHub-hosted machine. This workflow has a build job and a deploy job.
- **Steps** check out the code, install Node.js dependencies, build the app, and upload the `dist/` folder as a Pages artifact.
- **Actions** are reusable steps maintained in repositories, such as `actions/checkout` and `actions/deploy-pages`.
- The deploy job sends the artifact to GitHub Pages using narrowly scoped `pages: write` and `id-token: write` permissions.

Vite uses `/sql-lab/` as its asset base only in GitHub Actions builds. Local development and preview continue to use `/`.
