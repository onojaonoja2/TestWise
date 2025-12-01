# TestWise - Intelligent Examination Platform

TestWise is a secure, AI-enhanced examination platform designed to empower educational institutions with reliable testing tools. It offers a comprehensive suite of features for creating, monitoring, and grading exams with ease.

## Key Features

### 1. Secure Examination Environment
*   **Anti-Cheating Suite:** Advanced browser locking and focus tracking to ensure exam integrity.
*   **Real-time Monitoring:** Teachers can monitor student activity and status in real-time.
*   **Access Control:** Granular permissions for Admins, Teachers, and Students.

### 2. Flexible Test Creation
*   **Multiple Question Types:** Support for Multiple Choice, True/False, and Short Answer questions.
*   **Rich Media Support:** Ability to include images and formatted text in questions.
*   **Customizable Settings:** Set duration, visibility (Public, Organization-only, Whitelist), and scheduling.

### 3. Student Experience
*   **User-Friendly Interface:** Clean and intuitive dashboard for taking tests.
*   **Auto-Save:** Answers are automatically saved to prevent data loss.
*   **Instant Feedback:** Immediate scoring and results for objective questions (optional).

### 4. Organization Management
*   **Multi-Tenancy:** Support for multiple organizations with their own admins and users.
*   **Group Management:** Create student groups for easier assignment of tests.
*   **Bulk Actions:** Import/Export students and results via CSV/Excel.

## Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   PostgreSQL Database

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/onojaonoja2/TestWise.git
    cd TestWise
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    *   Copy `.env.example` to `.env`:
        ```bash
        cp .env.example .env
        ```
    *   Fill in your database credentials and NextAuth secret in `.env`.

4.  **Database Setup:**
    ```bash
    npx prisma db push
    ```

5.  **Run the application:**
    ```bash
    npm run dev
    ```

## Functionality Overview

### For Admins
*   **Dashboard:** Overview of organization statistics (users, tests, submissions).
*   **User Management:** Add, edit, or remove teachers and students.
*   **Organization Settings:** Manage organization profile and defaults.

### For Teachers
*   **Create Tests:** Use the intuitive builder to create exams.
*   **Monitor Exams:** Watch live status of students taking tests.
*   **Grade & Review:** Auto-grading for objective questions; manual review for short answers.
*   **Export Results:** Download detailed Excel reports of student performance.

### For Students
*   **Take Tests:** Access assigned tests via the dashboard.
*   **View Results:** See scores and feedback after test completion.
*   **Profile:** Manage personal details and view history.

## Contact

For support or inquiries, please contact us:
*   **Email:** byteops.digital@gmail.com
*   **WhatsApp:** +234 708 090 4982

---
Made with ❤️ by ByteOps Digital Systems
