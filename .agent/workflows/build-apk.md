---
description: How to export an APK for Android
---

To export an APK file for your React Native Android app, follow these steps:

### 1. Build a Debug APK
This is useful for testing on real devices without a production keystore.

// turbo
1. Navigate to the android directory and run the build command:
```powershell
cd android; gradlew assembleDebug
```

2. The APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

### 2. Build a Release APK
This is for production. Note: The current configuration uses the debug signing key, which is fine for testing but should be replaced with a real keystore for Play Store submission.

// turbo
1. Navigate to the android directory and run:
```powershell
cd android; gradlew assembleRelease
```

2. The APK will be generated at:
`android/app/build/outputs/apk/release/app-release.apk`

---

### 3. Alternative: Use npm scripts
I have added the following scripts to your `package.json` for convenience:

- `npm run build:debug`: Build a debug APK
- `npm run build:release`: Build a release APK
