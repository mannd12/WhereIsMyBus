# WhereIsMyBus — Claude Code Project

Real-time TransLink transit app for Vancouver. Built with Expo SDK 56 + React Native, targeting iOS via EAS cloud build (no Mac required).

## Project location
`C:\Users\mannp\OneDrive\Desktop\WhereIsMyBus`

## Running the app
```powershell
cd C:\Users\mannp\OneDrive\Desktop\WhereIsMyBus
npx expo start --clear
```
Then press `a` in the Metro terminal to open on Android emulator.

## Key rules
- Always prefix terminal commands with `cd C:\Users\mannp\OneDrive\Desktop\WhereIsMyBus` — user's shell never starts there
- All npm installs require `--legacy-peer-deps` (react@19 peer dep conflict)
- API key is in `.env.local` as `EXPO_PUBLIC_TRANSLINK_API_KEY` — never hardcode it

## Stack
- Expo SDK 56 + Expo Router v4
- react-native-maps, expo-location
- @tanstack/react-query v5 (auto-refresh polling)
- zustand v5 + AsyncStorage (favorites + settings)
- gtfs-realtime-bindings v2 (protobuf GTFS-RT parsing)

## API
- TransLink GTFS-RT V3: `https://gtfsapi.translink.ca/v3`
- Static GTFS: run `node scripts/fetchGtfsStatic.js` to refresh `data/*.json`

## Deferred features (build before release)
- Route shape on map (tap route → see full path)
- Departure push notifications

## Final task
App Store submission via EAS Build — user has no prior experience.
