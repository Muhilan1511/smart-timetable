# Smart Classroom & Timetable Scheduler - V1 Implementation

**Status**: Phase 3-4 Underway | Core API + Export Service Complete | Frontend Scaffold Ready

## Quick Start

### Prerequisites
- Node.js 20+
- Firebase project with Authentication and Realtime Database enabled

### Setup & Run

#### 1. Frontend
```bash
cd apps/frontend
npm install
npm run dev        # Run on localhost:5173
```

#### 2. Firebase setup
Enable Google sign-in in Firebase Authentication and create a Realtime Database instance.

Set the frontend env vars in `apps/frontend/.env.local` if you do not want to use the built-in fallback config:
```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

## Project Structure

- **`apps/api`**: Node.js + TypeScript API for timetable orchestration and data management.
- **`apps/frontend`**: React 18 + Vite + TypeScript coordinator portal UI with Firebase Google sign-in.
- **`services/solver`**: Python FastAPI optimization service with OR-Tools integration.

## Architecture

### Backend (Node.js + TypeScript)
- **Framework**: Express.js
- **Database**: PostgreSQL 16 with 13 normalized tables
- **Auth**: Firebase Authentication on the frontend, with Realtime Database user profiles
- **Pattern**: Repository pattern for data access + service layer

**Key Endpoints**:
- `/api/v1/auth` - Authentication
- `/api/v1/master` - Departments, Classrooms
- `/api/v1/setup` - Shifts, Programs, Batches, Subjects, Faculty
- `/api/v1/constraints` - Faculty Availability, Fixed Classes
- `/api/v1/optimize` - Timetable optimization request
- `/api/v1/timetables` - Timetable CRUD and export
- `/api/v1/workflows` - Approval state machine

### Solver (Python + FastAPI)
- **Optimization**: OR-Tools CP-SAT with constraint model
- **Algorithm**: Generate multiple variants with conflict detection
- **Constraints**: Faculty availability, room capacity, no double-booking

**Endpoints**:
- `POST /optimize` - Generate timetable candidates

### Frontend (React 18 + Vite + TypeScript)
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios with token management

**Sections**:
1. **Master Data**: Departments, Classrooms (admin-focused)
2. **Setup Entities**: Shifts, Programs, Batches, Subjects, Faculty
3. **Constraints**: Faculty availability, fixed classes
4. **Timetables**: Generation, versioning, export (JSON/HTML/PDF)
5. **Workflows**: Review, approval, history timeline

## Database Schema

### Core Tables
- `departments` - Institution departments
- `classrooms` - Room inventory with capacity
- `shifts` - Daily shift definitions (start/end time)
- `programs` - Academic programs
- `batches` - Cohorts within programs
- `subjects` - Course offerings
- `faculty` - Faculty members with qualifications

### Constraint Tables
- `faculty_availability` - When faculty are available/unavailable
- `fixed_classes` - Pre-scheduled mandatory classes

### Persistence Tables
- `timetable_generations` - Generated schedules with status (DRAFT → COORD_REVIEW → ADMIN_APPROVED → PUBLISHED)
- `scheduled_classes` - Individual class assignments
- `approval_workflows` - Multi-step approval state machine
- `approval_history` - Audit trail of all workflow transitions

## API Endpoints

### Authentication
- Google sign-in through Firebase Authentication
- Signed-in users are mirrored to Firebase Realtime Database under `users/{uid}`

### Master Data
- `GET /api/v1/master/departments`
- `POST /api/v1/master/departments`
- `GET /api/v1/master/classrooms`
- `POST /api/v1/master/classrooms`

### Setup Data
- `GET /api/v1/setup/shifts`
- `POST /api/v1/setup/shifts`
- `GET /api/v1/setup/programs`
- `POST /api/v1/setup/programs`
- `GET /api/v1/setup/batches`
- `POST /api/v1/setup/batches`
- `GET /api/v1/setup/subjects`
- `POST /api/v1/setup/subjects`
- `GET /api/v1/setup/faculty`
- `POST /api/v1/setup/faculty`

### Constraints
- `GET /api/v1/constraints/faculty-availability`
- `POST /api/v1/constraints/faculty-availability`
- `GET /api/v1/constraints/fixed-classes`
- `POST /api/v1/constraints/fixed-classes`

### Timetable Management
- `GET /api/v1/timetables` - List timetables (filters: departmentId, shiftId, status)
- `GET /api/v1/timetables/:id` - Get timetable with scheduled classes
- `POST /api/v1/timetables` - Create timetable from optimization results
- `PATCH /api/v1/timetables/:id/status` - Update timetable status
- `POST /api/v1/timetables/:id/publish` - Publish timetable with date range
- `GET /api/v1/timetables/:id/export/json` - Export as JSON
- `GET /api/v1/timetables/:id/export/html` - Export as HTML

### Approval Workflows
- `GET /api/v1/workflows/:timetableId` - Get workflow with history
- `POST /api/v1/workflows/:timetableId/submit-review` - Coordinator submits
- `POST /api/v1/workflows/:timetableId/approve` - Admin approves
- `POST /api/v1/workflows/:timetableId/reject` - Admin rejects
- `POST /api/v1/workflows/:timetableId/return` - Return to draft

### Optimization
- `POST /api/v1/optimize`
  - Requires bearer token from login.
  - Assembles solver input from database (shifts, batches, subjects, faculty, classrooms, availability, fixed classes).
  - Forwards enriched request to solver service.
  - Solver validates constraints and returns conflict-aware timetable options.

## Implementation Progress

### ✅ Completed
- **Phase 1**: Project foundation, dev tooling
- **Phase 1**: Firebase Google authentication and user profile sync
- **Phase 2**: Master data CRUD (departments, classrooms)
- **Phase 2**: Setup entity CRUD (shifts, programs, batches, subjects, faculty) with filters
- **Phase 2**: Constraint input (faculty availability, fixed classes)
- **Phase 3**: Solver input assembly (enriches requests with full context from DB)
- **Phase 3**: Constraint validation framework (availability, capacity, overlaps)
- **Phase 3**: OR-Tools optimizer class with multi-variant generation
- **Phase 3**: Timetable persistence schema with status tracking and versioning
- **Phase 3**: Approval workflow schema with state machine and audit history
- **Phase 4**: Export service (HTML, JSON; PDF framework ready)
- **Phase 4**: React frontend scaffold (login, dashboard, sidebar, section components)

### 🔄 In Progress
- **Phase 4**: Firebase Google authentication integration
- **Phase 4**: Realtime Database persistence for user/session data

### ⏳ Pending
- **Phase 4**: Data table implementation with real API data
- **Phase 4**: Manual timetable adjustment UI (drag-drop)
- **Phase 5**: E2E testing and UAT
- **Phase 5**: Performance optimization and load testing
- **Phase 5**: Local pilot deployment and documentation

## Key Features

### Timetable Generation
- **Multi-option generation**: Returns 3 conflict-free candidates per request
- **Conflict awareness**: Reports conflict count and quality score per option
- **Constraint validation**: Checks availability, capacity, room overlap before generation

### Approval Workflow
- **State machine**: PENDING → COORDINATOR_REVIEW → ADMIN_REVIEW → APPROVED/REJECTED
- **Audit trail**: Complete history of all reviews with reviewer ID and timestamps
- **Flexibility**: Return to draft, reject with reason, approve with notes

### Export & Publishing
- **JSON export**: Structured data for integration with other systems
- **HTML export**: Calendar-style format for web posting
- **Batch export**: All classes grouped by batch with sorted display

### Data Entry
- **Department-scoped isolation**: Prevents cross-department data contamination
- **Shift-based filtering**: Constraints and assignments scoped to shift
- **Batch-level management**: Assign faculty, subjects per batch
- **Faculty availability**: Define unavailable time slots per faculty

## Configuration

### Environment Variables

**Frontend** (`.env.local`):
```
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

