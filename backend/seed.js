const { createStrapi } = require('@strapi/strapi');

async function seed() {
  const app = await createStrapi().load();

  console.log('Seeding demo data...');

  try {
    // 1. Get an instructor or admin to own the course
    const users = await app.documents('plugin::users-permissions.user').findMany({
      filters: { role: { type: 'admin' } }
    });
    const instructor = users[0];

    if (!instructor) {
      console.log('No admin found to own the course.');
      process.exit(1);
    }

    // 2. Create Course
    const course = await app.documents('api::course.course').create({
      data: {
        title: 'Mastering Full-Stack Next.js & Strapi',
        description: 'Learn how to build scalable, modern full-stack web applications from scratch.',
        category: 'Web Development',
        coverImageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
        status: 'published',
        instructor: instructor.id,
      },
      status: 'published',
    });
    console.log('Created Course:', course.title);

    // 3. Create Lessons
    await app.documents('api::lesson.lesson').create({
      data: {
        title: 'Introduction to Strapi 5',
        content: 'Strapi 5 is a major upgrade. In this lesson, we explore the new Document API and how it changes content management.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 1,
        course: course.documentId,
      },
      status: 'published',
    });

    await app.documents('api::lesson.lesson').create({
      data: {
        title: 'Next.js App Router Architecture',
        content: 'Understand Server Components, Client Components, and how they interact in the new App Router.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 2,
        course: course.documentId,
      },
      status: 'published',
    });
    console.log('Created 2 Lessons.');

    // 4. Create Quiz
    await app.documents('api::quiz.quiz').create({
      data: {
        title: 'Mid-term Checkpoint',
        course: course.documentId,
        questions: [
          {
            question: 'Which API is introduced in Strapi 5 for managing entries?',
            options: ['Entity Service', 'Query Engine', 'Document API', 'REST Core'],
            correctAnswer: 2
          },
          {
            question: 'What is the default rendering strategy for components in Next.js App Router?',
            options: ['Client Side', 'Server Side', 'Static Site', 'Incremental Static'],
            correctAnswer: 1
          }
        ]
      },
      status: 'published',
    });
    console.log('Created Quiz.');

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
