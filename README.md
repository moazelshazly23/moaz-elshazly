# Android Apps Hub

React/Vite frontend with a FastAPI backend. The production frontend is hosted at `https://moazelshazly23.github.io/moaz-elshazly/`; API requests use `https://moaz-elshazly.fastapicloud.dev` unless overridden with `VITE_API_URL`.

## Local development

1. Install Node.js 22 and Python 3.11+.
2. Install frontend dependencies with `npm ci` (after the lockfile has been generated).
3. Run the frontend using `npm run dev`.
4. Install backend dependencies with `python -m pip install -r backend/requirements.txt`.
5. Configure backend environment values listed below, then run `python -m uvicorn app.main:app --app-dir backend --reload --port 8000`.
6. For local frontend development set `VITE_API_URL=http://localhost:8000` in `.env.local`.

## Backend environment

Set these in the backend host's environment/secret manager. Do not commit real values.

- `JWT_SECRET`: random secret of at least 32 characters.
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`: initial administrator credentials. Generate a bcrypt hash with `python -c "import bcrypt; print(bcrypt.hashpw(b'YOUR_PASSWORD', bcrypt.gensalt()).decode())"`. The admin record is initialized only when the database is first created; changing environment credentials later does not overwrite an existing record.
- `DATA_DIR`: directory on a persistent mounted volume. The database is stored at `DATA_DIR/db.json`.
- `UPLOADS_DIR`: directory on persistent storage for APKs and images. If omitted, uploads are kept under `DATA_DIR/uploads`.
- `ALLOWED_ORIGINS`: comma-separated browser origins. Include `https://moazelshazly23.github.io` and any explicitly used development origin.
- `PORT`: port provided by the hosting platform.

The backend no longer reads the checked-in `server_data/db.json` as a fallback, regenerates sample apps, or creates sample APK files. If runtime JSON is malformed or inaccessible, startup fails with a clear error and leaves it untouched; restore a backup before restarting. Back up both `DATA_DIR` and `UPLOADS_DIR` together. This JSON store is intended for one backend process/instance; do not scale multiple writers against it. Use a managed transactional database and object storage before running multiple instances.

## GitHub Pages deployment

The Vite base is `/moaz-elshazly/`. `.github/workflows/deploy.yml` builds `dist/` and deploys it to Pages on pushes to `main` or a manual dispatch. In GitHub repository settings, select **GitHub Actions** as the Pages build/deployment source. The workflow sets `VITE_API_URL` to the FastAPI service; change it if the API hostname changes.

## FastAPI deployment

Deploy the repository with the root `Procfile` command (`uvicorn app.main:app --app-dir backend ...`). Configure persistent mounted paths and all backend environment variables before deploying. Ensure `DATA_DIR` and `UPLOADS_DIR` survive application replacement, and verify that `/health`, `/api/apps`, `/api/categories`, and `/api/suggestions` respond after deployment. Keep the backend on a single instance while using the JSON store.

## Build and checks

- `npm ci`
- `npm run build`
- `npm run lint`
- Backend checks can be run with `python -m compileall backend/app` and the API's OpenAPI page at `/docs`.

The archived `server_data/db.json` is sample content for reference only. It is not loaded by the production FastAPI service.
