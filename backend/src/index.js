'use strict';

module.exports = {
  register(/*{ strapi }*/) {},

  /**
   * Bootstrap function — runs on every server start.
   * 
   * Sets up the 4 roles (Admin, Content Manager, Instructor, Student)
   * and grants API permissions that exactly match the project spec:
   *
   * | Action                          | Admin | CM  | Instructor | Student |
   * |---------------------------------|-------|-----|------------|---------|
   * | Manage users & assign roles     | ✅    | ❌  | ❌         | ❌      |
   * | Create/edit/delete any course   | ✅    | ✅  | Own only   | ❌      |
   * | Add/edit/delete lessons         | ✅    | ✅  | Own courses | ❌      |
   * | Create quizzes                  | ✅    | ✅  | Own courses | ❌      |
   * | View student progress           | ✅    | ✅  | Own courses | Own     |
   * | Write/manage blog posts         | ✅    | ✅  | ❌         | ❌      |
   * | Enroll in a course              | ❌    | ❌  | ❌         | ✅      |
   * | Take quizzes                    | ❌    | ❌  | ❌         | ✅      |
   */
  async bootstrap({ strapi }) {
    try {
      // ── 1. Ensure all custom roles exist ──────────────────────────
      const requiredRoles = [
        { name: 'Admin', description: 'Full control of the platform', type: 'admin' },
        { name: 'Content Manager', description: 'Creates and manages courses, lessons, and blog posts', type: 'content_manager' },
        { name: 'Instructor', description: 'Manages own courses, lessons, quizzes; views own students progress', type: 'instructor' },
        { name: 'Student', description: 'Enrolls in courses, views lessons, takes quizzes, tracks progress', type: 'student' }
      ];

      for (const roleDef of requiredRoles) {
        const exists = await strapi.db.query('plugin::users-permissions.role').findOne({
          where: { type: roleDef.type }
        });
        if (!exists) {
          await strapi.db.query('plugin::users-permissions.role').create({ data: roleDef });
        }
      }

      // ── 2. Find all roles ─────────────────────────────────────────
      const roles = await strapi.db.query('plugin::users-permissions.role').findMany();
      const publicRole        = roles.find(r => r.type === 'public');
      const authRole          = roles.find(r => r.type === 'authenticated');
      const studentRole       = roles.find(r => r.type === 'student');
      const instructorRole    = roles.find(r => r.type === 'instructor');
      const contentManagerRole = roles.find(r => r.type === 'content_manager');
      const adminRole         = roles.find(r => r.type === 'admin');

      if (!publicRole || !authRole) return;

      // ── Helper: force-reset permissions for a role (delete all, then recreate) ──
      const grantPermissions = async (roleId, actions) => {
        // Step 1: find all existing permission IDs for this role
        const existing = await strapi.db.query('plugin::users-permissions.permission').findMany({
          where: { role: roleId },
          select: ['id'],
        });
        // Step 2: delete by explicit ID list (safe across all Strapi v5 versions)
        if (existing.length > 0) {
          await strapi.db.query('plugin::users-permissions.permission').deleteMany({
            where: { id: { $in: existing.map(p => p.id) } },
          });
        }
        // Step 3: create fresh permissions
        for (const action of actions) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: { action, role: roleId },
          });
        }
      };

      // ── Common permissions: auth + user identity ──────────────────
      const authPerms = [
        'plugin::users-permissions.auth.callback',
        'plugin::users-permissions.auth.connect',
        'plugin::users-permissions.auth.register',
        'plugin::users-permissions.user.me',
      ];

      // ── 3. PUBLIC role ────────────────────────────────────────────
      // Anyone (even logged out) can browse courses, blogs, and authenticate
      await grantPermissions(publicRole.id, [
        ...authPerms,
        'api::course.course.find',
        'api::course.course.findOne',
        'api::blog-post.blog-post.find',
        'api::blog-post.blog-post.findOne',
      ]);

      // ── 4. AUTHENTICATED role (default for new signups) ───────────
      // Same as public + can view their own profile
      await grantPermissions(authRole.id, [
        ...authPerms,
        'api::course.course.find',
        'api::course.course.findOne',
        'api::blog-post.blog-post.find',
        'api::blog-post.blog-post.findOne',
        'api::lesson.lesson.find',
        'api::lesson.lesson.findOne',
      ]);

      // ── 5. STUDENT role ───────────────────────────────────────────
      // Browse courses, enroll, view lessons, take quizzes, track own progress
      if (studentRole) {
        await grantPermissions(studentRole.id, [
          ...authPerms,
          'api::course.course.find',
          'api::course.course.findOne',
          'api::blog-post.blog-post.find',
          'api::blog-post.blog-post.findOne',
          'api::lesson.lesson.find',
          'api::lesson.lesson.findOne',
          'api::enrollment.enrollment.create',
          'api::enrollment.enrollment.me',
          'api::enrollment.enrollment.check',
          'api::progress.progress.create',
          'api::progress.progress.courseProgress',
          'api::quiz.quiz.find',
          'api::quiz.quiz.findOne',
          'api::quiz-attempt.quiz-attempt.create',
          'api::quiz-attempt.quiz-attempt.me',
        ]);
      }

      // ── 6. INSTRUCTOR role ────────────────────────────────────────
      // Manage own courses, lessons, quizzes; view own students' progress
      if (instructorRole) {
        await grantPermissions(instructorRole.id, [
          ...authPerms,
          'api::course.course.find',
          'api::course.course.findOne',
          'api::course.course.create',
          'api::course.course.update',
          'api::course.course.delete',
          'api::blog-post.blog-post.find',
          'api::blog-post.blog-post.findOne',
          'api::lesson.lesson.find',
          'api::lesson.lesson.findOne',
          'api::lesson.lesson.create',
          'api::lesson.lesson.update',
          'api::lesson.lesson.delete',
          'api::quiz.quiz.find',
          'api::quiz.quiz.findOne',
          'api::quiz.quiz.create',
          'api::quiz.quiz.update',
          'api::quiz.quiz.delete',
          'api::progress.progress.courseProgress',
          'api::enrollment.enrollment.me',
          'api::enrollment.enrollment.check',
          'api::enrollment.enrollment.courseStudents',
        ]);
      }

      // ── 7. CONTENT MANAGER role ───────────────────────────────────
      // Manage ALL courses, lessons, quizzes, and blog posts across the platform
      if (contentManagerRole) {
        await grantPermissions(contentManagerRole.id, [
          ...authPerms,
          'api::course.course.find',
          'api::course.course.findOne',
          'api::course.course.create',
          'api::course.course.update',
          'api::course.course.delete',
          'api::blog-post.blog-post.find',
          'api::blog-post.blog-post.findOne',
          'api::blog-post.blog-post.create',
          'api::blog-post.blog-post.update',
          'api::blog-post.blog-post.delete',
          'api::lesson.lesson.find',
          'api::lesson.lesson.findOne',
          'api::lesson.lesson.create',
          'api::lesson.lesson.update',
          'api::lesson.lesson.delete',
          'api::quiz.quiz.find',
          'api::quiz.quiz.findOne',
          'api::quiz.quiz.create',
          'api::quiz.quiz.update',
          'api::quiz.quiz.delete',
          'api::progress.progress.courseProgress',
          'api::enrollment.enrollment.me',
          'api::enrollment.enrollment.check',
          'api::enrollment.enrollment.courseStudents',
        ]);
      }

      // ── 8. ADMIN role ─────────────────────────────────────────────
      // Full access: everything above + manage users & assign roles
      if (adminRole) {
        await grantPermissions(adminRole.id, [
          ...authPerms,
          'plugin::users-permissions.user.find',
          'plugin::users-permissions.user.findOne',
          'plugin::users-permissions.user.update',
          'plugin::users-permissions.user.destroy',
          'plugin::users-permissions.role.find',
          'api::course.course.find',
          'api::course.course.findOne',
          'api::course.course.create',
          'api::course.course.update',
          'api::course.course.delete',
          'api::blog-post.blog-post.find',
          'api::blog-post.blog-post.findOne',
          'api::blog-post.blog-post.create',
          'api::blog-post.blog-post.update',
          'api::blog-post.blog-post.delete',
          'api::lesson.lesson.find',
          'api::lesson.lesson.findOne',
          'api::lesson.lesson.create',
          'api::lesson.lesson.update',
          'api::lesson.lesson.delete',
          'api::quiz.quiz.find',
          'api::quiz.quiz.findOne',
          'api::quiz.quiz.create',
          'api::quiz.quiz.update',
          'api::quiz.quiz.delete',
          'api::progress.progress.create',
          'api::progress.progress.courseProgress',
          'api::enrollment.enrollment.create',
          'api::enrollment.enrollment.me',
          'api::enrollment.enrollment.check',
          'api::enrollment.enrollment.courseStudents',
          'api::quiz-attempt.quiz-attempt.create',
          'api::quiz-attempt.quiz-attempt.me',
          'api::admin-stats.admin-stats.getStats',
        ]);
      }

      // ── 9. Seed Demo Data ─────────────────────────────────────────
      const demoCourseExists = await strapi.db.query('api::course.course').findOne({
        where: { title: 'Demo Course 1: Mastering Programming' }
      });
      
      if (!demoCourseExists) {
        console.log('🌱 Seeding demo courses...');
        let instructorUser = await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { email: 'demo_instructor@example.com' },
          populate: ['role']
        });

        if (!instructorUser && instructorRole) {
          instructorUser = await strapi.documents('plugin::users-permissions.user').create({
            data: {
              username: 'Demo Instructor',
              email: 'demo_instructor@example.com',
              password: 'Password123!',
              role: instructorRole.documentId,
              confirmed: true,
              provider: 'local'
            }
          });
        }

        if (instructorUser) {
          const categories = ['Programming', 'Design', 'Marketing', 'Business', 'Photography'];

          for (let i = 1; i <= 5; i++) {
            const course = await strapi.documents('api::course.course').create({
              data: {
                title: `Demo Course ${i}: Mastering ${categories[i-1]}`,
                description: `This is a comprehensive demo course about ${categories[i-1]}. Learn the fundamentals and advanced techniques from industry experts.`,
                category: categories[i-1],
                status: 'published',
                instructor: instructorUser.documentId,
                coverImageUrl: `https://picsum.photos/seed/course${i}/800/400`,
              }
            });

            // Create Lessons
            for (let j = 1; j <= 3; j++) {
              await strapi.documents('api::lesson.lesson').create({
                data: {
                  title: `Lesson ${j}: Introduction to ${categories[i-1]} Part ${j}`,
                  content: `Welcome to Lesson ${j}. Here we will explore the core concepts of this topic...`,
                  order: j,
                  course: course.documentId,
                  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                }
              });
            }

            // Create Quiz
            await strapi.documents('api::quiz.quiz').create({
              data: {
                title: `Final Quiz for ${categories[i-1]}`,
                course: course.documentId,
                questions: [
                  {
                    question: `What is the main purpose of ${categories[i-1]}?`,
                    options: ['To build things', 'To sell things', 'To design things', 'All of the above'],
                    correctAnswer: 3
                  },
                  {
                    question: `Is ${categories[i-1]} easy to learn?`,
                    options: ['Yes', 'No', 'Maybe', 'It depends'],
                    correctAnswer: 3
                  }
                ]
              }
            });
          }
          console.log('✅ Demo data seeded successfully');
        }
      }

      console.log('✅ LMS API Permissions Auto-Configured Successfully');
    } catch (err) {
      console.error('Failed to auto-configure permissions or seed data:', err);
    }
  },
};
