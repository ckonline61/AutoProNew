# Auto Pro Customer App — Phone Preview

This app uses Expo SDK 57. Dependencies are pinned to its supported native versions.

## Start on your phone

1. Install Expo Go on Android or iPhone.
2. Connect the computer and phone to the same Wi-Fi.
3. From this directory, run `npm install` once, then `npm start`.
4. Scan the terminal QR code with Expo Go on Android or the Camera on iPhone.
5. On the login screen choose **Preview App — Sample Data** to explore without registering. The banner identifies all simulated booking/SOS/marketplace actions; no real requests or payments are created by those screens.

From the repository root you can also run `powershell -ExecutionPolicy Bypass -File .\START_CUSTOMER_PREVIEW.ps1`.

Expo Go must support SDK 57. If the store version reports an SDK mismatch, install the matching Android Expo Go version from https://expo.dev/go, or use the browser preview below. An iOS development build requires a compatible build environment/account; it has not been generated here.

## Browser preview of the customer app

Run `npm run web`. Open the URL Expo prints in a browser on the computer or phone. This is the customer React Native app rendered on the web, separate from the public website on port 5174.

## Backend connection

Real login and registration use the backend and never silently become mock sessions. The sample preview works without the backend.

In development, the app derives the backend host from the Expo LAN host and uses port 5000. To override it, copy `.env.example` to `.env` and set:

```
EXPO_PUBLIC_API_BASE_URL=http://YOUR_COMPUTER_LAN_IP:5000/api/v1
```

Do not use localhost for a physical phone. Start the backend using the root START_PREVIEW.ps1 script. For browser login, add the Expo browser origin (including LAN IP and port 8081) to backend CORS_ORIGIN. Windows must permit Node.js on your private network for access from the phone. A Metro tunnel only tunnels Metro, not the backend; use sample preview or a separately accessible API endpoint when using `npm start -- --tunnel`.

Set EXPO_PUBLIC_API_BASE_URL to the real HTTPS API endpoint before a production build. This variable is public; do not put credentials or secrets in it.

## Checks

- `npm run check:expo`: Expo dependency compatibility
- `npm run typecheck`: strict TypeScript
- `npm run lint`: ESLint
- `npm test -- --runInBand`: session regression tests
- `npm run build`: Android, iOS and web JavaScript/asset exports; this does not build an APK/IPA

Native APK/IPA installation and physical-device runtime are separate validation steps. Backend-driven booking, cart and emergency flows remain under development; the screens currently show sample data.
