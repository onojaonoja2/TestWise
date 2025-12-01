# TestWise 🎓

TestWise is a comprehensive, modern Exam Management System built with Next.js 14. It empowers educational organizations to create, manage, and conduct online examinations with ease. Featuring role-based access control, real-time monitoring, and detailed analytics, TestWise provides a seamless experience for administrators, teachers, and students.

## 🚀 Features

### 👥 Role-Based Access Control (RBAC)
- **Admin**: Manage organizations, users, and system-wide settings.
- **Teacher**: Create tests, manage student groups, monitor live exams, and view results.
- **Student**: Take assigned tests, view history, and track performance.

### 📝 Test Management
- **Rich Question Types**: Support for Multiple Choice, True/False, and Short Answer questions.
- **Flexible Visibility**:
  - **Public**: Accessible to anyone with the link.
  - **Organization Only**: Restricted to logged-in users within the organization.
  - **Whitelist**: Restricted to specific email addresses or student groups.
- **Bio-Data Collection**: Customizable fields (e.g., Student ID, Department) to collect info before the exam.
- **Time Limits**: Enforce strict duration limits for tests.

### 👁️ Live Monitoring & Security
- **Real-time Dashboard**: Teachers can monitor active students, their status (Started/Completed), and connection health.
- **Tab Focus Tracking**: Detects when students switch tabs or lose focus (Warnings system).
- **Heartbeat System**: Tracks student connectivity during the exam.

### 📊 Results & Analytics
- **Automated Grading**: Instant scoring for objective questions.
- **Detailed Reports**: View individual student performance, including time taken and specific answers.
- **Exportable Data**: (Future feature) Export results for external processing.

### 🏫 Organization & Group Management
- **Multi-Tenancy Support**: Built to handle multiple organizations.
- **Student Groups**: Teachers can create groups (classes) for easy test assignment.
- **Bulk Import**: Import students from groups directly into test whitelists.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/testwise.git
    cd testwise
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add the following variables:

    ```env
    # Database Connection
    DATABASE_URL="postgresql://user:password@localhost:5432/testwise?schema=public"

    # NextAuth Configuration
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your-super-secret-key-change-this"
    ```

4.  **Database Setup**
    Push the Prisma schema to your database:

    ```bash
    npx prisma db push
    ```

5.  **Run the Development Server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📖 Usage Guide

### For Administrators
1.  Log in with your admin credentials.
2.  Navigate to the **Admin Dashboard**.
3.  Create new **Organizations** and assign **Teachers**.
4.  Manage user accounts and permissions.

### For Teachers
1.  Log in to your dashboard.
2.  **Create a Test**: Click "Create New Test", set the title, duration, and visibility. Add questions and define bio-data fields.
3.  **Manage Groups**: Go to "Student Groups" to create classes and add students.
4.  **Monitor**: When a test is live, use the "Monitor" tab to watch student progress in real-time.
5.  **View Results**: Access detailed scorecards after students complete the test.

### For Students
1.  Log in or access a public test link.
2.  Fill in any required bio-data.
3.  Complete the test within the time limit.
4.  View your score immediately (if enabled).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🚀 Deployment

### Deploy to Vercel

1.  **Push to GitHub**: Ensure your project is pushed to a GitHub repository.
2.  **Import Project**: Go to [Vercel](https://vercel.com/), click "Add New...", and select "Project". Import your GitHub repository.
3.  **Environment Variables**: In the Vercel project settings, add the following environment variables:
    -   `DATABASE_URL`: Your Aiven Postgres connection string (e.g., `postgres://user:password@host:port/defaultdb?sslmode=require`).
    -   `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://your-project.vercel.app`).
    -   `NEXTAUTH_SECRET`: A strong random string (generate one with `openssl rand -base64 32`).
4.  **Deploy**: Click "Deploy". Vercel will build and deploy your application.

### Database Setup (Aiven)

1.  **Create Service**: Create a PostgreSQL service on [Aiven](https://aiven.io/).
2.  **Get Connection String**: Copy the "Service URI" from the Aiven console.
3.  **Update Schema**: Run the following command locally to push your schema to the Aiven database (ensure `.env` has the Aiven URL):
    ```bash
    npx prisma db push
    ```

## 📄 License

This project is licensed under the MIT License.
