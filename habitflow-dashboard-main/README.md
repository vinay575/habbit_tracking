# HabitFlow - Habit Tracking Application

A modern habit tracking application built with React, Redux Toolkit, and Supabase. Track your daily habits, visualize progress with charts, and build better routines.

## 🚀 Live Demo

**URL**: https://habit-track-application.netlify.app/


## 🚀 Login 
Email: bhaskarvinaychitturi@gmail.com
Password : vinay123


## 🛠️ Technology Stack

### Frontend
- **React** - Modern UI library with hooks
- **Redux Toolkit ** - State management with RTK Query
- **React Router DOM ** - Client-side routing
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - User authentication


## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components (shadcn/ui)
│   ├── AuthPage.jsx           # Authentication page
│   ├── HabitCard.jsx          # Individual habit display
│   ├── HabitChart.jsx         # Progress visualization
│   ├── HabitDashboard.jsx     # Main dashboard
│   └── HabitForm.jsx          # Habit creation/editing
├── hooks/
│   ├── useAuth.jsx            # Authentication hook
│   ├── use-mobile.jsx         # Mobile detection
│   └── use-toast.js           # Toast notifications
├── integrations/
│   └── supabase/
│       ├── client.ts          # Supabase client configuration
│       └── types.ts           # Database type definitions
├── pages/
│   ├── Index.jsx              # Landing/dashboard page
│   └── NotFound.jsx           # 404 page
├── store/
│   ├── index.js               # Redux store configuration
│   └── slices/
│       ├── authSlice.js       # Authentication state
│       └── habitSlice.js      # Habits state management
├── lib/
│   └── utils.js               # Utility functions
├── App.jsx                    # Main app component
├── main.jsx                   # App entry point
└── index.css                  # Global styles and theme
```

## 🗄️ Database Schema

### Tables

#### `habits`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `name` (Text, Required)
- `description` (Text, Optional)
- `frequency` (Text, Default: 'daily')
- `target_count` (Integer, Default: 1)
- `color` (Text, Default: '#3B82F6')
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `habit_progress`
- `id` (UUID, Primary Key)
- `habit_id` (UUID, Foreign Key to habits)
- `user_id` (UUID, Foreign Key to auth.users)
- `date` (Date, Required)
- `completed_count` (Integer, Default: 0)
- `notes` (Text, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Row Level Security (RLS)
All tables have RLS enabled with policies ensuring users can only access their own data:
- Users can create, read, update, and delete their own habits
- Users can create, read, update, and delete their own progress records

## 🔐 Authentication System

The app uses Supabase Auth with email/password authentication:

### Features
- User registration with email verification
- Secure login/logout
- Session management with automatic refresh
- Protected routes
- charts 

### Implementation
- **Auth Slice** (`authSlice.js`) - Redux state for user session
- **Auth Hook** (`useAuth.jsx`) - Listens to auth state changes
- **Auth Page** (`AuthPage.jsx`) - Login/signup interface

## 📊 State Management with Redux Toolkit


### Key Features
- **Async Thunks** for API calls
- **Error handling** with user feedback
- **Loading states** for better UX
- **Optimistic updates** where appropriate

## 🎨 Design System

### Theme
- **Dark theme** with modern aesthetics
- **HSL color system** for consistency
- **Responsive design** for all screen sizes
- **Semantic tokens** in CSS variables

### Key Colors
- Primary: Purple gradient (#8B5CF6 to #A855F7)
- Background: Dark (#0A0A0A)
- Cards: Dark gray (#1A1A1A)
- Text: Light (#FAFAFA)
- Muted: Gray (#6B7280)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for backend database)

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# .env file is already configured with Supabase credentials
VITE_SUPABASE_PROJECT_ID="vythynzfzfnzmhfznrim"
VITE_SUPABASE_URL="https://vythynzfzfnzmhfznrim.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="[key-included]"
```

4. **Start development server**
```bash
npm run dev
```

## 📱 Features

### Core Functionality
- ✅ Create and manage habits
- ✅ Track daily progress
- ✅ Visual progress charts
- ✅ Habit filtering and sorting
- ✅ User authentication
- ✅ Responsive design
- ✅ Dark theme

### Habit Management
- Add new habits with custom colors
- Set target counts and frequencies
- Edit and delete habits
- Color-coded organization

### Progress Tracking
- Mark habits as complete/incomplete
- Add notes to progress entries
- View progress history
- Visual charts and statistics

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production


## 🚀 Deployment

### Via Lovable (Recommended)
1. https://www.netlify.com/ 



## 🤝 Contributing
1. **GitHub integration** - Connect your GitHub account for version control


