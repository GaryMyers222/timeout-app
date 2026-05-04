# TimeOut App

TimeOut is a private, invitation-only babysitting circle app for trusted friends. It helps parents request sits, coordinate AutoPing responses, and track fair reciprocity through points.

TimeOut is not a babysitter marketplace and does not connect strangers. It is designed for groups of friends who already trust one another.

## Important project context

Start here before making product or code decisions:

- [HANDOFF_TIMEOUT_APP.md](./HANDOFF_TIMEOUT_APP.md)

That file preserves the current TimeOut product rules, canonical source hierarchy, development status, and next build plan.

## Tech stack

This is an Expo / React Native project created with `create-expo-app`.

## Run locally

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, Expo will offer options to open the app in Expo Go, an Android emulator, an iOS simulator, or a development build.

## Development note

Future AI or developer work should use this repo as the source of truth, make small reviewable commits, and preserve the product intent documented in `HANDOFF_TIMEOUT_APP.md`.

## Original Expo guidance

You can start developing by editing the files inside the `app` directory. This project uses file-based routing.

When ready for a fresh starter structure, Expo's default reset command is:

```bash
npm run reset-project
```

Do not run reset-project casually; it can move or replace starter files.
