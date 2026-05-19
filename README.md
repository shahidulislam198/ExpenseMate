# 💰 ExpenseMate

A beautifully designed, cross-platform expense tracker built with **React Native** and **Expo**. Track your income and expenses, visualize spending patterns, and manage categories — all from a clean, intuitive interface.

<p align="center">
  <img src="./assets/images/icon.png" alt="ExpenseMate Logo" width="120" />
</p>

---

## ✨ Features

- **📊 Dashboard** — Interactive bar charts for income vs. expenses across weekly, monthly, 6-month, and yearly views. See top spending and earning categories at a glance.
- **💸 Transaction Management** — Add, edit, and delete transactions with categories, notes, dates, and amounts. Full CRUD support.
- **🏷️ Custom Categories** — Create your own expense and income categories with custom emoji icons and colors.
- **🌍 Multi-Currency Support** — Choose from 100+ currencies with their native symbols. Currency preference persists across sessions.
- **📱 Cross-Platform** — Runs on iOS, Android, and Web from a single codebase.
- **🎨 Beautiful UI** — Styled with NativeWind (Tailwind CSS for React Native) with a polished indigo theme, smooth animations, and haptic feedback.
- **🗄️ Local SQLite Database** — All data stored locally on-device using `expo-sqlite` with WAL mode for fast queries. No internet required.

---

## 🛠️ Tech Stack

| Layer      | Technology                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------- |
| Framework  | [Expo SDK 54](https://expo.dev) + [Expo Router](https://expo.github.io/router)                    |
| UI         | [React Native 0.81](https://reactnative.dev)                                                      |
| Styling    | [NativeWind v5](https://nativewind.dev) (Tailwind CSS v4)                                         |
| Navigation | [React Navigation 7](https://reactnavigation.org) (bottom tabs + stack)                           |
| Database   | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (local SQLite)                   |
| Storage    | [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) (currency preference) |
| Icons      | [@expo/vector-icons](https://icons.expo.fyi) (Ionicons)                                           |
| Animations | [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)                    |
| Language   | TypeScript (strict mode)                                                                          |

---

## 📁 Project Structure

```
ExpenseMate/
├── app/                      # Expo Router file-based routing
│   ├── _layout.tsx           # Root layout — DB init, providers, stack navigator
│   ├── index.tsx             # Entry point — redirects to currency selector
│   ├── currency.tsx          # Currency selection screen (onboarding)
│   ├── modal.tsx             # Add/Edit transaction modal
│   └── (tabs)/               # Bottom tab navigator
│       ├── _layout.tsx       # Tab bar configuration
│       ├── dashboard.tsx     # Charts, summaries, category breakdowns
│       ├── transactions.tsx  # Transaction list with swipe-to-delete
│       └── settings.tsx      # Manage categories, currency, and data
├── components/
│   └── DatePicker.tsx        # Reusable date picker component
├── lib/
│   ├── database.ts           # SQLite helper functions (CRUD wrappers)
│   ├── schema.ts             # Database schema, types, and seed data
│   └── currency.tsx          # Currency context provider + 100+ currency definitions
├── assets/
│   └── images/               # App icons, splash screen, favicon
├── global.css                # Tailwind CSS entry point
├── app.json                  # Expo configuration
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v18 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) or `npx expo`
- For mobile: [Expo Go](https://expo.dev/go) app on your iOS/Android device
- For emulators: Xcode (iOS) or Android Studio (Android)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/expense-mate.git
   cd expense-mate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npx expo start
   ```

4. **Run on your preferred platform**

   | Platform         | Command                   |
   | ---------------- | ------------------------- |
   | iOS Simulator    | `npm run ios`             |
   | Android Emulator | `npm run android`         |
   | Web Browser      | `npm run web`             |
   | Physical Device  | Scan QR code with Expo Go |

---

## 📖 Usage Guide

### First Launch

On first launch, you'll be prompted to select your preferred currency. This choice is saved and can be changed later in Settings.

### Dashboard

The Dashboard shows your financial overview with:

- **Time frame selector** — Toggle between Week, Month, 6 Months, and Year views
- **Bar chart** — Visual comparison of income (green) vs. expenses (red) per period
- **Total summary** — Net balance, total income, and total expenses for the selected period
- **Top categories** — Most-used expense and income categories with amounts

### Adding a Transaction

Tap the **+** button on the Transactions tab or Dashboard to open the modal:

1. Choose **Expense** or **Income**
2. Enter the amount
3. Select a category (or create a new one in Settings)
4. Add an optional note
5. Pick a date (defaults to today)
6. Tap **Save**

### Managing Categories

Go to **Settings → Categories** to:

- View all existing categories
- Add new categories with custom emoji, name, type, and color
- Delete unwanted categories

### Changing Currency

Go to **Settings → Currency** and select from 100+ supported currencies. The symbol updates throughout the app immediately.

---

## 🧪 Scripts

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `npm start`             | Start Expo development server  |
| `npm run ios`           | Start with iOS simulator       |
| `npm run android`       | Start with Android emulator    |
| `npm run web`           | Start web version              |
| `npm run lint`          | Run ESLint checks              |
| `npm run reset-project` | Reset project to initial state |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ using Expo & React Native</p>
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
