# QuickTask

QuickTask is a lightweight, single-page task manager built with Vite and React. Add tasks, mark them complete, remove them, and keep your list in this browser with LocalStorage.

## Requirements

- Node.js 20 or newer
- npm

## Install and run

```sh
cd frontend
npm install
npm run dev
```

Vite prints the local development URL when the server starts.

## Verify

```sh
cd frontend
npm test
npm run test:e2e
npm run build
```

The component suite uses Vitest and Testing Library. The browser journey uses Playwright and Chromium; install the browser with `node node_modules/@playwright/test/cli.js install chromium` if it is not already available.

## Persistence

Tasks are stored in the browser's LocalStorage under `quicktask.tasks`. They are local to the current browser profile and are not synchronized to another device.
