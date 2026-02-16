# Heliix - Frontend Client

The responsive React-based user interface for the Heliix federated social network. This Client allows users to interact with multiple backend instances, creating a seamless federated experience.

## Key Features

- **Federated Instance Connectivity**: Connects to multiple backend instances (Instance A, Instance B) dynamically.
- **Modern UI**: A cyber-futuristic aesthetic featuring the unique "Doodle Bot" mascot and glassmorphism elements.
- **Interactive Elements**:
    - Animated post creation with smooth transitions.
    - Real-time feed updates.
    - Interactive user search and connection management.
- **Responsiveness**: Fully optimized layouts for both mobile devices (with drawer navigation) and desktop views.

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **API Communication**: Axios

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

1.  Navigate to the frontend directory:
    ```bash
    cd fsn-frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running Locally

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### Building for Production

To build the application for deployment:
```bash
npm run build
```
The build artifacts will be generated in the `dist` directory.

## Configuration

- **Instances**: Backend instances are configured in `src/config/instances.ts`. You can add or modify instance URLs and branding colors here.
- **API Connection**: `src/api/api.ts` handles the API logic. It dynamically connects to the instance selected by the user on the landing page (stored in `localStorage`).

## Project Structure

- `src/components`: Reusable UI components (Buttons, Modals, Mascot, etc...).
- `src/pages`: Main application views (Dashboard, Login, Profile, etc...).
- `src/api`: API definition and Axios configuration.
- `src/config`: Static configuration for instances and app constants.
- `src/utils`: Helper functions and hooks.
