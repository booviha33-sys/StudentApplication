import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, RefreshCw, Pencil, Trash2, ClipboardList, AlertCircle } from 'lucide-react';
import {
  getMarks,
  createMarks,
  updateMarks,
  deleteMarks,
  type Marks,
} from '../api/marks';
import { getStudents } from '../api/students';
import { getCourses } from '../api/courses';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const emptyForm: Marks = {
  markId: 0,
  studentId: 0,
  courseId: 0,
  examName: '',
  marks: 0,
  totalMarks: 100,
};

export default function MarksPage() {
  const { show } = useToast();
  const [marks, setMarks] = useState<Marks[]>([]);
  const [students, setStudents] = useState<{ id: number; name: string }[]>([]);
  const [courses, setCourses] = useState<{ courseId: number; courseName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Marks>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [m, studs, crs] = await Promise.all([getMarks(), getStudents(), getCourses()]);
      setMarks(m);
      setStudents(studs.map((s) => ({ id: s.id, name: s.name })));
      setCourses(crs.map((c) => ({ courseId: c.courseId, courseName: c.courseName })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load marks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const studentName = (id: number) => students.find((s) => s.id === id)?.name || `#${id}`;
  const courseName = (id: number) => courses.find((c) => c.courseId === id)?.courseName || `#${id}`;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return marks;
    return marks.filter((m) => {
      return (
        String(m.markId).includes(q) ||
        String(m.studentId).includes(q) ||
        String(m.courseId).includes(q) ||
        studentName(m.studentId).toLowerCase().includes(q) ||
        courseName(m.courseId).toLowerCase().includes(q) ||
        m.examName.toLowerCase().includes(q)
      );
    });
  }, [marks, search, students, courses]);

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditing(false);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (m: Marks) => {
    setForm({ ...m });
    setEditing(true);
    setFormError('');
    setModalOpen(true);
  };

  const validate = (): string | null => {
    if (!form.studentId || form.studentId <= 0) return 'Please select a student.';
    if (!form.courseId || form.courseId <= 0) return 'Please select a course.';
    if (!form.examName.trim()) return 'Exam name is required.';
    if (!form.totalMarks || form.totalMarks <= 0) return 'Total marks must be greater than 0.';
    if (form.marks < 0) return 'Marks cannot be negative.';
    if (form.marks > form.totalMarks) return 'Marks cannot be greater than total marks.';
    if (!editing && (!form.markId || form.markId <= 0)) return 'A valid mark ID is required.';
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateMarks(form.markId, {
          studentId: form.studentId,
          courseId: form.courseId,
          examName: form.examName,
          marks: form.marks,
          totalMarks: form.totalMarks,
        });
        show('Marks updated successfully.', 'success');
      } else {
        await createMarks(form);
        show('Marks added successfully.', 'success');
      }
      setModalOpen(false);
      await fetchData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save marks.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await deleteMarks(deleteId);
      show('Marks record deleted successfully.', 'success');
      setDeleteId(null);
      await fetchData();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to delete marks.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const percentage = (marks: number, total: number) => {
    if (!total) return '0%';
    return `${((marks / total) * 100).toFixed(1)}%`;
  };

  return (
    <div>
      <div className="page-header">
        <h2>Marks Management</h2>
        <p>Manage student exam marks — add, edit, search, and delete with validation.</p>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button className="btn btn-secondary" style={{ marginLeft: 'auto' }} onClick={fetchData}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      )}

      <div className="table-wrapper">
        <div className="table-header">
          <h2>All Marks Records ({filtered.length})</h2>
          <div className="table-toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by student, course, exam..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={18} /> Add Marks
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size={28} label="Loading marks..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={32} />}
            title={search ? 'No matching marks records' : 'No marks records yet'}
            message={search ? 'Try adjusting your search.' : 'Click "Add Marks" to create the first record.'}
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Exam</th>
                  <th>Marks</th>
                  <th>Total</th>
                  <th>%</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.markId}>
                    <td>{m.markId}</td>
                    <td>{studentName(m.studentId)}</td>
                    <td>{courseName(m.courseId)}</td>
                    <td>{m.examName}</td>
                    <td><strong>{m.marks}</strong></td>
                    <td>{m.totalMarks}</td>
                    <td>{percentage(m.marks, m.totalMarks)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-icon edit" onClick={() => openEdit(m)} title="Edit">
                        <Pencil size={18} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => setDeleteId(m.markId)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editing ? 'Edit Marks' : 'Add Marks'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave}>
          {formError && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          {!editing && (
            <div className="form-group">
              <label>Marks ID <span className="required">*</span></label>
              <input
                className="form-input"
                type="number"
                value={form.markId || ''}
                onChange={(e) => setForm({ ...form, markId: Number(e.target.value) })}
                disabled={saving}
                placeholder="e.g. 1"
              />
            </div>
          )}

          <div className="form-group">
            <label>Student <span className="required">*</span></label>
            <select
              className="form-select"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: Number(e.target.value) })}
              disabled={saving}
            >
              <option value={0}>Select a student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (#{s.id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Course <span className="required">*</span></label>
            <select
              className="form-select"
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: Number(e.target.value) })}
              disabled={saving}
            >
              <option value={0}>Select a course...</option>
              {courses.map((c) => (
                <option key={c.courseId} value={c.courseId}>
                  {c.courseName} (#{c.courseId})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Exam Name <span className="required">*</span></label>
            <input
              className="form-input"
              type="text"
              value={form.examName}
              onChange={(e) => setForm({ ...form, examName: e.target.value })}
              disabled={saving}
              placeholder="e.g. Internal 1"
            />
          </div>

          <div className="form-group">
            <label>Marks <span className="required">*</span></label>
            <input
              className="form-input"
              type="number"
              value={form.marks || ''}
              onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })}
              disabled={saving}
              placeholder="e.g. 78"
              min="0"
            />
            {form.marks < 0 && <div className="form-error">Marks cannot be negative.</div>}
          </div>

          <div className="form-group">
            <label>Total Marks <span className="required">*</span></label>
            <input
              className="form-input"
              type="number"
              value={form.totalMarks || ''}
              onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
              disabled={saving}
              placeholder="e.g. 100"
              min="1"
            />
            {form.totalMarks > 0 && form.marks > form.totalMarks && (
              <div className="form-error">Marks cannot be greater than total marks.</div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update Marks' : 'Add Marks'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Marks Record"
        message="Are you sure you want to delete this marks record? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
