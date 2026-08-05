# Caremagix — Care Giver Web App

React + Vite frontend for Caremagix.

## Project status

This app is mid-migration to a new Figma-based UI, in the same codebase:

- **`/care-giver`** — the original, fully working app (`src/pages/CareGiver.jsx`
  and friends). Left running unchanged until the new UI covers everything it does.
- **`/app`** — the new Figma shell (`src/features/`, `src/config/`), built
  feature-by-feature, reusing the existing `api/`, `hooks/`, and `redux/`
  layers wherever possible instead of new plumbing.

See [CHANGELOG.md](./CHANGELOG.md) for what's been built, feature-wise.

## Setup

```bash
npm install
npm run dev       # start the dev server (Vite)
npm run build      # production build
npm run lint        # eslint
npm run preview    # preview a production build locally
```

## Folder structure (high level)

```
src/
  api/            # HTTP calls to the backend (shared by old and new UI)
  hooks/          # shared data/query hooks (e.g. useMyQuery, useAskQuestion)
  redux/          # redux slices (shared by old and new UI)
  pages/          # old app (/care-giver)
  components/     # old app's components
  features/       # new Figma shell (/app) — one folder per feature
  config/         # new shell's section/role registry (config/sections.js, config/roles.js)
```
