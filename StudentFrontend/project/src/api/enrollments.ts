import api from './client';

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Enrollment {
  enrollmentId: number;
  studentId: number;
  courseId: number;
  enrollmentDate: string;
  status: EnrollmentStatus;
}

export async function getEnrollments(): Promise<Enrollment[]> {
  const res = await api.get<Enrollment[]>('/enrollments');
  return Array.isArray(res.data) ? res.data : [];
}

export async function getEnrollmentById(id: number): Promise<Enrollment> {
  const res = await api.get<Enrollment>(`/enrollments/${id}`);
  return res.data;
}

export async function createEnrollment(data: Enrollment): Promise<Enrollment> {
  const res = await api.post<Enrollment>('/enrollments', data);
  return res.data;
}

export async function updateEnrollment(id: number, data: Partial<Enrollment>): Promise<Enrollment> {
  const res = await api.put<Enrollment>(`/enrollments/${id}`, data);
  return res.data;
}

export async function deleteEnrollment(id: number): Promise<void> {
  await api.delete(`/enrollments/${id}`);
}
