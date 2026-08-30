const { createStrapi } = require('@strapi/strapi');
(async () => {
  const app = await createStrapi({ distDir: './backend' }).load();
  try {
    const c1 = await app.documents('api::course.course').count();
    console.log('Doc count:', c1);
  } catch (e) {
    console.log('Error with documents.count():', e.message);
  }
  
  try {
    const c2 = await app.db.query('api::course.course').count();
    console.log('DB count:', c2);
  } catch (e) {
    console.log('Error with db.query.count():', e.message);
  }

  process.exit(0);
})();
