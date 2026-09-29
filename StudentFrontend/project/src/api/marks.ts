import api from './client';

export interface Marks {
  markId: number;
  studentId: number;
  courseId: number;
  examName: string;
  marks: number;
  totalMarks: number;
}

export async function getMarks(): Promise<Marks[]> {
  const res = await api.get<Marks[]>('/marks');
  return Array.isArray(res.data) ? res.data : [];
}

export async function getMarksById(id: number): Promise<Marks> {
  const res = await api.get<Marks>(`/marks/${id}`);
  return res.data;
}

export async function createMarks(data: Marks): Promise<Marks> {
  const res = await api.post<Marks>('/marks', data);
  return res.data;
}

export async function updateMarks(id: number, data: Partial<Marks>): Promise<Marks> {
  const res = await api.put<Marks>(`/marks/${id}`, data);
  return res.data;
}

export async function deleteMarks(id: number): Promise<void> {
  await api.delete(`/marks/${id}`);
}
