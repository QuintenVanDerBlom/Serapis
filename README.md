# Serapis

Serapis is a mobile wellness app built to support people on difficult days with small, realistic actions. Instead of long routines or intensive sessions, the app focuses on low-threshold tasks like breathing exercises, short walks, hydration, grounding, and self-care.

The goal of Serapis is simple: help users take one small step toward feeling better.

## Features

- Daily wellness tasks
- Personalized task flow
- Points and progress tracking
- Milestones and monthly progress
- Simple onboarding and user preferences
- Supabase-powered data storage

## Tech Stack

- React Native
- Expo
- Supabase
- React Navigation
- Jest

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <your-project-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

Run the SQL files in your Supabase project:

- `supabase_auth.sql`
- `supabase_task_catalog.sql`
- `supabase_journey.sql`
- `supabase_user_profiles.sql`

Then add your Supabase credentials to the project config.

### 4. Start the app

```bash
npx expo start
```

Open it in Expo Go or run it in an emulator.

## Open Source

This project is open for learning, feedback, and improvement.

You can contribute by:

- improving the code structure
- adding new wellness tasks
- improving accessibility
- expanding personalization
- improving testing
- refining the UI/UX

If you want to contribute:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Open a pull request

## Notes

Serapis was developed as an MVP and learning project. The current version focuses on validating the concept, core functionality, and user value.

## Author

Quinten van der Blom
