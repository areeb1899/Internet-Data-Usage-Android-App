# Internet Usage — Wi-Fi & Mobile Internet Data Usage Android App

A lightweight, ultra-clean React Native (Expo) Android application designed with **minimum app size** (~1.64 MB Hermes bundle) and a simple UI. It displays **Total Wi-Fi and Mobile cellular data usage**, separate section tabs, a flexible time-range selector, and a persistent **1-year historical record**.

---

## 🌟 Key Features

### 1. Total Usage Focus (Zero Clutter)
- Streamlined interface displaying **total data consumption** without per-app distraction.
- **Dedicated Wi-Fi Section (📶 Cyan Theme)**: Total Wi-Fi usage, download (Rx), upload (Tx), and daily average.
- **Dedicated Mobile Data Section (📱 Emerald Theme)**: Total mobile cellular usage, download/upload split, and daily average.
- **Combined Overview Section (📊 Indigo Theme)**: Full aggregate consumption across all network interfaces with split percentage bars.

### 2. Streamlined Time Range Selector
- **Today** (00:00 to now)
- **Yesterday**
- **Last 7 Days**
- **This Month**
- **Last 30 Days**
- **Custom Date Range Picker Modal**

### 3. Reliable Reset Feature
- One-tap **Reset** button in the header bar with confirmation protection.
- Instantly resets recorded statistics to **0 B** and bounds all future queries from the reset timestamp onwards.

### 4. Branding & Credits
- Displays **"Developed by Areeb Ahmed v1.1"** at the bottom of the screen.

---

## 🚀 Running the App

### Development / Expo Go
```powershell
npx expo start
```

### Standalone Android APK Build
```powershell
npx eas build --profile preview --platform android
```
