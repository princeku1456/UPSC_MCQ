# UPSC MCQ App (React Migration)

This project has been migrated to React + TypeScript + Vite.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Structure

- `src/components`: Reusable UI components.
- `src/pages`: Main application pages (Dashboard, Quiz, Practice, Admin, Login).
- `src/context`: React Contexts (AuthContext).
- `src/services`: External services (Firebase, DataManager).
- `src/utils`: Helper functions.
- `legacy/`: Original vanilla JS files.

## Testing

The legacy `full_ui_test.js` is located in `legacy/` and is not compatible with the React version.
Future tests should use Playwright to test the React app against a testing environment.
