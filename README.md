# Admin Panel

A modern admin panel built with Next.js, TypeScript, Zustand, and Tailwind CSS.

## Features

- 🔐 Authentication system with login page
- 📊 Dashboard with statistics and charts
- 👥 Users management with full CRUD operations
- 📝 Posts viewing and management
- ✅ Todos management with filtering
- 🌓 **Dark mode support** (Light, Dark, System preference)
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design
- 🚀 Ready for Vercel deployment

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Jest** - Unit testing
- **JSONPlaceholder API** - Open source REST API for testing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Login

Use any email and password to login (demo mode). The authentication is stored in localStorage.

## Testing

Run unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests for CI (no watch mode):
```bash
npm run test:ci
```

Run type checking:
```bash
npm run type-check
```

### E2E Testing with Playwright and Cucumber

Run E2E tests with Cucumber:
```bash
npm run test:e2e
```

Run E2E tests with Playwright UI:
```bash
npm run test:e2e:ui
```

Run E2E tests in headed mode (see browser):
```bash
npm run test:e2e:headed
```

Run E2E tests for CI:
```bash
npm run test:e2e:ci
```

## CI/CD

This project uses GitHub Actions to automatically run tests on every pull request. The workflow:

- ✅ Runs TypeScript type checking
- ✅ Runs all unit tests with coverage
- ✅ Builds the project to ensure it compiles
- ✅ Runs E2E tests with Playwright
- ✅ Uploads test reports as artifacts

The tests will run automatically when you:
- Open a pull request to `main` or `develop` branches
- Push commits to `main` or `develop` branches

## Project Structure

```
admin-panel/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── users/             # Users CRUD page
│   ├── posts/             # Posts page
│   ├── todos/             # Todos page
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── Layout.tsx         # Main layout with sidebar
│   └── Sidebar.tsx        # Sidebar navigation
├── store/                 # Zustand stores
│   └── authStore.ts       # Authentication store
├── lib/                   # Utilities
│   └── api.ts             # API client functions
├── __tests__/             # Unit tests
└── package.json
```

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and configure the build
4. Deploy!

The project is already configured with `vercel.json` for optimal deployment.

## API

This project uses [JSONPlaceholder](https://jsonplaceholder.typicode.com) - a free fake REST API for testing and prototyping.

### Available Endpoints

- **Users**: `/users` - Full CRUD operations
- **Posts**: `/posts` - View posts
- **Todos**: `/todos` - View todos with filtering

## License

MIT
