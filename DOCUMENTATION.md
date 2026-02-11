# Heliix Frontend Documentation

Welcome to the technical documentation for the Heliix Frontend Client. This document provides a deep dive into the architecture, code structure, and development workflows.

## 1. Project Overview

Heliix is a federated social network interface built with **React 19**, **TypeScript**, and **Vite**. It is designed to connect to multiple backend instances, offering a seamless user experience across a decentralized network.

### Key Technologies
- **Core**: React 19, TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **State/API**: Axios, LocalStorage
- **Routing**: React Router (implied)

## 2. Architecture

The frontend acts as a client that can dynamically switch between different backend "Instances".

```mermaid
graph TD
    User[User] -->|Interacts| Client[Heliix Frontend Client]
    Client -->|Selects Instance| Config[Instance Config]
    Config -->|API Calls| InstanceA[Instance A Backend]
    Config -->|API Calls| InstanceB[Instance B Backend]
    
    subgraph "Frontend Layer"
        Client
        Config
        LocalStorage[LocalStorage (Auth & Instance URL)]
    end
    
    subgraph "Federated Backend Layer"
        InstanceA
        InstanceB
    end
```

### Instance Configuration
Backend instances are defined in `src/config/instances.ts`. Each instance has:
- **Name**: Display name (e.g., "Instance A")
- **URL**: Base API URL
- **Color**: Branding color theme
- **Description**: Short description

When a user selects an instance on the Landing page, the `base URL` is stored in `localStorage` under `INSTANCE_BASE_URL`.

## 3. Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
cd fsn-frontend
npm install
```

### Development
Start the dev server:
```bash
npm run dev
```
The app runs at `http://localhost:5173`.

### Production Build
Create a production build:
```bash
npm run build
```
Preview the build:
```bash
npm run preview
```

## 4. Project Structure

The `src` directory is organized as follows:

### `src/api`
Contains all API communication logic.
- **`api.ts`**:
    - `getApi()`: Creates an Axios instance with the base URL from `localStorage` and attaches the `Authorization` header if a token exists.
    - Exports helper functions for all endpoints (e.g., `loginUser`, `createPost`, `getPosts`).

### `src/components`
Reusable UI components. Key components include:
- **`Navbar.tsx`**: Main navigation bar.
- **`PostForm.tsx`**: Component for creating new posts with animations.
- **`PostModal.tsx`**: Modal version of the post form.
- **`UserSearchModal.tsx`**: Modal for searching users across the instance.
- **`Mascot.tsx`**: Renders the animated "Doodle Bot" mascot.
- **`GlassCard.tsx`**: specific card component with glassmorphism effect.

### `src/config`
- **`instances.ts`**: Registry of available backend instances.

### `src/pages`
Top-level page components corresponding to routes:
- **`Landing.tsx`**: Entry point where users select an instance.
- **`AuthPage.tsx`**: Login and Registration forms.
- **`Dashboard.tsx`**: Main feed and user interface after login.
- **`Profile.tsx`**: User profile view with posts and connection stats.
- **`ForgotPassword.tsx`**: Password recovery flow.

### `src/types`
TypeScript type definitions for data models (User, Post, etc.).

### `src/utils`
Helper functions for formatting, validation, etc.

## 5. Styling & Theme

We use **Tailwind CSS** with a custom configuration (`tailwind.config.js`).

### Design System
- **Colors**:
    - **Primary**: A teal/cyan scale (`#0aa7c6` base).
    - **Background**: `var(--bg-surface)` and `var(--bg-muted)`.
    - **Surface**: `var(--on-surface)` text colors.
    - **Accent**: `#f59e0b` (Amber).

### Glassmorphism
The UI heavily utilizes glassmorphism effects (translucent backgrounds with blur), often implemented via utility classes like `backdrop-blur-md bg-white/30`.

## 6. Authentication Flow

1.  **Selection**: User chooses an instance (sets `INSTANCE_BASE_URL`).
2.  **Login**: User credentials are sent to `/auth/login`.
3.  **Token**: Server returns a JWT or auth token.
4.  **Storage**: Token is stored in `localStorage` (`AUTH_TOKEN` or `access_token`).
5.  **Requests**: `getApi()` interceptor attaches `Authorization: Bearer <token>` to subsequent requests.
