# ScripTag Platform

ScripTag is a comprehensive medication management platform that leverages NFC technology to help users track and manage their medications. The platform consists of a React Native mobile application, a Go-based GraphQL API, notification services, and cloud infrastructure.

## 🔒 Security Notice

**IMPORTANT**: This repository contains sensitive credentials that must be properly secured before contributing or deploying.

**Never commit**:
- `.env` files
- `service-account-key.json` or `firebase-service-account-key.json`
- `GoogleService-Info.plist`
- Any files containing API keys, secrets, or credentials

All sensitive files have `.example` templates in this repository. Copy them and fill in your actual credentials locally.

## 🏗️ Architecture

This is a monorepo containing the following components:

### Mobile Application
- **React Native App** (`apps/react-native-app/`) - Cross-platform mobile application for iOS and Android
  - NFC tag scanning and writing
  - Medication tracking and scheduling
  - Push notifications via Firebase Cloud Messaging
  - User authentication (Google Sign-In, Apple Sign-In)
  - Apollo GraphQL client integration

### Backend Services
- **Go GraphQL API** (`services/go-api/`) - Main backend API service
  - GraphQL API built with gqlgen
  - PostgreSQL database with GORM ORM
  - JWT-based authentication
  - Firebase Admin SDK integration
  - Atlas for database migrations
  - River for background job processing

- **Notification Dispatcher** (`jobs/notification-dispatcher/`) - Cloud Run service for medication reminders
  - Scheduled medication reminder notifications
  - Firebase Cloud Messaging integration
  - Batch processing (100 notifications at a time)
  - Automatic invalid token cleanup

### Shared Resources
- **Shared Models** (`shared/`) - Common Go models and types shared across services
  - Medication models
  - User models
  - Notification models
  - User medication schedules

### Infrastructure
- **GCP Infrastructure** (`infra/gcp/`) - Google Cloud Platform infrastructure as code
  - Pulumi-based infrastructure definitions
  - Cloud Run deployments
  - Storage configuration

### Tools
- **Bootstrap API** (`tools/bootstrap-api/`) - API initialization tools
- **ChatGPT Extractor** (`tools/chatgpt-extractor/`) - Medication data extraction utilities
- **Style Dictionary** (`tools/style-dictionary/`) - Design token management

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **Go** 1.24+
- **PostgreSQL** database
- **Firebase** project with Cloud Messaging enabled
- **React Native development environment** (Xcode for iOS, Android Studio for Android)

### 🔐 Credentials Setup

**CRITICAL**: Complete this section before running the application.

#### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create or select your project
3. Download configuration files:
   - **For iOS**: Download `GoogleService-Info.plist`
     - Go to Project Settings → iOS App
     - Place in `apps/react-native-app/ios/`
   - **For Android**: Download `google-services.json`
     - Go to Project Settings → Android App
     - Place in `apps/react-native-app/android/app/`
   - **For Backend**: Download Service Account Key
     - Go to Project Settings → Service Accounts
     - Click "Generate New Private Key"
     - Save as `services/go-api/firebase-service-account-key.json`
     - Save as `jobs/notification-dispatcher/service-account-key.json`

⚠️ **These files are gitignored and will NOT be committed**

#### 2. Environment Variables

Create `.env` files from the provided examples:

```bash
# Go API
cp services/go-api/.env.example services/go-api/.env
# Edit services/go-api/.env with your credentials

# React Native App
cp apps/react-native-app/.env.example apps/react-native-app/.env
# Edit apps/react-native-app/.env with your API URL

# Notification Dispatcher
cp jobs/notification-dispatcher/.env.example jobs/notification-dispatcher/.env
# Edit jobs/notification-dispatcher/.env with your database URL
```

**Required Configuration**:

**`services/go-api/.env`**:
```bash
DB_CONN_STR="host=localhost user=postgres password=YOUR_PASSWORD dbname=scriptag port=5432 sslmode=disable TimeZone=UTC"
SECRET_KEY=$(openssl rand -hex 32)  # Generate a secure random key
ENVIRONMENT=development
PORT=8080
```

**`apps/react-native-app/.env`**:
```bash
# For iOS Simulator
API_URL=http://localhost:8080/query

# For Android Emulator
# API_URL=http://10.0.2.2:8080/query

# For physical device (replace with your computer's IP)
# API_URL=http://192.168.1.XXX:8080/query
```

#### 3. Database Setup

Create the PostgreSQL database:
```bash
createdb scriptag
# Or using psql
psql -U postgres -c "CREATE DATABASE scriptag;"
```

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/joshnissenbaum/scriptag-platform.git
cd scriptag-platform
```

2. Install dependencies for the React Native app:
```bash
cd apps/react-native-app
npm install
cd ios && pod install && cd ..
```

3. Set up environment variables for the Go API:
```bash
cd services/go-api
cp .env.example .env
# Edit .env with your database credentials and Firebase config
```

4. Initialize the Go workspace:
```bash
# From project root
go work sync
```

### Running the Development Environment

#### 1. Start the Go API Server
```bash
cd services/go-api
ENVIRONMENT=development go run server.go
```

Or use the VS Code task: `Go API - Start Server`

#### 2. Start the React Native App

First, start Metro bundler:
```bash
cd apps/react-native-app
npm run start --reset-cache
```

Or use the VS Code task: `React Native App - Start Metro`

Then run the app:
```bash
# iOS
npm run ios

