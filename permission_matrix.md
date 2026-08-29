# LearnHub Permission Matrix

This document outlines the strict access control rules for the LearnHub LMS project. **All future development, UI rendering, routing, and API logic must strictly adhere to this matrix.**

Getting this 4-role access control right — cleanly, without leaks — is a core requirement of this platform.

| Action | Admin | Content Manager | Instructor | Student |
| :--- | :---: | :---: | :---: | :---: |
| **Manage users & assign roles** | ✅ | ❌ | ❌ | ❌ |
| **Create / edit / delete any course** | ✅ | ✅ | Own only | ❌ |
| **Add / edit / delete lessons** | ✅ | ✅ | Own courses | ❌ |
| **Create quizzes** | ✅ | ✅ | Own courses | ❌ |
| **View student progress** | ✅ | ✅ | Own courses | Own only |
| **Write / manage blog posts** | ✅ | ✅ | ❌ | ❌ |
| **Enroll in a course** | ❌ | ❌ | ❌ | ✅ |
| **Take quizzes** | ❌ | ❌ | ❌ | ✅ |

---

## Role Definitions & UI Constraints

### 1. Admin
- **Highest Privilege:** Has global oversight of the entire platform.
- **UI Tabs Available:** `Admin Panel`, `Manage Blog`, `Manage Courses`.
- **Constraint:** Admins cannot enroll in courses or take quizzes. They should see a "Preview Mode (Staff)" state instead of enrollment buttons.

### 2. Content Manager
- **Content & Oversight:** Manages both platform content (blogs) and global course content. They are effectively course administrators but cannot manage users.
- **UI Tabs Available:** `Manage Blog`, `Manage Courses`.
- **Constraint:** Content Managers cannot enroll in courses or take quizzes. No "My Learning" tab should be visible.

### 3. Instructor
- **Course Creator:** Manages only their own courses, lessons, and quizzes. Tracks progress only for students enrolled in their specific courses.
- **UI Tabs Available:** `Manage Courses`.
- **Constraint:** Instructors cannot enroll in courses, take quizzes, or write blog posts.

### 4. Student (Default Authenticated Role)
- **Learner:** The core consumer of the platform.
- **UI Tabs Available:** `My Learning` (Standard Dashboard).
- **Constraint:** Students can enroll in courses, view their own progress, and take quizzes. They have absolutely no access to content management, course creation, or admin panels.

---
*Note for AI Agents: Always consult this file before adding new features, buttons, or API routes to ensure you do not inadvertently leak permissions across roles.*
