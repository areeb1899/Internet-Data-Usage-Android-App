# Internet Usage — Wi-Fi & Mobile Internet Data Usage Android App

A lightweight, high-performance React Native (Expo) Android application designed with **minimum app size** (~1.65 MB Hermes bundle) and a clean, responsive UI. It provides comprehensive monitoring of **Wi-Fi** and **Mobile cellular data usage**, separate section tabs, per-app data breakdown, a flexible time-range selector, and a persistent **1-year historical record**.

---

## 🌟 Key Features

### 1. Two Separate Sections for Wi-Fi & Mobile Data
- **Dedicated Wi-Fi Section (📶 Cyan Theme)**: Displays total Wi-Fi consumption, download (Rx), upload (Tx), and individual app Wi-Fi usage with proportional consumption bars.
- **Dedicated Mobile Data Section (📱 Emerald Theme)**: Displays cellular usage metrics, cellular download/upload split, and individual app mobile data usage.
- **Combined Overview Section (📊 Indigo Theme)**: Shows full aggregate network consumption across all interfaces.

### 2. Full-Screen Responsive Navigation Display
- Prominent, tactile top/bottom navigation buttons with live usage badges.
- Edge-to-edge Android display with status bar and navigation bar integration (`react-native-safe-area-context` + `expo-status-bar`).
- Responsive flexbox layout that adapts seamlessly to phones of all aspect ratios and tablets.

### 3. Flexible Time Range Selector (Up to 1 Year)
- Quick selection pills:
  - **Today** (00:00 to now)
  - **Yesterday**
  - **Last 7 Days**
  - **This Month**
  - **Last 30 Days**
  - **3 Months** (90 days)
  - **6 Months** (180 days)
  - **1 Year (365 Days)**
- **Custom Time Range Modal**: Set any date window within the 1-year history.

### 4. 1-Year Historical Record Retention
- Persistent local store using `@react-native-async-storage/async-storage`.
- Records daily snapshots of per-app Wi-Fi & Mobile usage.
- Automated 365-day rolling retention with background pruning of entries older than one year to maintain an ultra-lightweight storage footprint.
- Pre-seeded with 365 days of realistic data for instant exploration in Expo Go, while seamlessly syncing live stats when running natively.

### 5. Native Android `NetworkStatsManager` Integration
- Native Kotlin module (`NetworkStatsModule.kt` & `NetworkStatsPackage.kt`) querying Android's system `NetworkStatsManager` via `ConnectivityManager.TYPE_WIFI` and `ConnectivityManager.TYPE_MOBILE`.
- Resolves package names and application labels for all system and user apps by UID.
- Handles Android's special `android.permission.PACKAGE_USAGE_STATS` permission with a one-tap shortcut to system "Usage Access" settings.

### 6. Minimum App Size Architecture
- Uses pure React Native vector geometry for icons (no bulky multi-megabyte `.ttf` font files from icon kits).
- Total compiled Android bytecode bundle is only **~1.65 MB**.
- Zero extraneous dependencies.

---

## 📁 Project Structure

```
├── App.tsx                     # Main responsive screen & safe area coordinator
├── index.ts                    # Expo root entry point
├── app.json                    # Android package, permissions & configuration
├── package.json                # Ultra-lightweight dependencies
├── android/                    # Native Android Kotlin module for NetworkStatsManager
│   └── app/src/main/java/com/netusage/datausage/
│       ├── NetworkStatsModule.kt
│       └── NetworkStatsPackage.kt
└── src/
    ├── components/
    │   ├── Header.tsx              # App bar, live/history status & refresh
    │   ├── NavigationBar.tsx       # Wi-Fi vs Mobile section switch buttons
    │   ├── TimeRangeSelector.tsx   # Quick preset pills & custom range button
    │   ├── SummaryCard.tsx         # Total usage, Rx/Tx split & daily average
    │   ├── AppUsageList.tsx        # Search, sort (High/Low/A-Z), FlatList
    │   ├── AppUsageItem.tsx        # Per-app row with progress bar & micro-stats
    │   ├── AppDetailModal.tsx      # In-depth per-app breakdown modal
    │   ├── CustomDateModal.tsx     # Custom time range picker
    │   └── Icon.tsx                # Zero-overhead vector icon component
    ├── native/
    │   └── NetworkStats.ts         # Bridge interface for Android NetworkStats
    ├── services/
    │   ├── dataUsageService.ts     # Unified data orchestrator
    │   └── storageService.ts       # 1-year persistent storage & pruning engine
    ├── types/
    │   └── dataUsage.ts            # TypeScript interfaces and models
    ├── utils/
    │   └── formatters.ts           # Human-readable bytes (B, KB, MB, GB) & dates
    └── theme.ts                    # Dark OLED-friendly theme colors & spacing
```

---

## 🚀 Running the App

### 1. In Expo Go (Development & Testing)
```bash
npx expo start
```
Scan the QR code with the **Expo Go** app on your Android phone.

### 2. On Android Device / Emulator (Native Live Stats)
To run with physical Android `NetworkStatsManager` support:
```bash
npx expo run:android
```
When prompted, tap **"Grant Access"** in the top bar to enable "Usage Access" in Android Settings.

### 3. Verify Build & Bundle Size
```bash
npx expo export
```
Builds the optimized production Hermes bundle (~1.65 MB).