## Testing

### Unit Tests (Backend)
```bash
cd apps/api
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Solver Tests
```bash
cd services/solver
pytest tests/
```

## Performance

- **Solver timeout**: 30 seconds per optimization request
- **Timetable size**: Handles up to 500 classes per schedule
- **Concurrent users**: Designed for 10-50 coordinators
- **Database**: Indexed on (departmentId, shiftId, batchId, facultyId, classroomId)

## Known Limitations (V1)

1. **No real-time updates**: Schedule changes require full regeneration
2. **No SIS integration**: Manual data import required (CSV templates v1.1)
3. **No mobile UI**: Desktop-only (v1.1 consideration)
4. **No print optimization**: Basic HTML/JSON export only

## Support

For questions or issues, refer to:
- Architecture: `/docs/architecture/`
- Setup guides: `/docs/setup/`
- API documentation: Auto-generated at `http://localhost:4000/api/v1/docs` (v1.1)

---

**Last Updated**: January 2025
**Status**: Ready for Phase 4-5 implementation

## Usage Flow

1. **Setup**: Create departments, shifts, programs, batches, subjects, faculties, classrooms.
2. **Configure Constraints**: Add faculty availability and define fixed classes.
3. **Optimize**: Submit optimize request; API assembles full context from DB and sends to solver.
4. **Review**: Solver returns multiple candidates with conflict counts and quality scores.
5. **Approve**: Select best option and publish (workflow not yet implemented).

## Database Schema

Key tables:
- `departments`: Academic departments
- `shifts`: Time slots (morning, afternoon, evening)
- `programs`: Degree programs within departments
- `batches`: Student cohorts for programs
- `subjects`: Courses within programs
- `faculty`: Faculty members assigned to departments
- `classrooms`: Rooms with capacity and facilities
- `faculty_availability`: When faculty can/cannot teach
- `fixed_classes`: Pre-scheduled mandatory classes
- `constraints`: Configurable hard/soft constraint rules (future)

See [001_init.sql](apps/api/migrations/001_init.sql) for full schema.

## Next Implementation Targets

1. Add workflow states: draft -> reviewed -> approved -> published.
2. Implement real OR-Tools model in Python solver for optimal constraint resolution.
3. Add ability to manually adjust timetables and re-optimize iteratively.
4. Persist timetable versions and approval audit trail.
5. Add data import/export (CSV) for batch setup.
6. Integrate with college website for publishing.
# smart-timetable
