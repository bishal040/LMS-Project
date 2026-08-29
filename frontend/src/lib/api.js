import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * Auth API
 */
export const loginUser = async ({ identifier, password }) => {
  const response = await api.post('/auth/local', { identifier, password });
  if (response.data.jwt) {
    localStorage.setItem('jwt', response.data.jwt);
  }
  return response.data;
};

export const registerUser = async ({ username, email, password }) => {
  const response = await api.post('/auth/local/register', { username, email, password });
  if (response.data.jwt) {
    localStorage.setItem('jwt', response.data.jwt);
  }
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/users/me?populate=role');
  return response.data;
};

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('jwt');
  }
  return null;
};

export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt');
  }
};

/**
 * Course API
 */
export const getCourses = async (customFilters = '') => {
  const query = customFilters ? `&${customFilters}` : '';
  const response = await api.get(`/courses?populate=*${query}`);
  return response.data;
};

export const getCourse = async (id) => {
  const response = await api.get(`/courses/${id}?populate=instructor,lessons,quizzes`);
  return response.data;
};

export const createCourse = async (data) => {
  const response = await api.post('/courses', { data });
  return response.data;
};

export const updateCourse = async (id, data) => {
  const response = await api.put(`/courses/${id}`, { data });
  return response.data;
};

export const deleteCourse = async (id) => {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
};

/**
 * Enrollment API
 */
export const enrollInCourse = async (courseId) => {
  const response = await api.post('/enrollments', { data: { course: courseId } });
  return response.data;
};

export const getMyEnrollments = async () => {
  const response = await api.get('/enrollments/me');
  return response.data;
};

export const checkEnrollment = async (courseId) => {
  const response = await api.get(`/enrollments/check/${courseId}`);
  return response.data;
};

/**
 * Get enrolled students with progress for a course (instructor/content manager)
 */
export const getCourseStudents = async (courseId) => {
  const response = await api.get(`/enrollments/course-students/${courseId}`);
  return response.data;
};

/**
 * Progress API
 */
export const markLessonComplete = async (courseId, lessonId) => {
  const response = await api.post('/progresses', { data: { course: courseId, lesson: lessonId } });
  return response.data;
};

export const getCourseProgress = async (courseId) => {
  const response = await api.get(`/progresses/course/${courseId}`);
  return response.data;
};

/**
 * Quiz API
 */
export const getQuiz = async (quizId) => {
  const response = await api.get(`/quizzes/${quizId}?populate=*`);
  return response.data;
};

export const submitQuiz = async (quizId, answers) => {
  const response = await api.post('/quiz-attempts', { data: { quiz: quizId, answers } });
  return response.data;
};

export const getMyQuizAttempts = async (quizId = null) => {
  const url = quizId ? `/quiz-attempts/me?quizId=${quizId}` : '/quiz-attempts/me';
  const response = await api.get(url);
  return response.data;
};

/**
 * Blog API
 */
export const getBlogs = async () => {
  const response = await api.get('/blog-posts?populate=author&sort=publishedAt:desc');
  return response.data;
};

export const getBlog = async (id) => {
  const response = await api.get(`/blog-posts/${id}?populate=author`);
  return response.data;
};

/**
 * Blog CRUD API (Content Manager)
 */
export const createBlog = async (data) => {
  const response = await api.post('/blog-posts', { data });
  return response.data;
};

export const updateBlog = async (id, data) => {
  const response = await api.put(`/blog-posts/${id}`, { data });
  return response.data;
};

export const deleteBlog = async (id) => {
  const response = await api.delete(`/blog-posts/${id}`);
  return response.data;
};

/**
 * Lesson CRUD API (Instructor)
 */
export const getLesson = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}?populate=*`);
  return response.data;
};

export const createLesson = async (data) => {
  const response = await api.post('/lessons', { data });
  return response.data;
};

export const updateLesson = async (id, data) => {
  const response = await api.put(`/lessons/${id}`, { data });
  return response.data;
};

export const deleteLesson = async (id) => {
  const response = await api.delete(`/lessons/${id}`);
  return response.data;
};

/**
 * Quiz CRUD API (Instructor)
 */
export const createQuiz = async (data) => {
  const response = await api.post('/quizzes', { data });
  return response.data;
};

export const updateQuiz = async (id, data) => {
  const response = await api.put(`/quizzes/${id}`, { data });
  return response.data;
};

export const deleteQuiz = async (id) => {
  const response = await api.delete(`/quizzes/${id}`);
  return response.data;
};

/**
 * Admin API
 */
export const getAdminStats = async () => {
  const response = await api.get('/admin-stats');
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/users?populate=role');
  return response.data;
};

export const getRoles = async () => {
  const response = await api.get('/users-permissions/roles');
  return response.data;
};

export const updateUserRole = async (userId, roleId) => {
  const response = await api.put(`/users/${userId}`, { role: roleId });
  return response.data;
};

export default api;
