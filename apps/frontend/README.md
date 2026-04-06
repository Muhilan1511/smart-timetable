# Frontend - Coordinator Portal

React 18 + TypeScript + Vite frontend for the Smart Timetable Scheduler.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs on `http://localhost:5173` and proxies API calls to `http://localhost:4000/api/v1`.

## Build

```bash
npm run build
```

## Features

- **Authentication**: JWT-based login with role-based access (ADMIN, COORDINATOR)
- **Master Data Management**: Manage departments and classrooms
- **Setup Entities**: Configure shifts, programs, batches, subjects, and faculty
- **Constraints**: Define faculty availability and fixed class schedules
- **Timetable Generation**: Generate optimized timetables with multi-option comparison
- **Approval Workflows**: Review and approve timetables through state machine
- **Export**: Export timetables as JSON, HTML, or PDF

## Architecture

- **State Management**: Redux Toolkit for auth state
- **Routing**: React Router v6
- **HTTP Client**: Axios with token management
- **Styling**: CSS modules (Section.css, LoginPage.css, etc.)

## Directory Structure

```
src/
  ├── api/              # API client and service functions
  ├── components/       # Reusable React components
  │   └── sections/     # Dashboard section components
  ├── pages/            # Full-page components (Login, Dashboard)
  ├── store/            # Redux store and slices
  ├── styles/           # CSS stylesheets
  ├── types.ts          # TypeScript type definitions
  ├── App.tsx           # Main app with routing
  └── main.tsx          # Entry point
```
