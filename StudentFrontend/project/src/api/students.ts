import api from './client';

export interface Student {
  id: number;
  name: string;
  email: string;
  course: string;
}

export async function getStudents(): Promise<Student[]> {
  const res = await api.get<Student[]>('/students');
  return Array.isArray(res.data) ? res.data : [];
}

export async function getStudentById(id: number): Promise<Student> {
  const res = await api.get<Student>(`/students/${id}`);
  return res.data;
}

export async function createStudent(data: Student): Promise<Student> {
  const res = await api.post<Student>('/students', data);
  return res.data;
}

export async function updateStudent(id: number, data: Student): Promise<Student> {
  const res = await api.put<Student>(`/students/${id}`, data);
  return res.data;
}

export async function deleteStudent(id: number): Promise<void> {
  await api.delete(`/students/${id}`);
}