# Android
npm run android
```

### Code Generation

The project uses code generation for GraphQL schemas and types:

#### Generate Go GraphQL Code
```bash
cd services/go-api
go run github.com/99designs/gqlgen generate
```

Or use the VS Code task: `Go GraphQL - Codegen`

#### Generate React Native GraphQL Types
```bash
cd apps/react-native-app
npm run generate
```

Or use the VS Code task: `React Native App - Codegen`

## 📱 Features

### Core Functionality
- **NFC Tag Management** - Write medication information to NFC tags and scan them to log consumption
- **Medication Tracking** - Add, manage, and track multiple medications
- **Smart Scheduling** - Configure medication schedules (daily, intervals, specific days, as needed)
- **Push Notifications** - Receive timely medication reminders via Firebase Cloud Messaging
- **Consumption History** - View and track medication intake history
- **User Authentication** - Secure authentication with Google and Apple Sign-In

### Mobile App Technologies
- React Native 0.79.2
- Apollo Client for GraphQL
- React Navigation for routing
- Zustand for state management
- React Native NFC Manager for NFC functionality
- Firebase Cloud Messaging for notifications
- React Native Reanimated for animations
- MMKV for efficient local storage

### Backend Technologies
- Go 1.24
- GraphQL (gqlgen)
- GORM for database operations
- PostgreSQL database
- JWT authentication
- Firebase Admin SDK
- River for background jobs
- Atlas for migrations

## 🗂️ Project Structure

```
scriptag/
├── apps/
│   └── react-native-app/       # Mobile application
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── features/       # Feature-based modules
│       │   ├── graphql/        # GraphQL queries and mutations
│       │   ├── hooks/          # Custom React hooks
│       │   ├── navigators/     # Navigation configuration
│       │   └── utils/          # Utility functions
│       ├── android/            # Android native code
│       └── ios/                # iOS native code
│
├── services/
│   └── go-api/                 # Main backend API
│       ├── adapters/           # Data adapters and repositories
│       ├── auth/               # Authentication logic
│       ├── config/             # Configuration (DB, Firebase)
│       ├── core/               # Business logic ports/interfaces
│       ├── db/                 # Database models and queries
│       ├── graph/              # GraphQL resolvers and schema
│       ├── migrations/         # Database migrations
│       ├── service/            # Business logic implementations
│       └── workers/            # Background job workers
│
├── jobs/
│   └── notification-dispatcher/ # Cloud Run notification service
│
├── shared/                     # Shared Go models
│   └── models/                 # Common data models
│
├── infra/
│   └── gcp/                    # Google Cloud Platform infrastructure
│
└── tools/                      # Development and utility tools
```

## 🔧 Database Migrations

The project uses Atlas for database migrations:

```bash
cd services/go-api

# Generate a new migration
atlas migrate diff --env local

# Apply migrations
atlas migrate apply --env local
```

## 🚢 Deployment

### Deploying the API (Cloud Run)
```bash
cd services/go-api
gcloud run deploy go-api \
  --source . \
  --region us-central1 \
  --set-env-vars "DATABASE_URL=[YOUR_DATABASE_URL]"
```

### Deploying the Notification Dispatcher
```bash
cd jobs/notification-dispatcher
gcloud run deploy notification-dispatcher \
  --source . \
  --region us-central1 \
  --set-env-vars "DATABASE_URL=[YOUR_DATABASE_URL]"
```

### Building the Mobile App

#### iOS
```bash
cd apps/react-native-app
npm run ios --configuration Release
```

#### Android
```bash
cd apps/react-native-app
npm run android --variant=release
```

## 🧪 Testing

### Run Tests
```bash
cd apps/react-native-app
npm test
```

## 📝 API Documentation

The GraphQL API includes an interactive playground available at:
```
http://localhost:8080/
```

### Key GraphQL Operations

- `medications` - Query available medications with pagination
- `myMedications` - Get user's medication list
- `addMyMedication` - Add a medication to user's list
- `createMedicationSchedule` - Set up medication schedule
- `logConsumption` - Record medication intake

## 🔐 Authentication

The platform uses Firebase Authentication with support for:
- Google Sign-In
- Apple Sign-In
- JWT tokens for API authentication

## 📱 NFC Integration

The app uses NFC tags to:
1. Link physical medication containers to digital records
2. Quick-log medication consumption by tapping the tag
3. Provide a seamless user experience for medication tracking

NFC tags are written with medication-specific data and can be attached to medication bottles or packaging.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Team

Developed by Josh Nissenbaum

## 🐛 Known Issues

- NFC functionality requires physical NFC tags from ScripTag
- iOS requires specific entitlements for NFC tag reading/writing
- Android requires NFC permissions in the manifest

## 📞 Support

For issues, questions, or feature requests, please contact the development team or open an issue in the repository.

---

**Note**: This is a monorepo managed with Go workspaces. Make sure to run `go work sync` after pulling changes that affect Go modules.
