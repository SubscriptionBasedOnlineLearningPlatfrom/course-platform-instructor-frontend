# ProLearnX Instructor Guide

Welcome to **ProLearnX**, the instructor workspace of the Subscription-Based Online Learning Platform. This guide walks you through every tool available to you—from creating your first course to grading student submissions—so you can focus on delivering an outstanding learning experience.

> **Audience:** Instructors and content teams using the instructor portal (`course-platform-instructor-frontend`).
>
> **Environment baseline:** Backend deployed at `https://course-platform-backend-ten.vercel.app` (or your own instance) and this frontend hosted on Vercel/local development with `VITE_BACKEND_URL` pointing to the backend.

---

## Table of Contents
1. [Getting Started](#getting-started)
   - [Browser & device support](#browser--device-support)
   - [Configure the environment (dev teams)](#configure-the-environment-dev-teams)
   - [Creating or accessing your account](#creating-or-accessing-your-account)
   - [Understanding authentication & sessions](#understanding-authentication--sessions)
2. [Navigating the Interface](#navigating-the-interface)
   - [Dashboard](#dashboard)
   - [Sidebar & layout](#sidebar--layout)
   - [Toasts & alerts](#toasts--alerts)
3. [Profile & Identity](#profile--identity)
   - [Editing your profile](#editing-your-profile)
   - [Updating the profile photo](#updating-the-profile-photo)
   - [Changing your password](#changing-your-password)
4. [Course Lifecycle](#course-lifecycle)
   - [Creating a course](#creating-a-course)
   - [Viewing & editing existing courses](#viewing--editing-existing-courses)
   - [Curriculum builder (modules & chapters)](#curriculum-builder-modules--chapters)
   - [Uploading learning materials](#uploading-learning-materials)
   - [Managing quizzes](#managing-quizzes)
   - [Deleting courses, modules, or chapters](#deleting-courses-modules-or-chapters)
5. [Learner Management](#learner-management)
   - [Enrollment overview](#enrollment-overview)
   - [Grading student submissions](#grading-student-submissions)
   - [Managing comments & replies](#managing-comments--replies)
   - [Learner feedback carousel](#learner-feedback-carousel)
6. [Shortcuts, Tips & Best Practices](#shortcuts-tips--best-practices)
7. [Troubleshooting & FAQs](#troubleshooting--faqs)
8. [Appendix: Key Routes & API Touchpoints](#appendix-key-routes--api-touchpoints)

---

## Getting Started

### Browser & device support
- **Desktop:** Chrome, Edge, Safari, Firefox (latest two versions) are fully supported.
- **Tablet:** Works best in landscape mode. The sidebar collapses into a hamburger menu automatically.
- **Mobile:** View-only access for dashboards; course authoring flows are optimized for screens ≥1024px.

### Configure the environment (dev teams)
If you run the instructor frontend locally, create a `.env` file at the project root (already git-ignored) and set:

```bash
VITE_BACKEND_URL=https://course-platform-backend-ten.vercel.app
```

Restart the dev server after changes. All authenticated API calls depend on this value—misconfiguration leads to `401` or CORS errors.

### Creating or accessing your account
1. Navigate to `/login` or click **Login** in the sidebar.
2. Pick **Sign Up** to create an instructor account:
   - Provide username, email, password (confirmation required).
   - Successful registration automatically stores your JWT and redirects to the dashboard.
3. Prefer to sign in with Google? Click **Continue with Google**—on success the backend redirects back with `token` and a serialized `user` payload embedded in the URL. The app saves both to `localStorage` and removes the query parameters.
4. Existing users choose **Sign In** and enter email/password.

> **Password reset:** From the login tab click **Forgot password?**. If an email is filled in, a reset link is requested through `/auth/reset-password`.

### Understanding authentication & sessions
- Tokens are stored in `localStorage` under the `token` key alongside a `user` object. Closing the browser keeps you logged in until the JWT expires.
- Logging out clears `token`, `user`, and cached `instructorProfileImages`, emits a storage event, and refreshes the app state across tabs.
- Guest users (no token) can browse the dashboard in read-only mode, but protected routes redirect to `/login`.

---

## Navigating the Interface

### Dashboard
Once logged in, the **Dashboard** ( `/dashboard` ) becomes your home screen:
- **Profile Card:** Quick glance at name, role, and shortcuts to update profile info.
- **Course Overview:** Lists your courses (title, category, status). Use **Create Course** shortcut from here.
- **Learner Feedback Carousel:** Rotating testimonials to keep engagement insights top-of-mind.
- Guest users see a promotional banner encouraging them to sign in.

### Sidebar & layout
- Permanent on desktop; collapsible on small screens via the hamburger icon.
- Key links for instructors:
  - **Dashboard** – overview page.
  - **My Profile** – edit personal details.
  - **Course Management** – expands to *Add Course* and *Course List*.
  - **Show Enrolled Students** – enrollment analytics.
  - **Comments & Replies** – respond to learner discussions.
  - **Learner Feedback** – direct link to carousel content.
- Footer button toggles between **Login** and **Sign Out** depending on session state.

### Toasts & alerts
- Course creation, quiz actions, and many API interactions surface immediate feedback via toast notifications (`sonner` / `react-toastify`). Read them—they include validation errors and success confirmations.

---

## Profile & Identity

### Editing your profile
1. Go to **My Profile** (`/profile`).
2. Click **Edit Profile** to unlock the form.
3. Required fields: **Full Name** and **Email**.
4. Optional fields: phone, website, portfolio, Instagram handle, bio, expertise tags (comma-separated).
5. Save updates to persist them via `PUT /instructor/profile/`. The app also syncs the `user` object in `localStorage`.

### Updating the profile photo
- Within edit mode, the **Profile Image** section provides an uploader (`ProfileImageUpload`).
- Images upload through the backend’s media pipeline; successful uploads immediately refresh the displayed avatar.

### Changing your password
- Navigate to **Update Password** (`/update-password`) from the sidebar or route list.
- Follow the on-screen form. (The flow interacts with `/auth/change-password` on the backend.)

---

## Course Lifecycle

### Creating a course
Access **Add Course** via the sidebar or **Create Course** button on the dashboard.

Fields & actions in the form:
1. **Course Title** – required.
2. **Category** – select from programming, design, business, language.
3. **Description** – at least 10 characters.
4. **Difficulty Level** – Beginner, Intermediate, Advanced.
5. **Duration (hours)** – optional numeric input.
6. **Requirements** – optional text area for prerequisites.
7. **Thumbnail Upload** – supports JPG/PNG up to 5 MB. Drag-and-drop or click to select, with preview & remove actions.

On submission the UI:
- Converts the form into `FormData` so the thumbnail travels with the request.
- Sends a `POST /instructor/courses` request with `Authorization: Bearer <token>`.
- Displays success toast and reroutes to **Course List** (`/view-courses`).

> **Tip:** If you see “Please login first,” your token is missing/expired—log in again and retry.

### Viewing & editing existing courses
- **Course List** (`/courses` or `/view-courses`): interactive cards with view/edit actions.
- **Dashboard → Your Courses** also lists summaries. Click **View** to inspect details at route `/courses/:courseId`.
- Editing uses the same API (`PUT /instructor/courses/:courseId`). Make sure to re-upload thumbnails if you want to replace them.

### Curriculum builder (modules & chapters)
Open **Curriculum** via `/courses/:courseId/curriculum`:
1. **Add Module** – provide a module name, click **Add Module**. Modules render as expandable panels.
2. **Add Chapter** – inside a module, type a lesson title and click **Add Chapter**. Each chapter becomes a row.
3. **Reopen modules** by clicking the header chevrons.
4. **Delete** modules or chapters using the trash icon—confirmation dialogs protect against accidental removal.

The page reads data from `GET /instructor/modules/:courseId` and updates via `POST`/`DELETE` endpoints (`APIContext`).

### Uploading learning materials
Within each chapter card you can attach resources:
- **Add Video** (`POST /instructor/chapters/:lessonId/video`)
- **Add Note** (`POST /instructor/chapters/:lessonId/note`)
- **Add Assignment** (`POST /instructor/chapters/:lessonId/assignment`)

All three open a system file picker and upload via `FormData`. The buttons gray out once a resource exists—delete it to re-upload.

### Managing quizzes
1. From a chapter card, click **Add Quiz** to open `/create-quiz/:lessonId`.
2. Enter a **Quiz Title**, draft questions, supply answer options (≥2), select the correct option, and click **Add Question to List**.
3. Repeat for multiple questions. Use the “🗑️” icon to remove answers or entire questions.
4. Save with **Save Quiz** (`POST /instructor/quizzes/create/:lessonId`).
5. Already have a quiz? Use **Edit Quiz** to jump to `/edit-quiz/:lessonId/:quizId`.
6. **Export** (JSON download) and **Import** (JSON upload) let you reuse quiz templates.

### Deleting courses, modules, or chapters
- Deleting a **module** triggers `DELETE /instructor/modules/:moduleId` and removes all attached chapters.
- Deleting a **chapter** hits `DELETE /instructor/chapters/:lessonId` and clears associated resources/quizzes (confirm in prompt).
- Deleting an entire **course** uses `DELETE /instructor/courses/:courseId` and cascades through related content. Ensure you really want to remove it before confirming.

---

## Learner Management

### Enrollment overview
Visit `/EnrollmentOverview` to inspect enrollment analytics:
- Search bar filters by student name.
- Table (desktop) or cards (mobile) show **Total Enrollments**, **Completion Rate**, and **Certificates Issued** per learner.
- Data source: `GET /instructor/overview/enrollment` (requires valid token).

### Grading student submissions
1. From the curriculum page, click **View Student Submissions** (button at top right) or manually open `/courses/:courseId/submissions`.
2. The table lists each submission with student name, file reference, and editable grade field.
3. Enter grades (0–100 scale recommended) and click **Save** per row. Under the hood this calls `PATCH /instructor/submissions/:submissionId/grade`.
4. Pagination arrows move between pages of submissions (4 per page).

### Managing comments & replies
The **Comments & Replies** page (`/CommentsReplies`) allows you to:
- Search by learner name, course title, or comment text.
- Expand comments to show/hide replies.
- Respond inline: type your message and hit **Submit** (`POST /instructor/comments/:commentId/replies`).
- Edit replies (`PUT /instructor/comments/update-reply/:replyId`) or delete them (`DELETE /instructor/comments/delete-reply/:replyId`).
- Toasts confirm each action or warn on failure.

### Learner feedback carousel
The feedback carousel (dashboard and `/learner`) rotates testimonials. Use it during presentations or to review qualitative feedback trends.

---

## Shortcuts, Tips & Best Practices
- **Re-auth quickly:** If navigations suddenly redirect to `/login`, press ⌘+Shift+R (hard refresh) to wipe cached tokens, then sign in.
- **Thumbnail optimization:** Images ≥1920px convert to CDN-friendly formats. Prefer 16:9 aspect ratios for best card previews.
- **Module planning:** Create all modules first, then add chapters. Each module collapses so large courses stay manageable.
- **Quiz drafts:** The builder stores drafts in `localStorage` (`quizCreatorData`) until you clear them or submit, preventing accidental data loss.
- **Export quizzes before editing:** In case you need to revert to an earlier version, export the quiz JSON prior to large edits.
- **Use the enrollment search:** Type part of a name to quickly jump to specific learners.
- **Keep replies professional:** Replies surface to students immediately; edits and deletes are logged server-side.

---

## Troubleshooting & FAQs

**I keep seeing “Unauthorized” or “No authentication token found.”**
- Your session expired. Sign out (if possible), refresh the page, and log in again. Ensure `localStorage` isn’t blocked in your browser.

**Course creation fails with “Failed to create course.”**
- Check that your backend URL is correct and reachable.
- Confirm the thumbnail is smaller than 5 MB and a valid image.
- Inspect the toast message; backend validation errors are forwarded to you.

**Uploads or quiz saves hang indefinitely.**
- Network issues can interfere with `FormData` requests. Retry on a stable connection.
- Opening the browser console (⌥⌘I / F12) shows detailed error logs from the API helpers.

**Enrollment table is empty.**
- No enrollments exist yet, or your token lacks instructor privileges. Verify with an admin.

**Google login returns me to the login page.**
- The backend must whitelist your frontend domain. Confirm `ADMIN_FRONTEND_URL` or `INSTRUCTOR_FRONTEND_URL` is set server-side and redeploy.

**Where are files stored?**
- Media uploads leverage the backend’s integration with DigitalOcean Spaces. Uploaded filenames are normalized; the UI displays human-readable names by trimming generated prefixes.

---

## Appendix: Key Routes & API Touchpoints

| UI Route | Purpose | Backend Endpoint(s) |
| --- | --- | --- |
| `/dashboard` | Instructor overview | `GET /auth/dashboard`, `GET /instructor/courses` |
| `/profile` | Manage instructor profile | `GET/PUT /instructor/profile/` |
| `/create-course` | Course creation form | `POST /instructor/courses` |
| `/courses` / `/view-courses` | List/manage courses | `GET /instructor/courses`, `DELETE /instructor/courses/:id` |
| `/courses/:courseId/curriculum` | Modules & chapters | `GET /instructor/modules/:courseId`, `POST /instructor/modules/:courseId`, `POST /instructor/chapters/:moduleId`, `DELETE /instructor/...` |
| `/create-quiz/:lessonId` | Build quizzes | `POST /instructor/quizzes/create/:lessonId`, `GET /instructor/quizzes/:lessonId` |
| `/edit-quiz/:lessonId/:quizId` | Update quizzes | `PUT /instructor/quizzes/update/:quizId`, `DELETE /instructor/quizzes/:quizId` |
| `/courses/:courseId/submissions` | Grade submissions | `GET /instructor/submissions/:courseId`, `PATCH /instructor/submissions/:submissionId/grade` |
| `/EnrollmentOverview` | Enrollment analytics | `GET /overview/enrollment` |
| `/CommentsReplies` | Comment management | `GET /comments/comments`, `POST /comments/:id/replies`, `PUT /comments/update-reply/:replyId`, `DELETE /comments/delete-reply/:replyId` |
| `/login` | Auth portal | `POST /auth/login`, `POST /auth/register`, `GET /auth/google`, `POST /auth/reset-password` |

---

Need more help? Coordinate with the platform admins or open an issue in the repository. Happy teaching! 🎓
