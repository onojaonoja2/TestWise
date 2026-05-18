# TestWise - Intelligent Examination Platform

TestWise is a secure, AI-enhanced examination platform designed to empower educational institutions with reliable testing tools. It offers a comprehensive suite of features for creating, managing, and monitoring online examinations with AI-powered document processing.

## Key Features

### 1. AI-Powered Document Processing
- **Document Upload:** Support for PDF, DOCX, and TXT files
- **LLM-Native Chat:** Chat directly with uploaded documents (like Gemini)
- **Auto Question Generation:** Generate quiz questions from document content using AI
- **Fast Processing:** Documents processed in seconds, not minutes

### 2. Secure Examination Environment
- **Anti-Cheating Suite:** Browser focus tracking with warning system (3 warnings before submission)
- **Real-time Monitoring:** Teachers can monitor student activity and submission status live
- **Role-based Access:** Granular permissions for Admins, Teachers, and Students
- **Organization Isolation:** Data separated by organization

### 3. Flexible Test Creation
- **Multiple Question Types:** Multiple Choice, True/False, and Short Answer
- **AI Generation:** Generate questions from uploaded documents
- **Customizable Settings:** Duration, visibility (Public/Organization/Whitelist), target audience
- **Bio Data Collection:** Collect student info before test starts

### 4. Student Experience
- **User-Friendly Interface:** Clean dashboard for taking tests
- **Timer Management:** Auto-submit when time expires
- **Warning System:** Alerts when leaving the test window
- **Instant Results:** Immediate scoring and feedback

### 5. Organization Management
- **Multi-Tenancy:** Multiple organizations with separate admins
- **Student Groups:** Create groups and bulk add students
- **Sub-Admins:** Delegate management permissions to teachers

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                    Next.js React App (Port 3000)                 │
└─────────────────────────────────────────────────────────────────┘
                                   │
               ┌───────────────────┼───────────────────┐
               ▼                   ▼                   ▼
        ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
        │ PostgreSQL  │     │    AWS S3    │     │    Redis    │
        │  (Prisma)   │     │  (Documents)│     │  (BullMQ)   │
        │  Database   │     │   Storage   │     │   Queues    │
        └─────────────┘     └─────────────┘     └─────────────┘
```

### How S3 Works
- Uploaded documents stored in S3: `uploads/{userId}/{uuid}-{filename}`
- Worker downloads from S3, extracts text, stores in database
- S3 enables scalable file storage separate from database

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL Database (with pgvector extension optional)
- AWS S3 Bucket (or compatible storage)
- Redis (for job queue)
- OpenRouter API Key (for AI features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/onojaonoja2/TestWise.git
   cd TestWise
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
   
   Required environment variables:
   ```env
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_S3_BUCKET=...
   OPENROUTER_API_KEY=...
   NEXTAUTH_SECRET=...
   ```

4. **Database Setup:**
   ```bash
   npx prisma db push
   ```

5. **Start the application:**
   ```bash
   # Start Next.js dev server
   npm run dev
   
   # In another terminal, start the document worker
   npm run worker
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run worker` | Start BullMQ document processing worker |
| `npm run lint` | Run ESLint |
| `npm run build` | Build for production |

## Functionality Overview

### For Admins
- View all organizations and manage users
- Create/delete organizations
- Assign sub-admin roles to teachers
- Monitor all tests across organizations

### For Teachers
- **Create Tests:** Build exams with multiple question types
- **AI Question Generation:** Upload documents and generate quiz questions automatically
- **Chat with Documents:** Ask questions about document content
- **Monitor Exams:** Watch live student activity
- **Manage Groups:** Create and manage student groups
- **Publish/Archive Tests:** Control test availability

### For Students
- **Take Tests:** Access tests via links or dashboard
- **View Results:** See scores after submission
- **Bio Data:** Fill required information before starting

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16, React, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Prisma ORM) |
| Auth | NextAuth.js |
| File Storage | AWS S3 |
| Job Queue | BullMQ + Redis |
| AI Integration | OpenRouter API (LLM) |
| Styling | Tailwind CSS, Lucide Icons |

## API Endpoints

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - List documents
- `DELETE /api/documents/[id]` - Delete document
- `POST /api/documents/[id]/chat` - Chat with document
- `POST /api/documents/[id]/generate` - Generate questions

### Tests
- `GET/POST /api/tests` - List/create tests
- `GET/PATCH/DELETE /api/tests/[id]` - Test CRUD
- `POST /api/tests/[id]/submit` - Submit test

### Organizations
- `GET/POST /api/organizations` - List/create organizations
- `GET/POST /api/organizations/[orgId]/users` - Manage users

## Security Features

- JWT session management with NextAuth
- Role-based middleware protection
- Organization-scoped data access
- Test visibility controls (Public/Organization/Whitelist)
- Submission monitoring with anti-cheat warnings

## Contact

For support or inquiries:
- **Email:** byteops.digital@gmail.com
- **WhatsApp:** +234 708 090 4982

---

Made with ❤️ by ByteOps Digital Systems