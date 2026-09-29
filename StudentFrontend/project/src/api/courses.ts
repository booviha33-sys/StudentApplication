import api from './client';

export interface Course {
  courseId: number;
  courseName: string;
  department: string;
  duration: number;
  fees: number;
}

export async function getCourses(): Promise<Course[]> {
  const res = await api.get<Course[]>('/courses');
  return Array.isArray(res.data) ? res.data : [];
}

export async function getCourseById(id: number): Promise<Course> {
  const res = await api.get<Course>(`/courses/${id}`);
  return res.data;
}

export async function createCourse(data: Course): Promise<Course> {
  const res = await api.post<Course>('/courses', data);
  return res.data;
}

export async function updateCourse(id: number, data: Course): Promise<Course> {
  const res = await api.put<Course>(`/courses/${id}`, data);
  return res.data;
}

export async function deleteCourse(id: number): Promise<void> {
  await api.delete(`/courses/${id}`);
}
