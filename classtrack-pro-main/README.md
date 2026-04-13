# ClassTrack Pro

A modern attendance tracking and analytics application built with React, TypeScript, and Tailwind CSS.

## Features

- **Attendance Management** - Track student attendance with ease
- **Analytics Dashboard** - View attendance statistics and trends
- **User Profiles** - Manage user information and settings
- **Subject Management** - Organize and manage subjects
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization
- **Testing**: Playwright + Vitest
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or bun package manager

### Installation

```bash
# Install dependencies
npm install

# or with bun
bun install
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

### Testing

```bash
# Run all tests
npm test

# Watch mode for tests
npm run test:watch

# Run Playwright tests
npx playwright test
```

### Linting

```bash
# Check for linting errors
npm run lint
```

## Project Structure

```
src/
├── components/     # React components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── test/          # Test files
└── App.tsx        # Main application component
```

## License

MIT
